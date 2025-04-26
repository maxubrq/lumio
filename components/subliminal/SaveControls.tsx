"use client";

import { Save, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { useSubliminal } from "./SubliminalContext";
import { useState } from "react";

export function SaveControls() {
  const t = useI18n();
  const { saveSubliminal } = useSubliminal();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSave = async () => {
    setIsProcessing(true);
    try {
      await saveSubliminal("My Subliminal"); // You might want to add a name input field
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-bold mb-4">{t("subliminal-maker.mix-save")}</h2>

      <div className="flex flex-col md:flex-row gap-4">
        <Button
          onClick={handleSave}
          disabled={isProcessing}
          className="bg-green-500 hover:bg-green-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t("subliminal-maker.processing")}
            </>
          ) : (
            <>
              <Save className="mr-2" />
              {t("subliminal-maker.save-subliminal")}
            </>
          )}
        </Button>

        <Button
          disabled={isProcessing}
          className="bg-pink-500 hover:bg-pink-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform flex-1"
        >
          <Download className="mr-2" />
          {t("subliminal-maker.download-audio")}
        </Button>
      </div>
    </section>
  );
} 