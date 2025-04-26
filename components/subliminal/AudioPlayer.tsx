/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useCallback } from "react";
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
 * Handles music playback with volume and mute controls using Web Audio API.
 */
export function AudioPlayer({ className = "" }: AudioPlayerProps) {
  const t = useI18n();
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Use selective state to prevent unnecessary rerenders
  const isPlaying = useSubliminalStore(
    (state: SubliminalState) => state.isPlaying
  );
  const isMuted = useSubliminalStore((state: SubliminalState) => state.isMuted);
  const volume = useSubliminalStore((state: SubliminalState) => state.volume);
  const mixedAudio = useSubliminalStore(
    (state: SubliminalState) => state.mixedAudio
  );
  const togglePlayPause = useSubliminalStore(
    (state: SubliminalState) => state.togglePlayPause
  );
  const toggleMute = useSubliminalStore(
    (state: SubliminalState) => state.toggleMute
  );
  const setVolume = useSubliminalStore(
    (state: SubliminalState) => state.setVolume
  );

  // Memoize volume change handler
  const handleVolumeChange = useCallback(
    (value: number[]) => {
      setVolume(value[0]);
    },
    [setVolume]
  );

  // Initialize and cleanup audio
  useEffect(() => {
    // Clean up previous audio context and element
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = "";
    }

    try {
      // Create new audio context
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();

      // Create gain node for volume control
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);

      // Create audio element
      const audioElement = new Audio();
      audioElementRef.current = audioElement;

      // Use mixed audio if available, otherwise use placeholder
      const audioSource = mixedAudio || PLACEHOLDER_AUDIO;
      audioElement.src = audioSource;

      // Connect audio element to gain node
      const source =
        audioContextRef.current.createMediaElementSource(audioElement);
      source.connect(gainNodeRef.current);

      // Set initial volume and mute state
      gainNodeRef.current.gain.value = isMuted ? 0 : volume / 100;

      // Handle audio ended event
      audioElement.onended = () => {
        if (isPlaying) {
          togglePlayPause();
        }
      };
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }

    return () => {
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }

      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
      }
    };
  }, [mixedAudio, isMuted, volume, togglePlayPause]);

  // Handle play/pause state
  useEffect(() => {
    if (!audioElementRef.current) return;

    try {
      if (isPlaying) {
        // Resume audio context if it was suspended
        if (audioContextRef.current?.state === "suspended") {
          audioContextRef.current.resume();
        }
        audioElementRef.current.play();
      } else {
        audioElementRef.current.pause();
      }
    } catch (error) {
      console.error("Failed to control audio playback:", error);
    }
  }, [isPlaying]);

  // Handle volume and mute changes
  useEffect(() => {
    if (!gainNodeRef.current) return;

    try {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume / 100;
    } catch (error) {
      console.error("Failed to update audio volume:", error);
    }
  }, [isMuted, volume]);

  return (
    <div
      className={`flex items-center space-x-4 ${className}`}
      role="group"
      aria-label={t("subliminal-maker.preview-audio")}
    >
      <div className="transform transition-transform hover:scale-105 active:scale-95">
        <Button
          onClick={togglePlayPause}
          className="bg-blue-500 hover:bg-blue-600 text-white border-4 border-black px-6 py-2 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          aria-label={
            isPlaying
              ? t("subliminal-maker.pause-audio")
              : t("subliminal-maker.preview-audio")
          }
        >
          {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isPlaying
            ? t("subliminal-maker.pause-audio")
            : t("subliminal-maker.preview-audio")}
        </Button>
      </div>

      <div className="transform transition-transform hover:scale-105 active:scale-95">
        <Button
          onClick={toggleMute}
          variant="outline"
          className="border-4 border-black px-3 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white"
          aria-label={
            isMuted
              ? t("subliminal-maker.preview-audio")
              : t("subliminal-maker.pause-audio")
          }
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
