"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { Mic, Square } from "lucide-react";

interface BreathingDialogProps {
  currentAffirmations: string[];
  onStartRecording: () => void;
  onClose: () => void;
}

/**
 * BreathingDialog component
 *
 * Shows a breathing timer and affirmation text before starting the recording.
 * Guides users through 10 deep breaths to help them relax before recording.
 */
export function BreathingDialog({
  currentAffirmations,
  onStartRecording,
  onClose,
}: BreathingDialogProps) {
  const t = useI18n();
  const [breathCount, setBreathCount] = useState(0);
  const [isInhaling, setIsInhaling] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const COLUMN_LINES = 9;

  // Total number of breaths
  const TOTAL_BREATHS = 10;

  // Duration for each breath phase (inhale/exhale) in milliseconds
  const BREATH_DURATION = 4000;

  useEffect(() => {
    let timer: number;
    let breathTimer: number;

    if (isActive && breathCount < TOTAL_BREATHS) {
      timer = window.setInterval(() => {
        setIsInhaling((prev) => !prev);
      }, BREATH_DURATION);

      // Increment breath count after a complete breath cycle
      breathTimer = window.setInterval(() => {
        setBreathCount((prev) => {
          if (prev >= TOTAL_BREATHS - 1) {
            setIsActive(false);
            window.clearInterval(breathTimer);
            return prev;
          }
          return prev + 1;
        });
      }, BREATH_DURATION * 2);

      return () => {
        window.clearInterval(timer);
        window.clearInterval(breathTimer);
      };
    }
  }, [isActive, breathCount]);

  // Timer for recording duration
  useEffect(() => {
    let timer: number;
    
    if (isRecording) {
      startTimeRef.current = Date.now();
      
      timer = window.setInterval(() => {
        if (startTimeRef.current) {
          const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setRecordingTime(elapsedSeconds);
        }
      }, 1000);
      
      return () => {
        window.clearInterval(timer);
        startTimeRef.current = null;
      };
    }
  }, [isRecording]);

  const startBreathing = () => {
    setIsActive(true);
    setIsInhaling(true);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    onStartRecording();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    startTimeRef.current = null;
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const truncatedAffirmations: string[][] = currentAffirmations.reduce<
    string[][]
  >((acc, curr, index) => {
    const rowIndex = Math.floor(index / COLUMN_LINES);
    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }
    acc[rowIndex].push(curr);
    return acc;
  }, []);

  return (
    <motion.div
      className={`fixed inset-0 flex items-center justify-center z-50 ${isRecording ? 'bg-black/90' : 'bg-black/50'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white border-4 border-black p-8 max-w-md w-full mx-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRecording 
            ? t("subliminal-maker.recording-in-progress", {
              time: formatTime(recordingTime)
            })
            : t("subliminal-maker.breathing-exercise")}
        </h2>
        
        {isRecording ? (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-xl">{formatTime(recordingTime)}</span>
            </div>
            
            <p className="mb-6 text-lg">
              {t("subliminal-maker.recording-instructions", {
                time: formatTime(recordingTime)
              })}
            </p>
            
            <Button
              onClick={handleStopRecording}
              className="bg-red-500 hover:bg-red-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
            >
              <Square className="mr-2" />
              {t("subliminal-maker.stop-recording")}
            </Button>
          </div>
        ) : !isActive && breathCount === 0 ? (
          <div className="text-center">
            <p className="mb-4">
              {t("subliminal-maker.breathing-instructions")}
            </p>
            <Button
              onClick={startBreathing}
              className="bg-blue-500 hover:bg-blue-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
            >
              {t("subliminal-maker.start-breathing")}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <motion.div
              className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-black flex items-center justify-center"
              animate={{
                scale: isInhaling ? 1.2 : 1,
                backgroundColor: isInhaling ? "#93c5fd" : "#ffffff",
              }}
              transition={{
                duration: BREATH_DURATION / 1000,
                ease: "easeInOut",
              }}
            >
              <span className="text-2xl font-bold">
                {isInhaling
                  ? t("subliminal-maker.inhale")
                  : t("subliminal-maker.exhale")}
              </span>
            </motion.div>

            <p className="text-lg mb-4">
              {t("subliminal-maker.breath-count", {
                count: breathCount + 1,
                total: TOTAL_BREATHS
              })}
            </p>

            {breathCount >= TOTAL_BREATHS - 1 && !isActive && (
              <div className="space-y-4">
                <p className="text-lg font-medium text-green-600">
                  {t("subliminal-maker.breathing-complete")}
                </p>
                <Button
                  onClick={handleStartRecording}
                  className="bg-red-500 hover:bg-red-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
                >
                  <Mic className="mr-2" />
                  {t("subliminal-maker.start-recording")}
                </Button>
              </div>
            )}
          </div>
        )}

        {!isRecording && (
          <Button
            onClick={onClose}
            variant="outline"
            className="mt-6 w-full border-2 border-black"
          >
            {t("subliminal-maker.cancel")}
          </Button>
        )}
      </motion.div>
      <motion.div className="bg-purple-100 border-4 border-black p-4">
        {truncatedAffirmations.map((affirmations, index) => (
          <ul
            className="list-disc pl-5 space-y-1"
            aria-label={t("subliminal-maker.preview")}
            key={index}
          >
            {affirmations.map((affirmation: string, i: number) => (
              <li key={i}>{affirmation}</li>
            ))}
          </ul>
        ))}
      </motion.div>
    </motion.div>
  );
}
