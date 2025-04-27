import * as Tone from "tone";

/*************************************************
 * SubliminalMixer – wrapper around Tone.js       *
 * Provides loading, mixing, looping, recording   *
 * for "subliminal" tracks (voice + music).       *
 *************************************************/

/** Options accepted by the constructor */
export interface SubliminalMixerOptions {
  /** URL | File | Blob of background music. */
  musicSrc?: string | Blob | File;
  /** URL | File | Blob of recorded affirmations. */
  voiceSrc?: string | Blob | File;
  /** Initial voice channel volume in dB (default –18). */
  voiceVolumeDb?: number;
  /** Initial voice playback‑rate multiplier (default 1.4). */
  voiceRate?: number;
}

export interface SubliminalMixerCallbacks {
  /** Called when both buffers have been loaded. */
  onReady?: () => void;
  /** Called each time start() is invoked. */
  onStart?: () => void;
  /** Called when stop() completes (after players stop). */
  onStop?: () => void;
  /** Fired when recording finishes and `stopRecording()` resolves. */
  onRecordingFinished?: (blob: Blob) => void;
}

/** Convenience type for all constructor params */
export type SubliminalMixerParams = SubliminalMixerOptions & SubliminalMixerCallbacks;

/** Return type when stopRecording() resolves */
export interface RecordingResult {
  blob: Blob;
  download: (filename?: string) => void;
}

/**
 * Tone.js wrapper specialised for subliminal audio generation.
 *
 * Usage:
 * ```ts
 * const mixer = new SubliminalMixer();
 * await mixer.loadMusic(file1);
 * await mixer.loadVoice(file2);
 * mixer.setVoiceVolume(-14);
 * await mixer.start();
 * mixer.record();
 * // … later …
 * const { blob } = await mixer.stopRecording();
 * ```
 */
export default class SubliminalMixer extends EventTarget {
  /** Tone players */
  private musicPlayer?: Tone.Player;
  private voicePlayer?: Tone.Player;

  /** Processing nodes */
  private voiceGain!: Tone.Gain; // created in constructor
  private recorder!: Tone.Recorder;

  /** Flags */
  private started = false;
  private recording = false;

  /** Constructor options */
  private opts: Required<Pick<SubliminalMixerOptions, "voiceVolumeDb" | "voiceRate">> = {
    voiceVolumeDb: -18,
    voiceRate: 1.4,
  } as const;

  /** Callbacks */
  private cb: SubliminalMixerCallbacks = {};

  constructor(params: SubliminalMixerParams = {}) {
    super();

    const { voiceVolumeDb, voiceRate, onReady, onStart, onStop, onRecordingFinished, musicSrc, voiceSrc } = params;

    if (voiceVolumeDb !== undefined) this.opts.voiceVolumeDb = voiceVolumeDb;
    if (voiceRate      !== undefined) this.opts.voiceRate      = voiceRate;

    this.cb = { onReady, onStart, onStop, onRecordingFinished };

    // graph: voicePlayer -> gain -> dest/recorder
    this.voiceGain = new Tone.Gain(Tone.dbToGain(this.opts.voiceVolumeDb)).toDestination();
    this.recorder  = new Tone.Recorder();
    this.voiceGain.connect(this.recorder);

    if (musicSrc)  this.loadMusic(musicSrc);
    if (voiceSrc)  this.loadVoice(voiceSrc);
  }

  /********************
   * Loader helpers   *
   ********************/
  private async makePlayer(source: string | Blob | File): Promise<Tone.Player> {
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const player = new Tone.Player(url, () => {
      // revoke object url after loading to free memory
      if (typeof source !== "string") URL.revokeObjectURL(url);
    });
    await player.loaded; // use the loaded promise instead of calling load()
    return player;
  }

  /** Load / replace background music (non‑looping). */
  async loadMusic(src: string | Blob | File): Promise<void> {
    if (this.musicPlayer) {
      this.musicPlayer.disconnect();
      this.musicPlayer.dispose();
    }
    this.musicPlayer = await this.makePlayer(src);
    this.musicPlayer.autostart = false;
    this.musicPlayer.loop = false;
    this.musicPlayer.toDestination();
    this.musicPlayer.connect(this.recorder);
    this.dispatchEvent(new Event("ready"));
    this.cb.onReady?.();
  }

