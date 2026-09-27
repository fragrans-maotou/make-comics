import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { getImageProvider } from "./ai";
import {
  LocalImageError,
  normalizeLocalImageBase,
  parseImageResponse,
  resolveImageUrl,
  generateLocalImage,
} from "./local-image";
import { imageProviderKind, textProviderKind } from "./runtime-config";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const ENV_KEYS = [
  "AI_PROVIDER",
  "TEXT_PROVIDER",
  "IMAGE_PROVIDER",
  "TEXT_API_KEY",
  "IMAGE_API_KEY",
  "TOGETHER_API_KEY",
  "OPENAI_API_KEY",
  "LOCAL_IMAGE_BASE_URL",
  "LOCAL_IMAGE_API_KEY",
  "LOCAL_IMAGE_MODEL",
  "LOCAL_IMAGE_SIZE",
  "LOCAL_IMAGE_TIMEOUT_MS",
  "LOCAL_IMAGE_EDITS",
  "LOCAL_TEXT_BASE_URL",
  "LOCAL_TEXT_MODEL",
  "IMAGE_MODEL",
  "TEXT_MODEL",
] as const;

let envQueue: Promise<unknown> = Promise.resolve();

function withEnv(values: Record<string, string | undefined>, fn: () => Promise<void> | void) {
  const job = envQueue.then(async () => {
    const previous = new Map<string, string | undefined>();
    for (const key of ENV_KEYS) previous.set(key, process.env[key]);
    for (const key of ENV_KEYS) delete process.env[key];
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    try {
      await fn();
    } finally {
      for (const [key, value] of previous) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });
  envQueue = job.then(
    () => undefined,
    () => undefined,
  );
  return job;
}

test("local image base URL drops a trailing generations or edits path", () => {
  const plain = normalizeLocalImageBase("http://192.168.31.175:7868/v1");
  assert.equal(plain.generationsUrl, "http://192.168.31.175:7868/v1/images/generations");
  assert.equal(plain.editsUrl, "http://192.168.31.175:7868/v1/images/edits");

  const slashed = normalizeLocalImageBase("http://192.168.31.175:7868/v1/");
  assert.equal(slashed.generationsUrl, plain.generationsUrl);

  const full = normalizeLocalImageBase("http://192.168.31.175:7868/v1/images/generations");
  assert.equal(full.apiRoot, "http://192.168.31.175:7868/v1");
  assert.equal(full.generationsUrl, plain.generationsUrl);

  const edits = normalizeLocalImageBase("http://192.168.31.175:7868/v1/images/edits/");
  assert.equal(edits.editsUrl, plain.editsUrl);
});

test("image URLs resolve against the API root", () => {
  const root = "http://127.0.0.1:9/v1";
  assert.equal(resolveImageUrl("https://cdn.example/a.png", root), "https://cdn.example/a.png");
  assert.equal(resolveImageUrl("/files/panel.png", root), "http://127.0.0.1:9/files/panel.png");
  assert.equal(resolveImageUrl("files/panel.png", root), "http://127.0.0.1:9/v1/files/panel.png");
});

test("image responses accept b64_json and url", () => {
  const b64 = parseImageResponse({ data: [{ b64_json: PNG.toString("base64") }] });
  assert.equal(b64.kind, "b64");
  if (b64.kind === "b64") assert.equal(Buffer.from(b64.data, "base64").toString("base64"), PNG.toString("base64"));

  const url = parseImageResponse({ data: [{ url: "/files/panel.png" }] });
  assert.deepEqual(url, { kind: "url", url: "/files/panel.png" });

  assert.throws(() => parseImageResponse({ data: [{}] }), LocalImageError);
});

test("unset env stays on mock even if other providers were used earlier", async () => {
  await withEnv({}, () => {
    assert.equal(imageProviderKind(), "mock");
    assert.equal(textProviderKind(), "mock");
    assert.equal(getImageProvider().kind, "mock");
  });
});

test("LOCAL_IMAGE_BASE_URL selects local unless IMAGE_PROVIDER is explicit", async () => {
  await withEnv({ LOCAL_IMAGE_BASE_URL: "http://192.168.31.175:7868/v1" }, () => {
    assert.equal(imageProviderKind(), "local");
    assert.equal(textProviderKind(), "mock");
  });
  await withEnv(
    { IMAGE_PROVIDER: "mock", LOCAL_IMAGE_BASE_URL: "http://192.168.31.175:7868/v1" },
    () => {
      assert.equal(imageProviderKind(), "mock");
    },
  );
  await withEnv({ LOCAL_TEXT_BASE_URL: "http://127.0.0.1:9/v1", LOCAL_TEXT_MODEL: "qwen" }, () => {
    assert.equal(textProviderKind(), "local");
  });
});

function listen(handler: http.RequestListener) {
  const server = http.createServer(handler);
  return new Promise<{ base: string; close: () => Promise<void> }>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        base: `http://127.0.0.1:${port}/v1`,
        close: () =>
          new Promise((done) => {
            server.close(() => done());
          }),
      });
    });
  });
}

