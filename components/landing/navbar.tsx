"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Library } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const onStories = pathname === "/stories";

  return (
    <nav className="z-50 flex h-14 w-full items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md sm:h-16 sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80">
        <img src="/images/makecomics-logo.svg" alt="" className="h-8 w-8 object-contain" />
        <span className="text-lg tracking-tight text-white">西游四格</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="https://github.com/Nutlope/make-comics"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-panel glass-panel-hover flex items-center gap-2 rounded-md px-3 py-1.5 text-xs"
          title="上游项目 Nutlope/make-comics"
        >
          <GithubIcon className="h-4 w-4" />
          <span className="hidden text-muted-foreground sm:inline">上游</span>
        </Link>
        <Link
          href="/characters"
          className="glass-panel glass-panel-hover flex items-center gap-2 rounded-md px-3 py-1.5 text-xs"
        >
          <span className="text-muted-foreground">角色</span>
        </Link>
        <Link
          href={onStories ? "/" : "/stories"}
          className="glass-panel glass-panel-hover flex items-center gap-2 rounded-md px-3 py-1.5 text-xs"
        >
          {onStories ? <Plus className="h-4 w-4" /> : <Library className="h-4 w-4" />}
          <span className="hidden text-muted-foreground sm:inline">{onStories ? "新的一集" : "我的漫画"}</span>
        </Link>
      </div>
    </nav>
  );
}
