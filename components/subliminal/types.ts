export interface AffirmationTemplate {
  id: string;
  title: string;
  affirmations: string[];
}

export interface MusicTrack {
  id: string;
  title: string;
  src: string;
}

export interface SavedSubliminal {
  id: string;
  name: string;
  template: string;
  music: string;
  affirmations: string;
  date: string;
  hasRecordedAudio: boolean;
}

export interface AudioPlayerProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onVolumeChange: (value: number[]) => void;
}

export interface AffirmationSelectorProps {
  selectedTemplate: AffirmationTemplate;
  customAffirmations: string;
  onTemplateSelect: (template: AffirmationTemplate) => void;
  onCustomAffirmationsChange: (value: string) => void;
}

export interface MusicSelectorProps {
  selectedMusic: MusicTrack;
  onMusicSelect: (music: MusicTrack) => void;
}

export interface SavedSubliminalsListProps {
  savedSubliminals: SavedSubliminal[];
  onLoadSubliminal: (subliminal: SavedSubliminal) => void;
  onDeleteSubliminal: (id: string) => void;
} 