test("local provider reads b64_json and a relative url", async () => {
  let mode: "b64" | "url" = "b64";
  const seen: Array<{ url?: string; body: string; auth?: string }> = [];
  const server = await listen((req, res) => {
    if (req.url === "/files/panel.png") {
      res.writeHead(200, { "Content-Type": "image/png" });
      res.end(PNG);
      return;
    }
    if (req.method !== "POST" || req.url !== "/v1/images/generations") {
      res.writeHead(404);
      res.end("missing");
      return;
    }
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");
      seen.push({ url: req.url, body, auth: req.headers.authorization });
      res.writeHead(200, { "Content-Type": "application/json" });
      if (mode === "b64") {
        res.end(JSON.stringify({ data: [{ b64_json: PNG.toString("base64") }] }));
      } else {
        res.end(JSON.stringify({ data: [{ url: "/files/panel.png" }] }));
      }
    });
  });

  try {
    await withEnv(
      {
        IMAGE_PROVIDER: "local",
        LOCAL_IMAGE_BASE_URL: `${server.base}/images/generations`,
        LOCAL_IMAGE_API_KEY: "secret-token",
        LOCAL_IMAGE_MODEL: "lan-model",
        LOCAL_IMAGE_SIZE: "1024x1024",
      },
      async () => {
        const first = await generateLocalImage({ prompt: "panel one", width: 1024, height: 1024 });
        assert.equal(first.toString("base64"), PNG.toString("base64"));
        mode = "url";
        const second = await generateLocalImage({ prompt: "panel two", width: 512, height: 512 });
        assert.equal(second.toString("base64"), PNG.toString("base64"));
      },
    );
  } finally {
    await server.close();
  }

  assert.equal(seen.length, 2);
  for (const call of seen) {
    const json = JSON.parse(call.body) as { prompt: string; n: number; size: string; model: string; response_format: string };
    assert.equal(json.n, 1);
    assert.equal(json.size, "1024x1024");
    assert.equal(json.model, "lan-model");
    assert.equal(json.response_format, "b64_json");
    assert.equal(call.auth, "Bearer secret-token");
    assert.match(json.prompt, /panel/);
  }
});

test("local provider surfaces status and a body snippet", async () => {
  const server = await listen((req, res) => {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "gpu busy right now" }));
  });
  try {
    await withEnv({ LOCAL_IMAGE_BASE_URL: server.base, IMAGE_PROVIDER: "local" }, async () => {
      await assert.rejects(
        () => generateLocalImage({ prompt: "nope", width: 1024, height: 1024 }),
        (error: unknown) => {
          assert.ok(error instanceof LocalImageError);
          assert.match(error.message, /503/);
          assert.match(error.message, /gpu busy/);
          assert.match(error.message, /images\/generations/);
          return true;
        },
      );
    });
  } finally {
    await server.close();
  }
});
