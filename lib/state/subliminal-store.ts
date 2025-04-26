import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AffirmationTemplate, MusicTrack, SavedSubliminal } from '@/components/subliminal/types'
import { AFFIRMATION_TEMPLATES, MUSIC_TRACKS } from '@/components/subliminal/constants'

export interface SubliminalState {
  // Audio player state
  isPlaying: boolean
  isMuted: boolean
  volume: number
  
  // Affirmation state
  selectedTemplate: AffirmationTemplate
  customAffirmations: string
  
  // Music state
  selectedMusic: MusicTrack
  
  // Saved subliminals
  savedSubliminals: SavedSubliminal[]
  
  // Audio player actions
  togglePlayPause: () => void
  toggleMute: () => void
  setVolume: (value: number) => void
  
  // Affirmation actions
  selectTemplate: (template: AffirmationTemplate) => void
  setCustomAffirmations: (value: string) => void
  
  // Music actions
  selectMusic: (music: MusicTrack) => void
  
  // Saved subliminals actions
  saveSubliminal: (name: string) => void
  loadSubliminal: (subliminal: SavedSubliminal) => void
  deleteSubliminal: (id: string) => void
}

export const useSubliminalStore = create<SubliminalState>()(
  devtools(
    (set) => ({
      // Initial state
      isPlaying: false,
      isMuted: false,
      volume: 0.5,
      selectedTemplate: AFFIRMATION_TEMPLATES.en[0],
      customAffirmations: '',
      selectedMusic: MUSIC_TRACKS[0],
      savedSubliminals: [],

      // Audio player actions
      togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setVolume: (value) => set({ volume: value }),

      // Affirmation actions
      selectTemplate: (template) => set({ selectedTemplate: template }),
      setCustomAffirmations: (value) => set({ customAffirmations: value }),

      // Music actions
      selectMusic: (music) => set({ selectedMusic: music }),

      // Saved subliminals actions
      saveSubliminal: (name) => set((state) => {
        const newSubliminal: SavedSubliminal = {
          id: Date.now().toString(),
          name,
          template: state.selectedTemplate.id,
          music: state.selectedMusic.id,
          affirmations: state.customAffirmations || state.selectedTemplate.affirmations.join('\n'),
          date: new Date().toISOString(),
          hasRecordedAudio: false
        }
        return { savedSubliminals: [...state.savedSubliminals, newSubliminal] }
      }),

      loadSubliminal: (subliminal) => set(() => {
        const template = AFFIRMATION_TEMPLATES.en.find(t => t.id === subliminal.template) || AFFIRMATION_TEMPLATES.en[0]
        const music = MUSIC_TRACKS.find(m => m.id === subliminal.music) || MUSIC_TRACKS[0]
        
        return {
          selectedTemplate: template,
          customAffirmations: subliminal.affirmations,
          selectedMusic: music
        }
      }),

      deleteSubliminal: (id) => set((state) => ({
        savedSubliminals: state.savedSubliminals.filter(s => s.id !== id)
      }))
    }),
    { name: 'subliminal-store' }
  )
) 