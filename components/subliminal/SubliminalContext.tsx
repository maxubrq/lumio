'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AffirmationTemplate, MusicTrack, SavedSubliminal } from './types';
import { AFFIRMATION_TEMPLATES, MUSIC_TRACKS } from './constants';

interface SubliminalContextType {
  // Audio player state
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  
  // Affirmation state
  selectedTemplate: AffirmationTemplate;
  customAffirmations: string;
  
  // Music state
  selectedMusic: MusicTrack;
  
  // Saved subliminals
  savedSubliminals: SavedSubliminal[];
  
  // Audio player actions
  togglePlayPause: () => void;
  toggleMute: () => void;
  setVolume: (value: number[]) => void;
  
  // Affirmation actions
  selectTemplate: (template: AffirmationTemplate) => void;
  setCustomAffirmations: (value: string) => void;
  
  // Music actions
  selectMusic: (music: MusicTrack) => void;
  
  // Saved subliminals actions
  saveSubliminal: (name: string) => void;
  loadSubliminal: (subliminal: SavedSubliminal) => void;
  deleteSubliminal: (id: string) => void;
}

const SubliminalContext = createContext<SubliminalContextType | undefined>(undefined);

export function SubliminalProvider({ children }: { children: React.ReactNode }) {
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  
  // Affirmation state
  const [selectedTemplate, setSelectedTemplate] = useState<AffirmationTemplate>(AFFIRMATION_TEMPLATES.en[0]);
  const [customAffirmations, setCustomAffirmations] = useState('');
  
  // Music state
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack>(MUSIC_TRACKS[0]);
  
  // Saved subliminals state
  const [savedSubliminals, setSavedSubliminals] = useState<SavedSubliminal[]>([]);
  
  // Audio player actions
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
  }, []);
  
  // Affirmation actions
  const selectTemplate = useCallback((template: AffirmationTemplate) => {
    setSelectedTemplate(template);
  }, []);
  
  const handleCustomAffirmationsChange = useCallback((value: string) => {
    setCustomAffirmations(value);
  }, []);
  
  // Music actions
  const selectMusic = useCallback((music: MusicTrack) => {
    setSelectedMusic(music);
  }, []);
  
  // Saved subliminals actions
  const saveSubliminal = useCallback((name: string) => {
    const newSubliminal: SavedSubliminal = {
      id: Date.now().toString(),
      name,
      template: selectedTemplate.id,
      music: selectedMusic.id,
      affirmations: customAffirmations || selectedTemplate.affirmations.join('\n'),
      date: new Date().toISOString(),
      hasRecordedAudio: false, // This would be updated when audio recording is implemented
    };
    
    setSavedSubliminals(prev => [...prev, newSubliminal]);
  }, [selectedTemplate, selectedMusic, customAffirmations]);
  
  const loadSubliminal = useCallback((subliminal: SavedSubliminal) => {
    const template = AFFIRMATION_TEMPLATES.en.find(t => t.id === subliminal.template) || AFFIRMATION_TEMPLATES.en[0];
    const music = MUSIC_TRACKS.find(m => m.id === subliminal.music) || MUSIC_TRACKS[0];
    
    setSelectedTemplate(template);
    setCustomAffirmations(subliminal.affirmations);
    setSelectedMusic(music);
  }, []);
  
  const deleteSubliminal = useCallback((id: string) => {
    setSavedSubliminals(prev => prev.filter(s => s.id !== id));
  }, []);

  const value = {
    // Audio player state
    isPlaying,
    isMuted,
    volume,
    
    // Affirmation state
    selectedTemplate,
    customAffirmations,
    
    // Music state
    selectedMusic,
    
    // Saved subliminals
    savedSubliminals,
    
    // Audio player actions
    togglePlayPause,
    toggleMute,
    setVolume: handleVolumeChange,
    
    // Affirmation actions
    selectTemplate,
    setCustomAffirmations: handleCustomAffirmationsChange,
    
    // Music actions
    selectMusic,
    
    // Saved subliminals actions
    saveSubliminal,
    loadSubliminal,
    deleteSubliminal,
  };

  return (
    <SubliminalContext.Provider value={value}>
      {children}
    </SubliminalContext.Provider>
  );
}

export function useSubliminal() {
  const context = useContext(SubliminalContext);
  if (context === undefined) {
    throw new Error('useSubliminal must be used within a SubliminalProvider');
  }
  return context;
} 