"use client";

import { Save, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { useSubliminalStore } from "@/lib/state/SubliminalStore";
import type { SubliminalState } from "@/lib/state/SubliminalStore";
import { memo, useState, useCallback } from "react";

interface SaveControlsProps {
  className?: string;
}

/**
 * Component for saving and downloading subliminals.
 * Handles the save and download actions with loading states.
 */
export const SaveControls = memo(function SaveControls({ className = "" }: SaveControlsProps) {
  const t = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use selective state to prevent unnecessary rerenders
  const saveSubliminal = useSubliminalStore((state: SubliminalState) => state.saveSubliminal);
  
  const handleSave = useCallback(async () => {
    setIsProcessing(true);
    try {
      await saveSubliminal("My Subliminal"); // You might want to add a name input field
    } catch (error) {
      console.error("Failed to save subliminal:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [saveSubliminal]);
  
  return (
    <section className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-black">{t("subliminal-maker.mix-save")}</h2>

      <div 
        className="flex flex-col md:flex-row gap-4"
        role="group"
        aria-label={t("subliminal-maker.mix-save")}
      >
        <Button
          onClick={handleSave}
          disabled={isProcessing}
          className="bg-green-500 hover:bg-green-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform flex-1"
          aria-busy={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
              {t("subliminal-maker.processing")}
            </>
          ) : (
            <>
              <Save className="mr-2" aria-hidden="true" />
              {t("subliminal-maker.save-subliminal")}
            </>
          )}
        </Button>

        <Button
          disabled={isProcessing}
          className="bg-pink-500 hover:bg-pink-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform flex-1"
          aria-label={t("subliminal-maker.download-audio")}
        >
          <Download className="mr-2" aria-hidden="true" />
          {t("subliminal-maker.download-audio")}
        </Button>
      </div>
    </section>
  );
}); 