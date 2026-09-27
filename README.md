# 西游四格

把《西游记》取经路上的事，写成现代人视角的 4 到 6 格短篇笑话漫画。唐僧、孙悟空、猪八戒、沙僧和白龙马还是那身行头，脑子却是上班族：KPI、打卡、加班、外卖、导航、团建、996、直播带货。

这个仓库是 [Nutlope/make-comics](https://github.com/Nutlope/make-comics) 的 fork，提交 `234372a`。上游一次调用图像模型画出整页 5 格，对白也画在图里。那样中文容易乱码，改一句台词就要整页重画。这里改成下面这条流水线。

## 流水线

1. 角色外形写在 `config/characters.json`。画风固定为简笔卡通：粗黑线、平涂、简单背景、Q 版比例。
2. 文本模型按点子写出 JSON 剧本：标题、4 到 6 格。每格有英文画面描述、景别、出镜角色，以及中文对白（每句最多 15 字）。结构是先铺垫、最后一格丢包袱。用 Zod 校验，不合格会把错误发回模型再试，最多 3 次。
3. 你先改剧本（对白、画面描述、景别、出镜角色），确认后再出图。
4. 每一格单独生成，图里不要文字和气泡，上方留白。若 `characters/refs/` 里有设定图，它们会按角色表顺序放在参考图列表最前面，提示词里的 “Reference image 1、2…” 与这个顺序一致。没有设定图时，用角色表里的英文外形描述。本地生图默认只把这些外形写进提示词，不上传参考图。
5. 程序把格子拼成竖条长图或田字格，用仓库里的 Noto Sans SC 画气泡和中文。
6. 可以只重画一格。只改对白时点「保存对白」，气泡会重画，格子画面不动。
7. 下载长图 PNG（发给微信、小红书、微博）。PDF 可选，文件名保留中文。

## 本地运行

需要 Node.js 20 以上、pnpm。

```bash
cp .example.env .env
pnpm install
pnpm dev
```

打开 http://localhost:3000。默认 `AI_PROVIDER=mock`，不需要任何账号：

1. 点子栏里已经放了 5 个例子，默认是「唐僧团队年底述职」。
2. 点「生成剧本」，进入可编辑的 4 格剧本。
3. 点「生成画面」。
4. 点「下载长图 PNG」。气泡里的中文是程序画的，不是模型写在像素里的。

图片存在 `data/media/`，故事存在 `data/comics.db`（SQLite，第一次访问自动建表）。这两个目录不会提交。

`pnpm test` 会检查示例剧本、参考图顺序，以及合成图里确实画出了中文。

## 环境变量

模板在 `.example.env`。

| 变量 | 作用 |
|---|---|
| `AI_PROVIDER` | `mock`、`together`、`openai` 或 `local`。不填且没有钥匙、也没有本地地址时就是 `mock`。 |
| `TEXT_PROVIDER` / `IMAGE_PROVIDER` | 单独指定文本或图像供应商。图像不填时，若设置了 `LOCAL_IMAGE_BASE_URL` 就走本地生图，否则跟随 `AI_PROVIDER`。显式写成 `mock` 时仍用占位图。 |
| `TEXT_MODEL` | 剧本模型。Together 下不填则用 `Qwen/Qwen3-235B-A22B-Instruct-2507`。 |
| `TEXT_API_KEY` / `TEXT_BASE_URL` | 文本接口的钥匙和地址。OpenAI 兼容接口用后者。 |
| `IMAGE_MODEL` | 图像模型。Together 下不填则用 `google/flash-image-2.5`。 |
| `IMAGE_API_KEY` / `IMAGE_BASE_URL` | 图像接口。 |
| `IMAGE_WIDTH` / `IMAGE_HEIGHT` | 单格尺寸，默认 1024×1024。 |
| `TOGETHER_API_KEY` | 只填这一把时，Together 的文本和图像都用它。 |
| `SQLITE_PATH` | 数据库文件，默认 `./data/comics.db`。 |
| `S3_UPLOAD_*` | 可选。不填则图片只存在本地。 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | 可选。两把都空着就不登录，本地用户是 `local`。 |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | 可选。不填则不限流。配上之后，非 mock 的出图会按每 7 天 3 次限制。 |

Clerk、Upstash、S3 都不是本地跑通所必需的。

## 换模型

文本和图像可以不是同一家。

Together（剧本默认用更大的通义千问，图像沿用上游的 Flash Image）：

```bash
AI_PROVIDER=together
TOGETHER_API_KEY=你的钥匙
# TEXT_MODEL=Qwen/Qwen3-235B-A22B-Instruct-2507
# IMAGE_MODEL=google/flash-image-2.5
```

剧本改走 DeepSeek，画面仍走 Together：

```bash
TEXT_PROVIDER=openai
TEXT_BASE_URL=https://api.deepseek.com/v1
TEXT_MODEL=deepseek-chat
TEXT_API_KEY=你的钥匙
IMAGE_PROVIDER=together
IMAGE_API_KEY=你的 Together 钥匙
```

`openai` 表示任何 OpenAI 兼容的 `/chat/completions` 和 `/images/generations`。Together 的参考图字段是 `reference_images`，本地设定图会以 data URL 传过去；别的平台若不认这个字段，仍然会按文字外形描述来画。

实现在 `lib/ai.ts` 和 `lib/runtime-config.ts`。

## 本地生图

局域网里如果已经有 OpenAI Images 兼容的服务，画面可以不走 Together。请求由 Next.js 服务端发出，浏览器不会直接访问那台机器，因此没有跨域问题。剧本在没有文本钥匙时仍用示例稿。

在 `.env` 里加上（地址按你的机器改）：

```bash
IMAGE_PROVIDER=local
LOCAL_IMAGE_BASE_URL=http://192.168.31.175:7868/v1
# LOCAL_IMAGE_API_KEY=
# LOCAL_IMAGE_MODEL=
LOCAL_IMAGE_SIZE=1024x1024
LOCAL_IMAGE_TIMEOUT_MS=300000
# LOCAL_IMAGE_EDITS=false
```

`LOCAL_IMAGE_BASE_URL` 写成 `http://192.168.31.175:7868/v1` 或 `http://192.168.31.175:7868/v1/images/generations` 都可以。钥匙只在设置了 `LOCAL_IMAGE_API_KEY` 时才以 Bearer 发送。`LOCAL_IMAGE_MODEL` 不填就不会在请求里带 `model`。单格默认尺寸跟 `IMAGE_WIDTH`×`IMAGE_HEIGHT`（1024×1024）。超时默认 300 秒。

只写了 `LOCAL_IMAGE_BASE_URL`、没有写 `IMAGE_PROVIDER` 时，也会自动用本地生图。`IMAGE_PROVIDER=mock` 则始终是占位图。

这个接口没有标准的参考图字段，所以提示词里会写上唐僧的袈裟和锡杖、悟空的金箍棒、八戒的九齿钉耙、沙僧的降妖宝杖。若你的服务支持 `/v1/images/edits`，把 `LOCAL_IMAGE_EDITS=true`，才会把 `characters/refs/` 里的设定图以 multipart 送过去，默认关闭。

先在你自己的电脑上确认服务通不通：

```bash
curl -s http://192.168.31.175:7868/v1/images/generations \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"a cute chibi monkey, no text","n":1,"size":"1024x1024","response_format":"b64_json"}'
```

连不上或返回非 2xx 时，页面和接口会显示状态码以及一小段响应正文，服务端日志里有实际请求的 URL。

剧本也可以改走局域网里的 OpenAI 兼容文本接口，不填则保持原来的示例剧本或云端文本模型：

```bash
LOCAL_TEXT_BASE_URL=http://127.0.0.1:8000/v1
LOCAL_TEXT_MODEL=本地模型名
# LOCAL_TEXT_API_KEY=
```

## 角色设定图

`config/characters.json` 的 `referenceFiles` 是相对 `characters/refs/` 的文件名，例如 `tangseng.png`。文件不存在就跳过，只使用 `visualDescription`。也可以把 `referenceFiles` 写成 `https://` 开头的地址。

出镜角色会按这个文件里的固定顺序排列，不会按剧本里的先后颠倒。提示词只给真正附上的那些图编号。

## 字体

`assets/fonts/NotoSansSC-Regular.woff` 是 Noto Sans SC 简体常规体，授权是 SIL Open Font License 1.1，全文在 `assets/fonts/OFL.txt`。合成气泡、标题和网页中文都用它。

## 许可证说明

2026-09-27 核对过上游 [Nutlope/make-comics](https://github.com/Nutlope/make-comics)（`234372a`）：仓库里没有 LICENSE 文件，GitHub API 返回的 license 也是 null。所以上游并不是以 MIT 发布的，本 fork 不能替它补一个 MIT 许可证。使用上游代码时请保留对 Nutlope/make-comics 的署名，并以上游作者的授权为准。

随附字体的 OFL 只覆盖字体文件，不覆盖漫画代码。
