"use client";

import { FileText } from "lucide-react";
import { AFFIRMATION_TEMPLATES } from "./constants";
import { useI18n, useCurrentLocale } from "@/locales/client";
import { useSubliminalStore } from "@/lib/state/subliminal-store";
import type { SubliminalState } from "@/lib/state/subliminal-store";
import { memo } from "react";

interface AffirmationSelectorProps {
  className?: string;
}

/**
 * Component for selecting and customizing affirmations.
 * Allows users to choose from predefined templates or write custom affirmations.
 */
export const AffirmationSelector = memo(function AffirmationSelector({ className = "" }: AffirmationSelectorProps) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const templates = AFFIRMATION_TEMPLATES[currentLocale as keyof typeof AFFIRMATION_TEMPLATES];
  
  // Use selective state to prevent unnecessary rerenders
  const selectedTemplate = useSubliminalStore((state: SubliminalState) => state.selectedTemplate);
  const customAffirmations = useSubliminalStore((state: SubliminalState) => state.customAffirmations);
  const selectTemplate = useSubliminalStore((state: SubliminalState) => state.selectTemplate);
  const setCustomAffirmations = useSubliminalStore((state: SubliminalState) => state.setCustomAffirmations);

  // Memoize the current affirmations list
  const currentAffirmations = customAffirmations
    ? customAffirmations.split("\n").filter((a: string) => a.trim())
    : selectedTemplate.affirmations;

  return (
    <section className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      <h2 className="text-2xl font-bold mb-4 flex items-center text-black">
        <FileText className="mr-2" /> {t("subliminal-maker.select-affirmations")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => selectTemplate(template)}
            className={`p-4 border-4 border-black text-left transition-transform transform hover:translate-y-[-4px] ${
              selectedTemplate.id === template.id
                ? "bg-purple-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white hover:bg-purple-100"
            }`}
            aria-pressed={selectedTemplate.id === template.id}
            aria-label={template.title}
          >
            <h3 className="font-bold text-lg text-black">{template.title}</h3>
            <p className="text-sm text-gray-600">
              {template.affirmations.length} {t("subliminal-maker.affirmations-count")}
            </p>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label 
          htmlFor="custom-affirmations" 
          className="block font-bold mb-2"
        >
          {t("subliminal-maker.customize-affirmations")}
        </label>
        <textarea
          id="custom-affirmations"
          value={customAffirmations}
          onChange={(e) => setCustomAffirmations(e.target.value)}
          placeholder={t("subliminal-maker.customize-placeholder")}
          className="w-full h-32 p-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label={t("subliminal-maker.customize-affirmations")}
        />
      </div>

      <div className="bg-purple-100 border-4 border-black p-4">
        <h3 className="font-bold mb-2">{t("subliminal-maker.preview")}:</h3>
        <ul 
          className="list-disc pl-5 space-y-1"
          aria-label={t("subliminal-maker.preview")}
        >
          {currentAffirmations.map((affirmation: string, i: number) => (
            <li key={i}>{affirmation}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}); 