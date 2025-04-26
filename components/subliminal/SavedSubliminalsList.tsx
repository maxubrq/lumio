"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { useSubliminal } from "./SubliminalContext";

export function SavedSubliminalsList() {
  const t = useI18n();
  const { savedSubliminals, loadSubliminal, deleteSubliminal } = useSubliminal();

  if (savedSubliminals.length === 0) {
    return (
      <div className="bg-white border-4 border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-bold mb-2">{t("subliminal-maker.no-saved")}</h2>
        <p className="mb-4">
          {t("subliminal-maker.create-first")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-bold mb-4">{t("subliminal-maker.your-saved")}</h2>

      <div className="space-y-4">
        {savedSubliminals.map((subliminal) => (
          <div
            key={subliminal.id}
            className="border-4 border-black p-4 bg-yellow-100 hover:bg-yellow-200 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{subliminal.name}</h3>
                <p className="text-sm">{t("subliminal-maker.created")}: {subliminal.date}</p>
                <p className="text-sm mt-1">
                  <span className="font-semibold">{t("subliminal-maker.template")}:</span>{" "}
                  {subliminal.template} |
                  <span className="font-semibold ml-1">{t("subliminal-maker.music")}:</span>{" "}
                  {subliminal.music}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => loadSubliminal(subliminal)}
                  className="bg-green-500 hover:bg-green-600 text-white border-2 border-black px-3 py-1 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
                >
                  {t("subliminal-maker.load")}
                </Button>
                <Button
                  onClick={() => deleteSubliminal(subliminal.id)}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-white border-2 border-black px-3 py-1 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
                >
                  {t("subliminal-maker.delete")}
                </Button>
              </div>
            </div>

            <div className="mt-2 text-sm line-clamp-2 text-gray-700">
              {subliminal.affirmations}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 