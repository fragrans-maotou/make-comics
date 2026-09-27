import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { CastGallery } from "@/components/landing/cast-gallery";

export default function CharactersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">角色设定</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Q 版，大头小身，别画成正经大人。换成自己的图后刷新即可，文件名保持不变。
            </p>
          </div>
          <Link href="/" className="text-xs text-muted-foreground hover:text-white">
            回首页写一集
          </Link>
        </div>
        <CastGallery />
      </main>
    </div>
  );
}
