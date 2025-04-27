/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  AffirmationTemplate,
  MusicTrack,
  SavedSubliminal,
} from "@/components/subliminal/types";
import {
  AFFIRMATION_TEMPLATES,
  MUSIC_TRACKS,
} from "@/components/subliminal/constants";
import SubliminalMixer from "@/features/SubliminalMixer";
import * as Tone from "tone";
import { DEFAULT_GAIN, DEFAULT_SPEED, DEFAULT_VOLUME } from "@/misc/constants";

export interface SubliminalState {
  // Mixer
  mixer?: SubliminalMixer | undefined;
  lastRecordedAudio?: Blob | undefined;

  // Audio player state
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;

  // Affirmation state
  selectedTemplate: AffirmationTemplate;
  customAffirmations: string;
  selectedAffirmations: string[];

  // Music state
  selectedMusic: MusicTrack;

  // Saved subliminals
  savedSubliminals: SavedSubliminal[];

  // Recorded audio state
  recordedAudio: Blob | null;
  mixedAudio: string | null;

  // Mix settings
  gainValue: number;
  speedValue: number;
  musicGain: number;

  // Mixers
  initMixer: () => Promise<void>;
  soloVoice: () => Promise<void>;
  unsoloVoice: () => void;

  // Audio player actions
  togglePlayPause: () => void;
  toggleMute: () => void;
  setVolume: (value: number) => void;

  // Affirmation actions
  selectTemplate: (template: AffirmationTemplate) => void;
  setCustomAffirmations: (value: string) => void;
  setSelectedAffirmations: (affirmations: string[]) => void;

  // Music actions
  selectMusic: (music: MusicTrack) => void;

  // Recorded audio actions
  setRecordedAudio: (audio: Blob | null) => void;
  mixAudio: (gain?: number, speed?: number, musicGain?: number) => void;

  // Saved subliminals actions
  saveSubliminal: (name: string) => void;
  loadSubliminal: (subliminal: SavedSubliminal) => void;
  deleteSubliminal: (id: string) => void;
}

export const useSubliminalStore = create<SubliminalState>()(
  devtools(
    (set, get) => ({
      // Initial state
      mixer: undefined,
      lastRecordedAudio: undefined,
      isPlaying: false,
      isMuted: false,
      volume: DEFAULT_VOLUME,
      selectedTemplate: AFFIRMATION_TEMPLATES.en[0],
      customAffirmations: "",
      selectedAffirmations: [],
      selectedMusic: MUSIC_TRACKS[0],
      savedSubliminals: [],
      recordedAudio: null,
      mixedAudio: null,
      gainValue: DEFAULT_GAIN,
      speedValue: DEFAULT_SPEED,
      musicGain: DEFAULT_GAIN,
      // Mixers
      initMixer: async () => {
        if (get().mixer) return; // already built
        const m = new SubliminalMixer({
          voiceVolumeDb: -Math.abs(get().gainValue || DEFAULT_GAIN),
          voiceRate: get().speedValue || DEFAULT_SPEED,
        });
        set({ mixer: m });

        // load tracks that are already chosen in UI
        if (get().selectedMusic.src) await m.loadMusic(get().selectedMusic.src);
        if (get().recordedAudio) await m.loadVoice(get().recordedAudio!);

        // keep Tone in-sync when user changes the sliders later
        m.addEventListener("recordingFinished", (e) => {
          const blob: Blob = (e as any).detail?.blob;
          blob && set({ lastRecordedAudio: blob });
        });
      },

      soloVoice: async () => {
        const { mixer } = get();
        await mixer?.soloVoice();
      },

      unsoloVoice: () => {
        const { mixer } = get();
        mixer?.unsoloVoice();
      },

      /* playback helpers */
      startPlayback: async () => {
        const { mixer, initMixer } = get();
        if (!mixer) await initMixer();
        await get().mixer!.start();
        set({ isPlaying: true });
      },

      stopPlayback: async () => {
        const { mixer } = get();
        await mixer?.stop();
        set({ isPlaying: false });
      },

      /* capture helpers */
      startRecording: () => {
        get().mixer?.record();
      },

      stopRecording: async () => {
        const res = await get().mixer?.stopRecording();
        if (res) set({ lastRecordedAudio: res.blob });
      },

      // Audio player actions
      togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      // Affirmation actions
      selectTemplate: (template) => {
        set({ 
          selectedTemplate: template,
          selectedAffirmations: template.affirmations 
        });
        set({ customAffirmations: template.affirmations.join("\n") });
      },
      setCustomAffirmations: (value) => {
        const affirmations = value.split('\n').filter(a => a.trim());
        set({ 
          customAffirmations: value,
          selectedAffirmations: affirmations
        });
      },
      setSelectedAffirmations: (affirmations) => set({ selectedAffirmations: affirmations }),

      /* — modify existing actions so they notify the mixer — */
      selectMusic: async (music) => {
        set({
          selectedMusic: music,
        });

        if (get().mixer && get().selectedMusic.src)
          await get().mixer?.loadMusic(get().selectedMusic.src);
      },

      setRecordedAudio: async (audio) => {
        set({
          recordedAudio: audio,
        });

        if (get().mixer && get().recordedAudio)
          await get().mixer?.loadVoice(get().recordedAudio!);
      },

      setVolume: (value) =>
        set((state) => {
          state.volume = value;
          /* master volume lives in <audio> element or Tone.Destination */
          state.mixer?.setVoiceVolume(Tone.gainToDb(value));
          return state;
        }),

      mixAudio: (gain, speed, musicGain) =>
        set((state) => {
          state.gainValue = gain ?? state.gainValue;
          state.speedValue = speed ?? state.speedValue;
          state.musicGain = musicGain ?? state.musicGain;
          state.mixer?.setVoiceVolume(state.gainValue);
          state.mixer?.setVoiceRate(state.speedValue);
          state.mixer?.setMusicVolume(musicGain ?? state.musicGain);
          return state;
        }),

      // Saved subliminals actions
      saveSubliminal: (name) =>
        set((state) => {
          const newSubliminal: SavedSubliminal = {
            id: Date.now().toString(),
            name,
            template: state.selectedTemplate.id,
            music: state.selectedMusic.id,
            affirmations:
              state.customAffirmations ||
              state.selectedTemplate.affirmations.join("\n"),
            date: new Date().toISOString(),
            hasRecordedAudio: !!state.recordedAudio,
          };
          return {
            savedSubliminals: [...state.savedSubliminals, newSubliminal],
          };
        }),

      loadSubliminal: (subliminal) =>
        set(() => {
          const template =
            AFFIRMATION_TEMPLATES.en.find(
              (t) => t.id === subliminal.template
            ) || AFFIRMATION_TEMPLATES.en[0];
          const music =
            MUSIC_TRACKS.find((m) => m.id === subliminal.music) ||
            MUSIC_TRACKS[0];

          const affirmations = subliminal.affirmations.split('\n').filter(a => a.trim());

          return {
            selectedTemplate: template,
            customAffirmations: subliminal.affirmations,
            selectedAffirmations: affirmations,
            selectedMusic: music,
          };
        }),

      deleteSubliminal: (id) =>
        set((state) => ({
          savedSubliminals: state.savedSubliminals.filter((s) => s.id !== id),
        })),
    }),
    { name: "subliminal-store" }
  )
);
