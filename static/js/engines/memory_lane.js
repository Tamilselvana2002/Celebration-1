/**
 * CELEBRATION STUDIO — ENGINE 3: MEMORY LANE (Sequential Storyteller Showcase)
 * 
 * Features:
 * - Dramatic 3D physical card toss & deck landing transitions
 * - Ken Burns camera pan and specular light sheen reflection sweep
 * - Press & Hold anywhere on screen/card to pause and inspect
 * - Tap card or press Enter/Space/Right-Arrow to advance
 * - Elegant in-card integrated progress line and corner counter badge
 */

export class MemoryLaneEngine {
  constructor(container, config = {}) {
    this.container = container;
    this.config = config;
    this.slides = [];
    this.currentIndex = 0;
    this.isPaused = false;
    this.isHolding = false;
    this.isAnimating = false;
    this.slideDuration = 5500; // 5.5s comfortable duration
    this.progressInterval = null;
    this.progressElapsed = 0;

    // Elements
    this.stage = null;
    this.pausePill = null;
    this.currentProgressBar = null;

    // Gesture tracking
    this.pointerDownTime = 0;
    this.holdTimer = null;

    // Bound listeners for clean lifecycle
    this.handlePointerDown = this.onPointerDown.bind(this);
    this.handlePointerUp = this.onPointerUp.bind(this);
    this.handlePointerCancel = this.onPointerCancel.bind(this);
    this.handleKeyDown = this.onKeyDown.bind(this);
  }

  mount() {
    this.stage = this.container.querySelector('.memory-storyteller-stage');
    this.slides = Array.from(this.container.querySelectorAll('.memory-slide-card'));
    this.pausePill = this.container.querySelector('.memory-pause-pill');

    if (this.slides.length === 0) return;

    // Bind pointer and touch interactions directly on stage
    if (this.stage) {
      this.stage.addEventListener('pointerdown', this.handlePointerDown);
      window.addEventListener('pointerup', this.handlePointerUp);
      window.addEventListener('pointercancel', this.handlePointerCancel);
    }

    // Keyboard listener (Enter / Space / Right arrow advances; Left arrow goes back)
    window.addEventListener('keydown', this.handleKeyDown);

    // Initial setup
    this.showSlide(0, false);
    this.startTimer();
  }

  onPointerDown(e) {
    // Only respond to primary click / touch
    if (e.button !== undefined && e.button !== 0) return;
    
    this.pointerDownTime = Date.now();
    
    // Hold threshold: after 180ms of holding, engage pause and tactile press-down
    this.holdTimer = setTimeout(() => {
      this.engageHold();
    }, 180);
  }

  onPointerUp(e) {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    const elapsed = Date.now() - this.pointerDownTime;

    if (this.isHolding) {
      // Releasing from hold: resume playback
      this.releaseHold();
    } else if (elapsed < 350) {
      // Fast tap: advance immediately to next memory
      this.nextSlide();
    }
  }

  onPointerCancel() {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    if (this.isHolding) {
      this.releaseHold();
    }
  }

  engageHold() {
    this.isHolding = true;
    this.isPaused = true;

    // Visual tactile press-down on active card
    const activeCard = this.slides[this.currentIndex];
    if (activeCard) {
      activeCard.classList.add('is-holding');
    }

    // Show floating pause indicator pill
    if (this.pausePill) {
      this.pausePill.classList.add('visible');
    }
  }

  releaseHold() {
    this.isHolding = false;
    this.isPaused = false;

    const activeCard = this.slides[this.currentIndex];
    if (activeCard) {
      activeCard.classList.remove('is-holding');
    }

    if (this.pausePill) {
      this.pausePill.classList.remove('visible');
    }

    this.startTimer();
  }

