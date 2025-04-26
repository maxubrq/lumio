"use client";

import { Music } from "lucide-react";
import { MUSIC_TRACKS } from "./constants";
import { useI18n } from "@/locales/client";
import { useSubliminalStore } from "@/lib/state/subliminal-store";
import type { SubliminalState } from "@/lib/state/subliminal-store";
import { memo } from "react";

interface MusicSelectorProps {
  className?: string;
}

/**
 * Component for selecting background music tracks.
 * Allows users to choose from predefined music tracks.
 */
export const MusicSelector = memo(function MusicSelector({ className = "" }: MusicSelectorProps) {
  const t = useI18n();
  
  // Use selective state to prevent unnecessary rerenders
  const selectedMusic = useSubliminalStore((state: SubliminalState) => state.selectedMusic);
  const selectMusic = useSubliminalStore((state: SubliminalState) => state.selectMusic);

  return (
    <section className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      <h2 className="text-2xl font-bold mb-4 flex items-center text-black">
        <Music className="mr-2" /> {t("subliminal-maker.select-music")}
      </h2>

      <div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        role="radiogroup"
        aria-label={t("subliminal-maker.select-music")}
      >
        {MUSIC_TRACKS.map((track) => (
          <button
            key={track.id}
            onClick={() => selectMusic(track)}
            className={`p-4 border-4 border-black text-left transition-transform transform hover:translate-y-[-4px] ${
              selectedMusic.id === track.id
                ? "bg-blue-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white hover:bg-blue-100"
            }`}
            role="radio"
            aria-checked={selectedMusic.id === track.id}
            aria-label={track.title}
          >
            <h3 className="font-bold text-lg text-black">{track.title}</h3>
            <p className="text-sm text-gray-600">{t("subliminal-maker.click-to-select")}</p>
          </button>
        ))}
      </div>
    </section>
  );
}); 