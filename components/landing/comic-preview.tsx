export function ComicPreview() {
  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden border-t border-border py-8 lg:w-1/2 lg:border-t-0 lg:border-l lg:py-0">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="max-h-[70vh] overflow-y-auto rounded-md border-4 border-black bg-[#f6f1e4] shadow-2xl">
          <img src="/sample-strip.png" alt="年底述职示例长图" className="w-full" />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          示例：唐僧团队年底述职。格子是占位画，对白是程序画上去的。
        </p>
      </div>
    </div>
  );
}
