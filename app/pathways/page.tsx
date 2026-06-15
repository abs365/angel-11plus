"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import PathwayCard from "@/components/PathwayCard";
import { PATHWAYS } from "@/lib/pathways";
import { getSelectedPathwayId, setSelectedPathway } from "@/lib/progress";

export default function PathwaysPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | undefined>();

  useEffect(() => {
    setSelected(getSelectedPathwayId());
  }, []);

  function handleSelect(id: string) {
    setSelected(id);
    setSelectedPathway(id);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <span className="text-gray-200 dark:text-gray-700 mx-1">/</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Choose Your Pathway</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16 pt-6">
        {/* Intro */}
        <div className="mb-6 flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
            <MapPin size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your 11+ Pathway</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              Select the exam pathway that matches your target school. This helps us tailor your practice sessions. You can change it at any time.
            </p>
          </div>
        </div>

        {/* Pathway cards */}
        <div className="flex flex-col gap-4">
          {PATHWAYS.map((pathway) => (
            <PathwayCard
              key={pathway.id}
              pathway={pathway}
              selected={selected === pathway.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Legal disclaimer */}
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed px-4">
          Angel 11+ provides original exam-style practice content and is not affiliated with or endorsed by GL Assessment, CEM, CSSE, ISEB, or any school or exam board.
        </p>
      </main>
    </div>
  );
}
