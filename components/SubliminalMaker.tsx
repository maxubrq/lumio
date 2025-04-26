/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AffirmationSelector } from "./subliminal/AffirmationSelector";
import { MusicSelector } from "./subliminal/MusicSelector";
import { AudioPlayer } from "./subliminal/AudioPlayer";
import { SaveControls } from "./subliminal/SaveControls";
import { SavedSubliminalsList } from "./subliminal/SavedSubliminalsList";
import { AudioRecorder } from "./subliminal/AudioRecorder";
import { useI18n } from "@/locales/client";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SubliminalProvider } from "./subliminal/SubliminalContext";
import { useSubliminalStore } from "@/lib/state/subliminal-store";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Tab values for the SubliminalMaker component
 */
type TabValue = 'create' | 'saved';

/**
 * Animation variants for the header elements
 */
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

/**
 * Animation variants for the logo elements
 */
const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 15
    }
  }
};

/**
 * Animation variants for the content elements
 */
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      delay: 0.3
    }
  }
};

/**
 * SubliminalMaker component
 * 
 * Main component for creating and managing subliminal audio.
 * Provides a tabbed interface for creating new subliminals and viewing saved ones.
 */
export default function SubliminalMaker() {
  const t = useI18n();
  const [activeTab, setActiveTab] = useState<TabValue>('create');
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isUsingRecordedAudio, setIsUsingRecordedAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get the mixAudio function from the store
  const mixAudio = useSubliminalStore((state) => state.mixAudio);
  const recordedAudioInStore = useSubliminalStore((state) => state.recordedAudio);

  /**
   * Handles the completion of audio recording
   * @param audioBlob - The recorded audio blob
   */
  const handleRecordingComplete = useCallback((audioBlob: Blob) => {
    setRecordedAudio(audioBlob);
  }, []);

  /**
   * Toggles the use of recorded audio
   */
  const toggleUseRecordedAudio = useCallback(() => {
    setIsUsingRecordedAudio(prev => !prev);
  }, []);
  
  /**
   * Handles the creation of a subliminal by mixing recorded audio with music
   */
  const handleCreateSubliminal = useCallback(() => {
    if (!recordedAudioInStore) {
      toast.error(t("subliminal-maker.no-audio-to-mix"));
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate processing time
      setTimeout(() => {
        mixAudio();
        setIsProcessing(false);
        toast.success(t("subliminal-maker.mix-success"));
      }, 1500);
    } catch (error) {
      setIsProcessing(false);
      toast.error(t("subliminal-maker.mix-error"));
      console.error("Error mixing audio:", error);
    }
  }, [mixAudio, recordedAudioInStore, t]);

  return (
    <SubliminalProvider>
      <motion.div 
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={contentVariants}
      >
        <motion.header 
          className="mb-8"
          variants={headerVariants}
        >
          <div className="flex justify-between items-center mb-4">
            <motion.h1 
              className="text-5xl font-black text-black tracking-tight"
              variants={headerVariants}
            >
              <motion.span 
                className="bg-pink-500 text-white px-4 py-2 rotate-1 inline-block transform"
                variants={logoVariants}
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                LUM
              </motion.span>
              <motion.span 
                className="bg-blue-500 text-white px-4 py-2 -rotate-1 inline-block transform ml-2"
                variants={logoVariants}
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                IO
              </motion.span>
            </motion.h1>
            <motion.div
              variants={logoVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LocaleSwitcher />
            </motion.div>
          </div>
          <motion.p 
            className="text-xl font-bold text-gray-700 border-b-4 border-black pb-2"
            variants={headerVariants}
          >
            {t("subliminal-maker.program-mind")}
          </motion.p>
        </motion.header>

        <motion.div
          variants={contentVariants}
        >
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as TabValue)} 
            className="w-full"
            aria-label={t('subliminal-maker.title')}
          >
            <TabsList className="grid grid-cols-2 mb-6 w-full">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <TabsTrigger
                  value="create"
                  className="text-xl font-bold border-4 border-black bg-yellow-300 hover:bg-yellow-400 data-[state=active]:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {t("subliminal-maker.create-new")}
                </TabsTrigger>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <TabsTrigger
                  value="saved"
                  className="text-xl font-bold border-4 border-black bg-green-300 hover:bg-green-400 data-[state=active]:bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {t("subliminal-maker.saved")}
                </TabsTrigger>
              </motion.div>
            </TabsList>

            <TabsContent value="create" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AffirmationSelector />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <AudioRecorder onRecordingComplete={handleRecordingComplete} />
              </motion.div>

              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <input
                  type="checkbox"
                  id="use-recorded-audio"
                  checked={isUsingRecordedAudio}
                  onChange={toggleUseRecordedAudio}
                  className="h-5 w-5 border-2 border-black"
                  disabled={!recordedAudio}
                  aria-describedby="use-recorded-audio-description"
                />
                <label 
                  htmlFor="use-recorded-audio" 
                  className="font-bold"
                  id="use-recorded-audio-description"
                >
                  {t("subliminal-maker.use-recorded-audio")}
                </label>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <MusicSelector />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center"
              >
                <Button
                  onClick={handleCreateSubliminal}
                  disabled={!recordedAudioInStore || isProcessing}
                  className="bg-purple-500 hover:bg-purple-600 text-white border-4 border-black px-8 py-4 font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform"
                >
                  <Wand2 className="mr-2" />
                  {isProcessing ? t("subliminal-maker.processing") : t("subliminal-maker.create-subliminal")}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <AudioPlayer />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <SaveControls />
              </motion.div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SavedSubliminalsList />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </SubliminalProvider>
  );
}
