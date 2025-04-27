"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { useSubliminalStore } from "@/lib/state/SubliminalStore";
import { BreathingDialog } from "./BreathingDialog";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const t = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showBreathingDialog, setShowBreathingDialog] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get the setRecordedAudio function and selected affirmations from the store
  const setRecordedAudio = useSubliminalStore((state) => state.setRecordedAudio);
  const customAffirmations = useSubliminalStore((state) => state.customAffirmations);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Create a blob with the recorded audio
        // The Web Audio API can handle various formats including WAV, MP3, OGG, etc.
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = audioUrl;
        } else {
          const audioPlayer = new Audio(audioUrl);
          audioPlayerRef.current = audioPlayer;
        }
        
        // Set the recorded audio in the store
        setRecordedAudio(audioBlob);
        onRecordingComplete(audioBlob);
        setHasRecording(true);
        setIsPlaying(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(t("subliminal-maker.mic-access-error"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.play();
      setIsPlaying(true);
      
      audioPlayerRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const pauseRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = "";
      audioPlayerRef.current = null;
    }
    setHasRecording(false);
    setIsPlaying(false);
    // Clear the recorded audio in the store
    setRecordedAudio(null);
    onRecordingComplete(new Blob());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = "";
      }
    };
  }, []);

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-bold mb-4 flex items-center text-black">
        <Mic className="mr-2" /> {t("subliminal-maker.record-affirmations")}
      </h2>
      
      <div className="flex flex-col items-center space-y-4">
        {!hasRecording && !isRecording && (
          <Button
            onClick={() => setShowBreathingDialog(true)}
            className="bg-red-500 hover:bg-red-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
          >
            <Mic className="mr-2" />
            {t("subliminal-maker.start-recording")}
          </Button>
        )}
        
        {isRecording && !showBreathingDialog && (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-bold">{formatTime(recordingTime)}</span>
            </div>
            
            <Button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
            >
              <Square className="mr-2" />
              {t("subliminal-maker.stop-recording")}
            </Button>
          </div>
        )}
        
        {hasRecording && !isRecording && (
          <div className="flex items-center space-x-4">
            <Button
              onClick={isPlaying ? pauseRecording : playRecording}
              className="bg-blue-500 hover:bg-blue-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
            >
              {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
              {isPlaying ? t("subliminal-maker.pause-recording") : t("subliminal-maker.play-recording")}
            </Button>
            
            <Button
              onClick={deleteRecording}
              className="bg-red-500 hover:bg-red-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
            >
              <Trash2 className="mr-2" />
              {t("subliminal-maker.delete-recording")}
            </Button>
          </div>
        )}
      </div>
      
      {showBreathingDialog && (
        <BreathingDialog
          currentAffirmations={customAffirmations.split("\n").filter(a => a.trim())}
          onStartRecording={() => {
            startRecording();
          }}
          onClose={() => {
            stopRecording();
            setShowBreathingDialog(false);
          }}
        />
      )}
    </div>
  );
} 