  onKeyDown(e) {
    // Check if Memory Lane scene is active before handling key events
    if (!this.container.classList.contains('scene-active')) return;

    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault();
      this.nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prevSlide();
    }
  }

  showSlide(index, animate = true) {
    if (index < 0 || index >= this.slides.length || this.isAnimating) return;

    const oldSlide = this.slides[this.currentIndex];
    const newSlide = this.slides[index];
    this.currentIndex = index;

    // Reset progress track
    this.progressElapsed = 0;
    this.updateProgressBar(0);

    // Natural alternating card rotation for physical deck realism
    const naturalRot = (index % 2 === 0 ? -2.5 : 2.5);

    if (window.gsap && animate && oldSlide && oldSlide !== newSlide) {
      this.isAnimating = true;

      const tl = gsap.timeline({
        onComplete: () => {
          this.isAnimating = false;
          oldSlide.classList.remove('active');
          gsap.set(oldSlide, {
            x: 0,
            y: 0,
            z: 0,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            opacity: 0,
            clearProps: 'transform'
          });
        }
      });

      // 1. OUTGOING CARD: Dramatic 3D card toss (lifts forward on Z, swivels, and flies off)
      tl.to(oldSlide, {
        x: -220,
        y: -40,
        z: 180,
        rotateY: -32,
        rotateZ: -12,
        rotateX: 10,
        scale: 0.92,
        opacity: 0,
        duration: 0.65,
        ease: 'power3.in'
      }, 0);

      // 2. INCOMING CARD: Pre-set under the deck, then snap forward with elastic spring
      newSlide.classList.add('active');
      gsap.set(newSlide, {
        opacity: 0,
        scale: 0.82,
        x: 140,
        y: 60,
        z: -120,
        rotateY: 28,
        rotateZ: naturalRot * 3,
        rotateX: -12
      });

      tl.to(newSlide, {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        z: 0,
        rotateY: 0,
        rotateX: 0,
        rotateZ: naturalRot,
        duration: 0.95,
        ease: 'back.out(1.45)'
      }, 0.2);

      // 3. PHOTOGRAPHIC GLOSS REFLECTION: Sweeps diagonally across incoming photo
      const reflectionSweep = newSlide.querySelector('.polaroid-reflection-sweep');
      if (reflectionSweep) {
        tl.fromTo(reflectionSweep, 
          { x: '-100%', y: '-100%', opacity: 0 },
          { x: '100%', y: '100%', opacity: 0.85, duration: 0.85, ease: 'power2.out' },
          0.35
        );
      }

      // 4. KEN BURNS PHOTO ZOOM: cinematic slow push-in
      const img = newSlide.querySelector('.polaroid-img');
      if (img) {
        gsap.fromTo(img,
          { scale: 1.0 },
          { scale: 1.1, duration: this.slideDuration / 1000, ease: 'sine.out' }
        );
      }

      // 5. STAGGERED TYPOGRAPHIC REVEAL
      const caption = newSlide.querySelector('.polaroid-caption');
      const yearTag = newSlide.querySelector('.polaroid-year-tag');
      const note = newSlide.querySelector('.polaroid-note-text');

      if (caption) {
        tl.fromTo(caption, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.4);
      }
      if (yearTag) {
        tl.fromTo(yearTag, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.48);
      }
      if (note) {
        tl.fromTo(note, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.55);
      }

    } else {
      // Non-animated / initial display
      this.slides.forEach((s, idx) => {
        const isActive = (idx === index);
        s.classList.toggle('active', isActive);
        if (isActive) {
          s.style.opacity = '1';
          s.style.transform = `rotate(${naturalRot}deg) scale(1)`;
        } else {
          s.style.opacity = '0';
        }
      });
    }

    if (window.CelebrationAudio) {
      window.CelebrationAudio.playChime();
    }
  }

  updateProgressBar(percentage) {
    const activeSlide = this.slides[this.currentIndex];
    if (activeSlide) {
      const fill = activeSlide.querySelector('.polaroid-progress-fill');
      if (fill) {
        fill.style.width = `${percentage}%`;
      }
    }
  }

  startTimer() {
    this.clearTimer();
    if (this.isPaused || this.isHolding) return;

    const intervalStep = 50;
    this.progressInterval = setInterval(() => {
      if (this.isPaused || this.isHolding) return;

      this.progressElapsed += intervalStep;
      const pct = Math.min(100, (this.progressElapsed / this.slideDuration) * 100);
      this.updateProgressBar(pct);

      if (this.progressElapsed >= this.slideDuration) {
        this.nextSlide();
      }
    }, intervalStep);
  }

  clearTimer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  nextSlide() {
    if (this.isAnimating) return;
    const nextIdx = (this.currentIndex + 1) % this.slides.length;
    this.showSlide(nextIdx, true);
    this.startTimer();
  }

  prevSlide() {
    if (this.isAnimating) return;
    const prevIdx = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.showSlide(prevIdx, true);
    this.startTimer();
  }

  destroy() {
    this.clearTimer();
    if (this.holdTimer) clearTimeout(this.holdTimer);

    if (this.stage) {
      this.stage.removeEventListener('pointerdown', this.handlePointerDown);
    }
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerCancel);
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
