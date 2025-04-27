"use client"

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { motion } from 'motion/react'
import { useI18n } from '@/locales/client'
import { Volume2, Zap, Music } from 'lucide-react'

interface MixControllerProps {
  onGainChange: (value: number) => void
  onSpeedChange: (value: number) => void
  onMusicGainChange: (value: number) => void
}

/**
 * MixController component
 * 
 * Provides controls for adjusting the gain (volume) and speed of the voice in the subliminal mix,
 * as well as the gain of the background music.
 */
export function MixController({ onGainChange, onSpeedChange, onMusicGainChange }: MixControllerProps) {
  const t = useI18n()
  const [gain, setGain] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [musicGain, setMusicGain] = useState(0)

  const handleGainChange = (value: number[]) => {
    setGain(value[0])
    onGainChange(value[0])
  }

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0])
    onSpeedChange(value[0])
  }

  const handleMusicGainChange = (value: number[]) => {
    setMusicGain(value[0])
    onMusicGainChange(value[0])
  }

  return (
    <motion.div
      className="bg-gray-100 p-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold mb-4">{t('subliminal-maker.mix-controls')}</h3>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="transform transition-transform hover:scale-105 active:scale-95">
            <div className="border-4 border-black px-3 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white flex items-center justify-center">
              <Volume2 className="h-5 w-5" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <label htmlFor="gain" className="font-medium">
                {t('subliminal-maker.gain')}
              </label>
              <span className="text-sm font-mono">{gain} dB</span>
            </div>
            <Slider
              id="gain"
              min={-100}
              max={0}
              step={1}
              value={[gain]}
              onValueChange={handleGainChange}
              className="border-2 border-black"
              aria-label={t('subliminal-maker.gain')}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="transform transition-transform hover:scale-105 active:scale-95">
            <div className="border-4 border-black px-3 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white flex items-center justify-center">
              <Music className="h-5 w-5" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <label htmlFor="musicGain" className="font-medium">
                {t('subliminal-maker.gain')} (Music)
              </label>
              <span className="text-sm font-mono">{musicGain} dB</span>
            </div>
            <Slider
              id="musicGain"
              min={0}
              max={100}
              step={1}
              value={[musicGain]}
              onValueChange={handleMusicGainChange}
              className="border-2 border-black"
              aria-label={`${t('subliminal-maker.gain')} (Music)`}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="transform transition-transform hover:scale-105 active:scale-95">
            <div className="border-4 border-black px-3 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <label htmlFor="speed" className="font-medium">
                {t('subliminal-maker.speed')}
              </label>
              <span className="text-sm font-mono">{speed.toFixed(1)}x</span>
            </div>
            <Slider
              id="speed"
              min={0.5}
              max={6}
              step={0.1}
              value={[speed]}
              onValueChange={handleSpeedChange}
              className="border-2 border-black"
              aria-label={t('subliminal-maker.speed')}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
} 