/**
 * CELEBRATION STUDIO — MASTER AUDIO CONTROLLER (Custom Upload & Ambient Soundscape)
 * Supports user-uploaded audio tracks (MP3, WAV, OGG, M4A, AAC) and synthesized
 * harmonic chord presets. Strictly respects browser autoplay policies with
 * user gesture activation, volume fades, ducking, and seamless scene continuity.
 */

class AudioController {
  constructor() {
    this.ctx = null;
    this.audioElement = null;
    this.mediaSource = null;
    this.gainNode = null;
    this.isMuted = true;
    this.isPlaying = false;
    this.targetVolume = 0.75;
    this.currentPreset = 'celestial_drift';
    this.customUrl = '';
    this.synthOscillators = [];
    this.isDucked = false;

    this.config = this.readConfigFromDOM();
    if (this.config) {
      this.targetVolume = typeof this.config.volume === 'number' ? this.config.volume : 0.75;
      this.customUrl = this.config.custom_url || '';
      this.currentPreset = this.config.soundtrack_preset || 'celestial_drift';
    }
  }

  readConfigFromDOM() {
    const el = document.getElementById('celebrationAudioConfig');
    if (el && el.textContent) {
      try {
        return JSON.parse(el.textContent);
      } catch (e) {
        console.warn('Failed to parse celebrationAudioConfig', e);
      }
    }
    return {
      enabled: true,
      source_type: 'preset',
      custom_url: '',
      volume: 0.75,
      loop: true,
      start_time: 0,
      fade_in_seconds: 1.5,
      fade_out_seconds: 2.0,
      ducking_on_reveal: true
    };
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  updateConfig(newConfig) {
    this.config = Object.assign({}, this.config, newConfig);
    if (typeof this.config.volume === 'number') {
      this.targetVolume = this.config.volume;
      if (!this.isMuted && this.gainNode && this.ctx) {
        this.gainNode.gain.setValueAtTime(this.targetVolume, this.ctx.currentTime);
      }
    }
    if (this.config.custom_url !== undefined) {
      const changed = this.customUrl !== this.config.custom_url;
      this.customUrl = this.config.custom_url;
      if (changed && this.isPlaying) {
        this.playTrack();
      }
    }
    if (this.config.soundtrack_preset) {
      this.currentPreset = this.config.soundtrack_preset;
    }
  }

  toggleMute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.fadeGain(0, 0.4);
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.stopSynth();
      this.isPlaying = false;
    } else {
      this.playTrack();
    }

    return !this.isMuted;
  }

  playTrack() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = false;

    // Check if user uploaded a custom track
    if (this.customUrl && this.config.source_type !== 'preset') {
      this.playCustomAudio(this.customUrl);
    } else {
      this.startAmbientPreset(this.currentPreset);
    }
  }

  playCustomAudio(url) {
    this.stopSynth();

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.loop = this.config.loop !== false;

      // Connect to Web Audio graph if available
      if (this.ctx && this.gainNode) {
        try {
          this.mediaSource = this.ctx.createMediaElementSource(this.audioElement);
          this.mediaSource.connect(this.gainNode);
        } catch (e) {
          // Fallback if media element source fails (e.g. CORS)
          this.audioElement.volume = this.targetVolume;
        }
      }
    }

    if (this.audioElement.src !== url) {
      this.audioElement.src = url;
      if (this.config.start_time) {
        this.audioElement.currentTime = this.config.start_time;
      }
    }

    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isPlaying = true;
        this.fadeGain(this.targetVolume, this.config.fade_in_seconds || 1.5);
      }).catch(err => {
        console.warn('Audio play was prevented or failed; falling back to synthesized chord:', err);
        this.startAmbientPreset(this.currentPreset);
      });
    }
  }

  startAmbientPreset(preset = 'celestial_drift') {
    this.currentPreset = preset;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynth();

    if (!this.ctx) return;

    const presets = {
      celestial_drift: [261.63, 329.63, 392.00, 523.25], // C Major 7 chord
      ambient_piano: [220.00, 261.63, 329.63, 440.00],   // A Minor chord
      romantic_warmth: [349.23, 440.00, 523.25, 659.25], // F Major 7 chord
      cinematic_triumph: [293.66, 369.99, 440.00, 587.33] // D Major chord
    };

    const notes = presets[preset] || presets['celestial_drift'];
    this.synthOscillators = notes.map((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle LFO modulation for organic acoustic warmth
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2 + (i * 0.05), this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(4.0, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.06 / (i + 1), this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.gainNode);
      osc.start();
      return { osc, lfo, gain };
    });

    this.isPlaying = true;
    this.fadeGain(this.targetVolume * 0.45, 1.2);
  }

  fadeGain(targetValue, duration = 0.5) {
    if (!this.gainNode || !this.ctx) {
      if (this.audioElement) {
        this.audioElement.volume = targetValue;
      }
      return;
    }
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(targetValue, now + duration);
  }

  duck(amount = 0.35, duration = 0.6) {
    if (this.isMuted || !this.isPlaying || this.isDucked) return;
    this.isDucked = true;
    this.fadeGain(this.targetVolume * amount, duration);
  }

  restore(duration = 0.8) {
    if (this.isMuted || !this.isPlaying || !this.isDucked) return;
    this.isDucked = false;
    this.fadeGain(this.targetVolume, duration);
  }

  playChime() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.3);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.8);
  }

  stopSynth() {
    this.synthOscillators.forEach(({ osc, lfo }) => {
      try {
        osc.stop();
        lfo.stop();
      } catch (e) {}
    });
    this.synthOscillators = [];
  }

  destroy() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    this.stopSynth();
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch (e) {}
    }
  }
}

// Global instance for templates & engines
window.CelebrationAudio = new AudioController();
