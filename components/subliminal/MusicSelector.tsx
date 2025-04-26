"use client";

import { Music } from "lucide-react";
import { MUSIC_TRACKS } from "./constants";
import { useI18n } from "@/locales/client";
import { useSubliminal } from "./SubliminalContext";

export function MusicSelector() {
  const t = useI18n();
  const { selectedMusic, selectMusic } = useSubliminal();

  return (
    <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Music className="mr-2" /> {t("subliminal-maker.select-music")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {MUSIC_TRACKS.map((track) => (
          <button
            key={track.id}
            onClick={() => selectMusic(track)}
            className={`p-4 border-4 border-black text-left transition-transform transform hover:translate-y-[-4px] ${
              selectedMusic.id === track.id
                ? "bg-blue-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white hover:bg-blue-100"
            }`}
          >
            <h3 className="font-bold text-lg">{track.title}</h3>
            <p className="text-sm text-gray-600">{t("subliminal-maker.click-to-select")}</p>
          </button>
        ))}
      </div>
    </section>
  );
} 