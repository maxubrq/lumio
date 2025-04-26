/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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

export default function SubliminalMaker() {
  const t = useI18n();
  const [activeTab, setActiveTab] = useState("create");
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [useRecordedAudio, setUseRecordedAudio] = useState(false);

  const handleRecordingComplete = (audioBlob: Blob) => {
    setRecordedAudio(audioBlob);
  };

  const toggleUseRecordedAudio = () => {
    setUseRecordedAudio(!useRecordedAudio);
  };

  return (
    <SubliminalProvider>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-5xl font-black text-black tracking-tight">
              <span className="bg-pink-500 text-white px-4 py-2 rotate-1 inline-block transform">
                LUM
              </span>
              <span className="bg-blue-500 text-white px-4 py-2 -rotate-1 inline-block transform ml-2">
                IO
              </span>
            </h1>
            <LocaleSwitcher />
          </div>
          <p className="text-xl font-bold text-gray-700 border-b-4 border-black pb-2">
            {t("subliminal-maker.program-mind")}
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 w-full">
            <TabsTrigger
              value="create"
              className="text-xl font-bold border-4 border-black bg-yellow-300 hover:bg-yellow-400 data-[state=active]:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {t("subliminal-maker.create-new")}
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="text-xl font-bold border-4 border-black bg-green-300 hover:bg-green-400 data-[state=active]:bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {t("subliminal-maker.saved")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-8">
            <AffirmationSelector />

            <AudioRecorder onRecordingComplete={handleRecordingComplete} />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-recorded-audio"
                checked={useRecordedAudio}
                onChange={toggleUseRecordedAudio}
                className="h-5 w-5 border-2 border-black"
                disabled={!recordedAudio}
              />
              <label htmlFor="use-recorded-audio" className="font-bold">
                {t("subliminal-maker.use-recorded-audio")}
              </label>
            </div>

            <MusicSelector />

            <AudioPlayer />

            <SaveControls />
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <SavedSubliminalsList />
          </TabsContent>
        </Tabs>
      </div>
    </SubliminalProvider>
  );
}
