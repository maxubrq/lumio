"use client";

import { Music } from "lucide-react";
import { MUSIC_TRACKS } from "./constants";
import { useI18n } from "@/locales/client";
import { useSubliminalStore } from "@/lib/state/subliminal-store";
import type { SubliminalState } from "@/lib/state/subliminal-store";
import { memo, useEffect, useRef, useState } from "react";

interface MusicSelectorProps {
  className?: string;
  previewDuration?: number; // Duration in seconds to play the preview
}

/**
 * Component for selecting background music tracks.
 * Allows users to choose from predefined music tracks.
 */
export const MusicSelector = memo(function MusicSelector({ 
  className = "",
  previewDuration = 30 // Default preview duration of 30 seconds
}: MusicSelectorProps) {
  const t = useI18n();
  
  // Use selective state to prevent unnecessary rerenders
  const selectedMusic = useSubliminalStore((state: SubliminalState) => state.selectedMusic);
  const selectMusic = useSubliminalStore((state: SubliminalState) => state.selectMusic);
  const isPlaying = useSubliminalStore((state: SubliminalState) => state.isPlaying);
  const togglePlayPause = useSubliminalStore((state: SubliminalState) => state.togglePlayPause);
  
  // Refs for audio element and timer
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for tracking progress
  const [progress, setProgress] = useState(0);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  
  // Handle music selection and playback
  const handleMusicSelect = (track: typeof MUSIC_TRACKS[0]) => {
    // Select the music track
    selectMusic(track);
    
    // Create a new audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    // Set the audio source to the selected track
    audioRef.current.src = track.src;
    
    // Play the audio
    audioRef.current.play().catch(error => {
      console.error("Error playing audio:", error);
    });
    
    // Set playing state to true
    if (!isPlaying) {
      togglePlayPause();
    }
    
    // Set the currently playing track ID
    setCurrentlyPlayingId(track.id);
    
    // Reset progress
    setProgress(0);
    
    // Clear any existing timer and interval
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Set up progress interval
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / previewDuration);
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 1000);
    
    // Set a timer to stop playback after the specified duration
    timerRef.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Set playing state to false
      if (isPlaying) {
        togglePlayPause();
      }
      
      // Clear the progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Reset progress and currently playing ID
      setProgress(0);
      setCurrentlyPlayingId(null);
    }, previewDuration * 1000);
  };
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Clear the timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Clear the progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Stop and clean up the audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);
  
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
          <div key={track.id} className="flex flex-col">
            <button
              onClick={() => handleMusicSelect(track)}
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
            
            {/* Progress bar */}
            {currentlyPlayingId === track.id && (
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 ease-linear"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}); 