  /** Load / replace voice (looping channel). */
  async loadVoice(src: string | Blob | File): Promise<void> {
    if (this.voicePlayer) {
      this.voicePlayer.disconnect();
      this.voicePlayer.dispose();
    }
    this.voicePlayer = await this.makePlayer(src);
    this.voicePlayer.autostart = false;
    this.voicePlayer.loop = true;
    this.voicePlayer.playbackRate = this.opts.voiceRate;
    this.voicePlayer.connect(this.voiceGain);
    this.dispatchEvent(new Event("ready"));
    this.cb.onReady?.();
  }

  /********************
   * Parameter tweaks *
   ********************/

  /** Set voice channel volume in dB (negative for quieter). */
  setVoiceVolume(db: number): void {
    this.opts.voiceVolumeDb = db;
    this.voiceGain.gain.rampTo(Tone.dbToGain(db), 0.05);
  }

  /** Set voice playbackRate (e.g. 1.4 = 40% faster). */
  setVoiceRate(rate: number): void {
    this.opts.voiceRate = rate;
    if (this.voicePlayer) this.voicePlayer.playbackRate = rate;
  }

  /** Enable/disable voice looping (music stays linear). */
  toggleLoop(enable = true): void {
    if (this.voicePlayer) this.voicePlayer.loop = enable;
  }

  /********************
   * Transport control *
   ********************/
  async start(): Promise<void> {
    if (this.started) return;
    await Tone.start(); // unlock on iOS / Chrome
    this.voicePlayer?.start();
    this.musicPlayer?.start();
    this.started = true;
    this.dispatchEvent(new Event("start"));
    this.cb.onStart?.();
  }

  async stop(): Promise<void> {
    if (!this.started) return;
    this.voicePlayer?.stop();
    this.musicPlayer?.stop();
    this.started = false;
    this.dispatchEvent(new Event("stop"));
    this.cb.onStop?.();
  }

  pause(): void {
    this.voicePlayer?.stop();
    this.musicPlayer?.stop();
  }

  resume(): void {
    this.voicePlayer?.start();
    this.musicPlayer?.start();
  }

  /********************
   * Recording helpers *
   ********************/
  /** Begin capturing the mixed output. */
  record(): void {
    if (this.recording) return;
    this.recorder.start();
    this.recording = true;
  }

  /** Stop capture and resolve to WAV blob. */
  async stopRecording(): Promise<RecordingResult> {
    if (!this.recording) throw new Error("Recording hasn't started.");
    const rec = await this.recorder.stop(); // Blob
    this.recording = false;
    this.cb.onRecordingFinished?.(rec);
    this.dispatchEvent(new Event("recordingFinished"));
    return {
      blob: rec,
      download: (filename = "subliminal.wav") => {
        // Create a download link and trigger it
        const url = URL.createObjectURL(rec);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    };
  }

  /**************
   * Life‑cycle *
   **************/
  /** Dispose all Tone objects & free memory. */
  dispose(): void {
    this.stop();
    this.voicePlayer?.dispose();
    this.musicPlayer?.dispose();
    this.voiceGain?.dispose();
    this.recorder?.dispose();
  }
}

/*************************************************
 * Example (in comments):
 *************************************************/
/**
import { useEffect } from "react";
import SubliminalMixer from "./SubliminalMixer";

export default function Demo() {
  useEffect(() => {
    const mixer = new SubliminalMixer();
    (async () => {
      await mixer.loadMusic("/music.mp3");
      await mixer.loadVoice("/recorded.wav");
      await mixer.start();
      mixer.record();
      setTimeout(async () => {
        const { blob, download } = await mixer.stopRecording();
        download("my-subliminal.wav");
        mixer.dispose();
      }, 10000); // record 10 s
    })();
  }, []);
  return null;
}
*/
