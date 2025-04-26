"use client";

import { useEffect, useRef } from "react";
import { Howl } from "howler";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PLACEHOLDER_AUDIO } from "./constants";
import { useI18n } from "@/locales/client";
import { useSubliminal } from "./SubliminalContext";

export function AudioPlayer() {
  const t = useI18n();
  const soundRef = useRef<Howl | null>(null);
  const { isPlaying, isMuted, volume, togglePlayPause, toggleMute, setVolume } = useSubliminal();

  // Handle audio playback
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.stop();
    }

    // In a real app, you would mix the affirmations with the music
    // For this demo, we'll just play the music track
    soundRef.current = new Howl({
      src: [PLACEHOLDER_AUDIO],
      html5: true,
      volume: volume / 100,
      mute: isMuted,
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }
    };
  }, [isMuted, volume]);

  useEffect(() => {
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.play();
      } else {
        soundRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="flex items-center space-x-4">
      <Button
        onClick={togglePlayPause}
        className="bg-blue-500 hover:bg-blue-600 text-white border-4 border-black px-6 py-2 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
      >
        {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
        {isPlaying ? t("subliminal-maker.pause-audio") : t("subliminal-maker.preview-audio")}
      </Button>

      <Button
        onClick={toggleMute}
        variant="outline"
        className="border-4 border-black px-3 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform bg-white"
      >
        {isMuted ? <VolumeX /> : <Volume2 />}
      </Button>

      <div className="flex-1 ml-4">
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={setVolume}
          className="border-2 border-black"
        />
      </div>
    </div>
  );
} 