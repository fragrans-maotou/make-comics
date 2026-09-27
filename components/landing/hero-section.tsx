export function LandingHero() {
  return (
    <header className="relative py-4 sm:py-6 lg:py-0">
      <div className="relative z-10">
        <div className="lg:text-left text-center">
          <p className="mb-4 inline-flex w-fit rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            西游记 · 现代人短漫
          </p>
          <h1 className="mb-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            取经路上的<span className="text-indigo">四格笑话</span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:mx-0 mx-auto">
            唐僧师徒用上班族的脑子赶路。先写出能改的剧本，再逐格画图，中文对白由程序放进气泡，不靠图像模型写字。
          </p>
        </div>
      </div>
    </header>
  );
}
