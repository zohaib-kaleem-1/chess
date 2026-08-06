// SoundManager.js - Chess.com style sounds using Web Audio API
export class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
    this.initialized = false;
    this.sounds = {};
  }

  init() {
    try {
      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      this.initialized = true;
      this.createSounds();
    } catch (e) {
      console.log("Web Audio API not supported");
      this.initialized = false;
    }
  }

  createSounds() {
    this.sounds = {
      move: this.createMoveSound(),
      capture: this.createCaptureSound(),
      check: this.createCheckSound(),
      gameOver: this.createGameOverSound(),
      promote: this.createPromoteSound(),
      castle: this.createCastleSound(),
    };
  }

  createMoveSound() {
    return () => {
      if (!this.initialized || !this.audioContext) return;
      try {
        this.resume();
        const now = this.audioContext.currentTime;
        const freqs = [800, 600];
        freqs.forEach((freq, i) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.connect(gain);
          gain.connect(this.audioContext.destination);
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.08, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.08);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.08);
        });
      } catch (e) {
        /* silent fail */
      }
    };
  }

  createCaptureSound() {
    return () => {
      if (!this.initialized || !this.audioContext) return;
      try {
        this.resume();
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);

        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        osc2.type = "sine";
        osc2.frequency.value = 1200;
        gain2.gain.setValueAtTime(0.04, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc2.start(now);
        osc2.stop(now + 0.04);
      } catch (e) {
        /* silent fail */
      }
    };
  }

  createCheckSound() {
    return () => {
      if (!this.initialized || !this.audioContext) return;
      try {
        this.resume();
        const now = this.audioContext.currentTime;
        [1000, 1200].forEach((freq, i) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.connect(gain);
          gain.connect(this.audioContext.destination);
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.1, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.08);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.08);
        });
      } catch (e) {
        /* silent fail */
      }
    };
  }

  createGameOverSound() {
    return () => {
      if (!this.initialized || !this.audioContext) return;
      try {
        this.resume();
        const now = this.audioContext.currentTime;
        const notes = [523, 587, 659, 784, 880, 988, 1047];
        notes.forEach((freq, i) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.connect(gain);
          gain.connect(this.audioContext.destination);
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.06, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.12);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.12);
        });
      } catch (e) {
        /* silent fail */
      }
    };
  }

  createPromoteSound() {
    return () => {
      if (!this.initialized || !this.audioContext) return;
      try {
        this.resume();
        const now = this.audioContext.currentTime;
        [600, 800, 1000, 1200].forEach((freq, i) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.connect(gain);
          gain.connect(this.audioContext.destination);
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.06, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.08);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.08);
        });
      } catch (e) {
        /* silent fail */
      }
    };
  }

  createCastleSound() {
    return () => {
      if (!this.initialized || !this.audioContext) return;
      try {
        this.resume();
        const now = this.audioContext.currentTime;
        [700, 500].forEach((freq, i) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.connect(gain);
          gain.connect(this.audioContext.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          osc.frequency.exponentialRampToValueAtTime(
            freq * 0.7,
            now + i * 0.1 + 0.1,
          );
          gain.gain.setValueAtTime(0.06, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.12);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.12);
        });
      } catch (e) {
        /* silent fail */
      }
    };
  }

  resume() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }

  playSound(type) {
    if (!this.enabled || !this.initialized) return;
    this.resume();
    if (this.sounds[type]) {
      this.sounds[type]();
    }
  }
}
