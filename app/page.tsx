"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { LandingHero } from "@/components/landing/hero-section";
import { ComicCreationForm } from "@/components/landing/comic-creation-form";
import { ComicPreview } from "@/components/landing/comic-preview";
import { DEFAULT_IDEA } from "@/lib/sample-ideas";

export default function Home() {
  const [idea, setIdea] = useState<string>(DEFAULT_IDEA);
  const [panelCount, setPanelCount] = useState(4);
  const [layout, setLayout] = useState<"vertical" | "grid">("vertical");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-indigo/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>
      <Navbar />
      <main className="flex min-h-[calc(100vh-6rem)] flex-1 flex-col lg:flex-row">
        <div className="flex w-full flex-col justify-center px-4 py-6 sm:px-6 lg:w-1/2 lg:px-12 xl:px-20">
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <LandingHero />
            <div className="mt-5">
              <ComicCreationForm
                idea={idea}
                setIdea={setIdea}
                panelCount={panelCount}
                setPanelCount={setPanelCount}
                layout={layout}
                setLayout={setLayout}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          </div>
        </div>
        <ComicPreview />
      </main>
      <Footer />
    </div>
  );
}
