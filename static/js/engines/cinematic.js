/**
 * ENGINE 1: CINEMATIC EXPERIENCE
 * Staged Supernova Pipeline:
 * Stage 1: Isolated countdown spotlight timer only (3... 2... 1...)
 * Stage 2: Supernova blast shockwave flash + stardust confetti burst
 * Stage 3: Glowing personalized greeting typography emerges from the stardust
 * Supports tap anywhere / press Enter to advance.
 */

export class CinematicEngine {
  constructor(container, config = {}) {
    this.container = container;
    this.config = config;
    this.timeline = null;
    this.countdownTimer = null;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationFrameId = null;
    this.isBlastComplete = false;
    this.handleResize = this.resize.bind(this);
    this.handleGreetingClick = this.onGreetingClick.bind(this);
  }

  mount() {
    this.initEmberCanvas();

    const countdownStage = this.container.querySelector('.cinematic-countdown-stage');
    const greetingWrap = this.container.querySelector('.cinematic-greeting-wrap');
    const blastFlash = this.container.querySelector('.cinematic-blast-flash');
    const blastShockwave = this.container.querySelector('.cinematic-blast-shockwave');
    const countdownCircle = this.container.querySelector('.countdown-circle');
    const countdownNumber = this.container.querySelector('.countdown-number');
    const ctaBtn = this.container.querySelector('.cinematic-cta-btn');

    if (countdownStage && countdownCircle && countdownNumber) {
      // Stage 1: Ensure greeting is completely hidden while countdown is active
      if (greetingWrap) {
        greetingWrap.style.display = 'none';
        greetingWrap.style.opacity = '0';
      }

      if (window.gsap) {
        gsap.fromTo(
          countdownStage,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)' }
        );
      }

      this.startCountdown(countdownCircle, countdownNumber, countdownStage, greetingWrap, blastFlash, blastShockwave);
    } else {
      // If countdown disabled or missing, reveal greeting immediately
      this.revealGreeting(greetingWrap, 0);
      if (ctaBtn && window.gsap) {
        gsap.fromTo(ctaBtn, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.5 });
      }
    }
  }

  initEmberCanvas() {
    this.canvas = this.container.querySelector('.cinematic-embers-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'cinematic-embers-canvas viewport-ambient-canvas';
      this.container.prepend(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.handleResize);

    const count = window.innerWidth > 1000 ? 55 : 28;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 2 + 1,
      speedY: -(Math.random() * 0.8 + 0.3),
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2
    }));

    const renderEmbers = () => {
      if (!this.ctx || !this.canvas) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#E6C065';

      this.particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) {
          p.y = this.canvas.height + 10;
          p.x = Math.random() * this.canvas.width;
        }
        this.ctx.globalAlpha = p.alpha;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      });

      this.animationFrameId = requestAnimationFrame(renderEmbers);
    };
    renderEmbers();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  startCountdown(circleEl, numberEl, stageEl, greetingWrap, flashEl, shockwaveEl) {
    let count = parseInt(numberEl.textContent.trim(), 10) || 3;
    const total = count;
    const circumference = 327;

    // Initial audio chime
    if (window.CelebrationAudio && typeof window.CelebrationAudio.playChime === 'function') {
      window.CelebrationAudio.playChime();
    }

    this.countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        numberEl.textContent = count;
        const offset = circumference - (count / total) * circumference;
        circleEl.style.strokeDashoffset = offset;

        if (window.gsap) {
          gsap.fromTo(numberEl, { scale: 1.45 }, { scale: 1.0, duration: 0.35, ease: 'back.out(2)' });
        }
        if (window.CelebrationAudio && typeof window.CelebrationAudio.playChime === 'function') {
          window.CelebrationAudio.playChime();
        }
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        numberEl.textContent = '✦';
        circleEl.style.strokeDashoffset = circumference;

        // Stage 2: Climax Blast & Stage 3: Greeting Reveal
        this.triggerBlastAndReveal(stageEl, greetingWrap, flashEl, shockwaveEl);
      }
    }, 1000);
  }

  triggerBlastAndReveal(stageEl, greetingWrap, flashEl, shockwaveEl) {
    if (window.CelebrationAudio && typeof window.CelebrationAudio.playChime === 'function') {
      window.CelebrationAudio.playChime();
    }

    // 1. Stage 2: Supernova Blast Flash & Shockwave
    if (window.gsap) {
      // Implode countdown spotlight
      gsap.to(stageEl, {
        scale: 0.1,
        opacity: 0,
        duration: 0.3,
        ease: 'power4.in',
        onComplete: () => {
          stageEl.style.display = 'none';
        }
      });

      // Blast Flash
      if (flashEl) {
        gsap.timeline()
          .fromTo(flashEl, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power1.in' })
          .to(flashEl, { opacity: 0, duration: 0.85, ease: 'power2.out' });
      }

      // Shockwave Ring
      if (shockwaveEl) {
        gsap.fromTo(
          shockwaveEl,
          { scale: 0, opacity: 1 },
          { scale: 3.8, opacity: 0, duration: 0.85, ease: 'power2.out' }
        );
      }
    } else {
      stageEl.style.display = 'none';
    }

    // 2. Confetti Supernova Stardust Explosion
    if (window.confetti) {
      window.confetti({
        particleCount: 140,
        spread: 110,
        origin: { y: 0.5, x: 0.5 },
        colors: ['#E6C065', '#FFD700', '#FFFFFF', '#FFA07A', '#B588FF']
      });

      setTimeout(() => {
        window.confetti({
          particleCount: 80,
          angle: 60,
          spread: 75,
          origin: { x: 0.2, y: 0.55 },
          colors: ['#FFD700', '#FFFFFF', '#E6C065']
        });
        window.confetti({
          particleCount: 80,
          angle: 120,
          spread: 75,
          origin: { x: 0.8, y: 0.55 },
          colors: ['#FFD700', '#FFFFFF', '#E6C065']
        });
      }, 160);
    }

    // 3. Stage 3: Reveal Greeting Out of Blast Stardust
    this.revealGreeting(greetingWrap, 0.22);
  }

  revealGreeting(greetingWrap, delay = 0) {
    if (!greetingWrap) return;
    greetingWrap.style.display = 'flex';
    greetingWrap.style.cursor = 'pointer';

    const prefixEl = greetingWrap.querySelector('.cinematic-prefix');
    const titleEl = greetingWrap.querySelector('.cinematic-title');
    const subEl = greetingWrap.querySelector('.cinematic-subtitle');
    const guideEl = greetingWrap.querySelector('.cinematic-continue-guide');

    if (!window.gsap) {
      greetingWrap.style.opacity = '1';
      greetingWrap.style.transform = 'none';
      greetingWrap.style.filter = 'none';
      this.isBlastComplete = true;
      greetingWrap.addEventListener('click', this.handleGreetingClick);
      return;
    }

    const tl = gsap.timeline({
      delay: delay,
      onComplete: () => {
        this.isBlastComplete = true;
        greetingWrap.addEventListener('click', this.handleGreetingClick);
      }
    });

    tl.fromTo(
      greetingWrap,
      { opacity: 0, scale: 0.75, filter: 'blur(16px)' },
      { opacity: 1, scale: 1.0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' }
    );

    if (prefixEl) {
      tl.fromTo(prefixEl, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.7');
    }

    if (titleEl) {
      tl.fromTo(titleEl, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1.0, duration: 0.9, ease: 'back.out(1.2)' }, '-=0.5');
    }

    if (subEl) {
      tl.fromTo(subEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4');
    }

    if (guideEl) {
      tl.fromTo(guideEl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');
    }
  }

  onGreetingClick() {
    if (this.isBlastComplete && window.orchestrator && typeof window.orchestrator.nextScene === 'function') {
      window.orchestrator.nextScene();
    }
  }

  destroy() {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);

    const greetingWrap = this.container.querySelector('.cinematic-greeting-wrap');
    if (greetingWrap) {
      greetingWrap.removeEventListener('click', this.handleGreetingClick);
    }
  }
}
