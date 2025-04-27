"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { useSubliminalStore } from "@/lib/state/SubliminalStore";
import type { SubliminalState } from "@/lib/state/SubliminalStore";
import type { SavedSubliminal } from './types';
import { memo } from "react";

interface SavedSubliminalsListProps {
  className?: string;
}

/**
 * Component for displaying and managing saved subliminals.
 * Shows a list of saved subliminals with options to load or delete them.
 */
export const SavedSubliminalsList = memo(function SavedSubliminalsList({ className = "" }: SavedSubliminalsListProps) {
  const t = useI18n();
  
  // Use selective state to prevent unnecessary rerenders
  const savedSubliminals = useSubliminalStore((state: SubliminalState) => state.savedSubliminals);
  const loadSubliminal = useSubliminalStore((state: SubliminalState) => state.loadSubliminal);
  const deleteSubliminal = useSubliminalStore((state: SubliminalState) => state.deleteSubliminal);

  if (savedSubliminals.length === 0) {
    return (
      <div className={`bg-white border-4 border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
        <h2 className="text-2xl font-bold mb-2 text-black">{t("subliminal-maker.no-saved")}</h2>
        <p className="mb-4 text-gray-700">
          {t("subliminal-maker.create-first")}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-black">{t("subliminal-maker.your-saved")}</h2>

      <div 
        className="space-y-4"
        role="list"
        aria-label={t("subliminal-maker.your-saved")}
      >
        {savedSubliminals.map((subliminal: SavedSubliminal) => (
          <div
            key={subliminal.id}
            className="border-4 border-black p-4 bg-yellow-100 hover:bg-yellow-200 transition-colors"
            role="listitem"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-black">{subliminal.name}</h3>
                <p className="text-sm text-gray-700">
                  {t("subliminal-maker.created")}: {new Date(subliminal.date).toLocaleString()}
                </p>
                <p className="text-sm mt-1 text-gray-700">
                  <span className="font-semibold">{t("subliminal-maker.template")}:</span>{' '}
                  {subliminal.template} |
                  <span className="font-semibold ml-1">{t("subliminal-maker.music")}:</span>{' '}
                  {subliminal.music}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => loadSubliminal(subliminal)}
                  className="bg-green-500 hover:bg-green-600 text-white border-2 border-black px-3 py-1 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
                  aria-label={`${t("subliminal-maker.load")} ${subliminal.name}`}
                >
                  {t("subliminal-maker.load")}
                </Button>
                <Button
                  onClick={() => deleteSubliminal(subliminal.id)}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-white border-2 border-black px-3 py-1 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
                  aria-label={`${t("subliminal-maker.delete")} ${subliminal.name}`}
                >
                  {t("subliminal-maker.delete")}
                </Button>
              </div>
            </div>

            <div 
              className="mt-2 text-sm line-clamp-2 text-gray-700"
              aria-label={t("subliminal-maker.preview")}
            >
              {subliminal.affirmations}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}); 