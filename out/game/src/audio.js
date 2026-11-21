// Shadow Protocol - Audio System
// Procedural sound effects using Web Audio API

export class Audio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.enabled = true;
    this.musicSource = null;
    this.musicBuffer = null;
  }
  
  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);
    
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.6;
    this.sfxGain.connect(this.masterGain);
    
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.25;
    this.musicGain.connect(this.masterGain);
    
    // Create procedural music
    this._createMusic();
  }
  
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  
  _createMusic() {
    // Generate a simple ambient stealth track programmatically
    const sampleRate = this.ctx.sampleRate;
    const duration = 30; // 30 seconds loop
    const length = sampleRate * duration;
    this.musicBuffer = this.ctx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = this.musicBuffer.getChannelData(channel);
      // Generate ambient drone with subtle variations
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        // Low drone
        let val = Math.sin(t * 55 * 2 * Math.PI) * 0.15;
        val += Math.sin(t * 82.5 * 2 * Math.PI) * 0.08;
        val += Math.sin(t * 110 * 2 * Math.PI) * 0.05;
        // Slow modulation
        val *= 0.5 + 0.5 * Math.sin(t * 0.15 * 2 * Math.PI);
        val *= 0.7 + 0.3 * Math.sin(t * 0.07 * 2 * Math.PI);
        // Add subtle noise
        val += (Math.random() - 0.5) * 0.02;
        data[i] = val * 0.3;
      }
    }
  }
  
  playMusic() {
    if (!this.enabled || !this.ctx || this.musicSource) return;
    
    this.musicSource = this.ctx.createBufferSource();
    this.musicSource.buffer = this.musicBuffer;
    this.musicSource.loop = true;
    this.musicSource.connect(this.musicGain);
    this.musicSource.start(0);
    
    this.musicSource.onended = () => {
      this.musicSource = null;
    };
  }
  
  stopMusic() {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    }
  }
  
  setMusicVolume(vol) {
    if (this.musicGain) this.musicGain.gain.value = vol;
  }
  
  setSfxVolume(vol) {
    if (this.sfxGain) this.sfxGain.gain.value = vol;
  }
  
  setMasterVolume(vol) {
    if (this.masterGain) this.masterGain.gain.value = vol;
  }
  
  // Procedural SFX
  playFootstep(sneaking = false) {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(sneaking ? 80 : 120, t);
    osc.frequency.exponentialRampToValueAtTime(sneaking ? 40 : 60, t + 0.08);
    gain.gain.setValueAtTime(sneaking ? 0.08 : 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }
  
  playAlert(level) {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = level >= 2 ? 'sawtooth' : 'square';
    const baseFreq = level >= 2 ? 440 : 330;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.3);
    gain.gain.setValueAtTime(0.2 * (level / 3), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }
  
  playDetected() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    // Sharp detection sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.2);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.4);
    
    // Sub-bass hit
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(60, t);
    gain2.gain.setValueAtTime(0.4, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t);
    osc2.stop(t + 0.5);
  }
  
  playLevelComplete() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    // Ascending arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const noteTime = t + i * 0.08;
      gain.gain.setValueAtTime(0.15, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }
  
  playDoorOpen() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(165, t + 0.2);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }
  
  playGameOver() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    // Descending minor chord
    const notes = [329.63, 246.94, 196.00, 164.81];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const noteTime = t + i * 0.15;
      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.8);
    });
    // Low rumble
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(40, t);
    gain2.gain.setValueAtTime(0.2, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t);
    osc2.stop(t + 1.5);
  }
  
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.stopMusic();
    return this.enabled;
  }
}