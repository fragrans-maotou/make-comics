"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { FeedbackModal } from "@/components/feedback-modal";

export function Footer() {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <footer className="flex h-auto min-h-8 flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-background px-6 py-2 text-[10px] text-muted-foreground">
        <span>
          改编自{" "}
          <Link
            href="https://github.com/Nutlope/make-comics"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            Nutlope/make-comics
          </Link>
          。中文使用 Noto Sans SC（OFL）。
        </span>
        <button
          onClick={() => setShowFeedback(true)}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border/50 px-2 py-0.5 hover:text-white"
        >
          <MessageSquare className="h-3 w-3" />
          反馈
        </button>
      </footer>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </>
  );
}
