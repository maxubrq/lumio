"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { useI18n } from "@/locales/client";
import { Play, Pause, Volume2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubliminalStore } from "@/lib/state/SubliminalStore";

/**
 * Preview component
 *
 * Provides controls for previewing the subliminal audio in two modes:
 * 1. Voice preview (solo voice) - shown when recorded audio is available
 * 2. Full preview (voice with music) - shown when both recorded audio and music are available
 */
export function Preview() {
  const t = useI18n();
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isPlayingFull, setIsPlayingFull] = useState(false);

  // Get the necessary state and functions from the store
  const recordedAudio = useSubliminalStore((state) => state.recordedAudio);
  const selectedMusic = useSubliminalStore((state) => state.selectedMusic);
  const gainValue = useSubliminalStore((state) => state.gainValue);
  const speedValue = useSubliminalStore((state) => state.speedValue);
  const musicGainValue = useSubliminalStore((state) => state.musicGain);

  // Audio elements for playback
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const fullAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements when recorded audio or music changes
  useEffect(() => {
    if (recordedAudio) {
      const voiceAudioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();

      const voiceAudio = new Audio(URL.createObjectURL(recordedAudio));
      voiceAudio.playbackRate = speedValue;

      const voiceGain = voiceAudioContext.createGain();
      voiceGain.gain.value = Math.pow(10, gainValue / 20); // Convert dB to linear scale

      const voiceAudioSource =
        voiceAudioContext.createMediaElementSource(voiceAudio);
      voiceAudioSource.connect(voiceGain);
      voiceGain.connect(voiceAudioContext.destination);

      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current.src = "";
      }

      const voicePreviewAudio = new Audio();
      const playVoicePreview = async () => {
        voiceAudio.play();
      };

      const pauseVoicePreview = () => {
        voiceAudio.pause();
      };

      voicePreviewAudio.play = playVoicePreview;
      voicePreviewAudio.pause = pauseVoicePreview;

      voiceAudioRef.current = voicePreviewAudio;

      return () => {
        voiceAudio.pause();
        voiceAudioContext.close();
      };
    }
  }, [recordedAudio, gainValue, speedValue]);

  // Initialize full mix audio when recorded audio or music changes
  useEffect(() => {
    if (recordedAudio && selectedMusic.src) {
      // Create a new AudioContext for mixing
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();

      // Create audio elements for voice and music
      const voiceAudio = new Audio(URL.createObjectURL(recordedAudio));
      const musicAudio = new Audio(selectedMusic.src);

      // Create gain nodes for controlling volume
      const voiceGain = audioContext.createGain();
      const musicGain = audioContext.createGain();

      // Set gain values
      voiceGain.gain.value = Math.pow(10, gainValue / 20); // Convert dB to linear scale
      musicGain.gain.value = Math.pow(10, musicGainValue / 20); // Convert dB to linear scale

      // Create source nodes
      const voiceSource = audioContext.createMediaElementSource(voiceAudio);
      const musicSource = audioContext.createMediaElementSource(musicAudio);

      // Connect nodes
      voiceSource.connect(voiceGain);
      musicSource.connect(musicGain);
      voiceGain.connect(audioContext.destination);
      musicGain.connect(audioContext.destination);

      // Loop
      voiceAudio.loop = true;

      // Set playback rate for voice
      voiceAudio.playbackRate = speedValue;

      // Create a combined audio element for the full mix
      if (fullAudioRef.current) {
        fullAudioRef.current.pause();
      }

      // Store references for cleanup
      const audioElements = [voiceAudio, musicAudio];

      // Function to play both audio elements together
      const playFullMix = async () => {
        voiceAudio.currentTime = 0;
        musicAudio.currentTime = 0;
        await voiceAudio.play();
        await musicAudio.play();
      };

      // Function to pause both audio elements
      const pauseFullMix = () => {
        voiceAudio.pause();
        musicAudio.pause();
      };

      // Create a proxy audio element for the full mix
      const fullMixAudio = new Audio();
      fullMixAudio.play = playFullMix;
      fullMixAudio.pause = pauseFullMix;
      fullMixAudio.addEventListener("ended", () => {
        setIsPlayingFull(false);
      });

      fullAudioRef.current = fullMixAudio;

      return () => {
        audioElements.forEach((audio) => {
          audio.pause();
          audio.src = "";
        });
        audioContext.close();
      };
    }
  }, [recordedAudio, selectedMusic, gainValue, speedValue, musicGainValue]);

  // Play voice preview
  const playVoicePreview = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.play();
      setIsPlayingVoice(true);

      voiceAudioRef.current.onended = () => {
        setIsPlayingVoice(false);
      };
    }
  };

  // Pause voice preview
  const pauseVoicePreview = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      setIsPlayingVoice(false);
    }
  };

  // Play full preview
  const playFullPreview = () => {
    if (fullAudioRef.current) {
      fullAudioRef.current.play();
      setIsPlayingFull(true);
    }
  };

  // Pause full preview
  const pauseFullPreview = () => {
    if (fullAudioRef.current) {
      fullAudioRef.current.pause();
      setIsPlayingFull(false);
    }
  };

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current.src = "";
      }

      if (fullAudioRef.current) {
        fullAudioRef.current.pause();
      }
    };
  }, []);

  // Don't render if there's no recorded audio
  if (!recordedAudio) {
    return null;
  }

  // Determine if we can show the full preview
  const canShowFullPreview = recordedAudio && selectedMusic.src;

  return (
    <motion.div
      className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center text-black">
        <Play className="mr-2" /> {t("subliminal-maker.preview")}
      </h2>

      <div
        className={`grid ${canShowFullPreview ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}
      >
        {/* Voice Preview - Always shown when there's recorded audio */}
        <div className="bg-gray-100 p-4 rounded-lg border-2 border-black">
          <div className="flex items-center mb-3">
            <div className="border-4 border-black px-3 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white flex items-center justify-center mr-3">
              <Volume2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">
              {t("subliminal-maker.voice-preview")}
            </h3>
          </div>

          <Button
            onClick={isPlayingVoice ? pauseVoicePreview : playVoicePreview}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
          >
            {isPlayingVoice ? (
              <Pause className="mr-2" />
            ) : (
              <Play className="mr-2" />
            )}
            {isPlayingVoice
              ? t("subliminal-maker.pause")
              : t("subliminal-maker.play")}
          </Button>
        </div>

        {/* Full Preview - Only shown when both voice and music are available */}
        {canShowFullPreview && (
          <div className="bg-gray-100 p-4 rounded-lg border-2 border-black">
            <div className="flex items-center mb-3">
              <div className="border-4 border-black px-3 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white flex items-center justify-center mr-3">
                <Music className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">
                {t("subliminal-maker.full-preview")}
              </h3>
            </div>

            <Button
              onClick={isPlayingFull ? pauseFullPreview : playFullPreview}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
            >
              {isPlayingFull ? (
                <Pause className="mr-2" />
              ) : (
                <Play className="mr-2" />
              )}
              {isPlayingFull
                ? t("subliminal-maker.pause")
                : t("subliminal-maker.play")}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
