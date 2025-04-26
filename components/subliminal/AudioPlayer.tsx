"use client";

import { useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PLACEHOLDER_AUDIO } from "./constants";
import { useI18n } from "@/locales/client";
import { useSubliminalStore } from "@/lib/state/subliminal-store";
import type { SubliminalState } from "@/lib/state/subliminal-store";

interface AudioPlayerProps {
  className?: string;
}

/**
 * Audio player component for subliminal audio playback.
 * Handles music playback with volume and mute controls.
 */
export function AudioPlayer({ className = "" }: AudioPlayerProps) {
  const t = useI18n();
  const soundRef = useRef<Howl | null>(null);
  
  // Use selective state to prevent unnecessary rerenders
  const isPlaying = useSubliminalStore((state: SubliminalState) => state.isPlaying);
  const isMuted = useSubliminalStore((state: SubliminalState) => state.isMuted);
  const volume = useSubliminalStore((state: SubliminalState) => state.volume);
  const togglePlayPause = useSubliminalStore((state: SubliminalState) => state.togglePlayPause);
  const toggleMute = useSubliminalStore((state: SubliminalState) => state.toggleMute);
  const setVolume = useSubliminalStore((state: SubliminalState) => state.setVolume);

  // Memoize volume change handler
  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
  }, [setVolume]);

  // Initialize and cleanup audio
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.stop();
    }

    try {
      soundRef.current = new Howl({
        src: [PLACEHOLDER_AUDIO],
        html5: true,
        volume: volume / 100,
        mute: isMuted,
        onloaderror: (id, error) => {
          console.error("Failed to load audio:", error);
        }
      });
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }
    };
  }, [isMuted, volume]);

  // Handle play/pause state
  useEffect(() => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        soundRef.current.play();
      } else {
        soundRef.current.pause();
      }
    } catch (error) {
      console.error("Failed to control audio playback:", error);
    }
  }, [isPlaying]);

  return (
    <div className={`flex items-center space-x-4 ${className}`} role="group" aria-label={t("subliminal-maker.preview-audio")}>
      <div
        className="transform transition-transform hover:scale-105 active:scale-95"
      >
        <Button
          onClick={togglePlayPause}
          className="bg-blue-500 hover:bg-blue-600 text-white border-4 border-black px-6 py-2 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          aria-label={isPlaying ? t("subliminal-maker.pause-audio") : t("subliminal-maker.preview-audio")}
        >
          {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isPlaying ? t("subliminal-maker.pause-audio") : t("subliminal-maker.preview-audio")}
        </Button>
      </div>

      <div
        className="transform transition-transform hover:scale-105 active:scale-95"
      >
        <Button
          onClick={toggleMute}
          variant="outline"
          className="border-4 border-black px-3 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white"
          aria-label={isMuted ? t("subliminal-maker.preview-audio") : t("subliminal-maker.pause-audio")}
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
        </Button>
      </div>

      <div className="flex-1 ml-4">
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="border-2 border-black"
          aria-label={t("subliminal-maker.preview-audio")}
        />
      </div>
    </div>
  );
} 