/**
 * CELEBRATION STUDIO — CENTRAL ANIMATION CONTROLLER (Layer B Engine)
 * Manages background atmospheres, full-screen scene transitions, image transition classes,
 * text entrance timelines, and reduced-motion fallbacks.
 */

export class AnimationController {
  constructor(viewportElement, initialConfig = null) {
    this.viewport = viewportElement;
    this.config = initialConfig || this.readConfigFromDOM();
    this.bgCanvas = this.viewport.querySelector('#bgAnimationCanvas');
    this.fxCanvas = this.viewport.querySelector('#fxTransitionCanvas');
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
    this.fxCtx = this.fxCanvas ? this.fxCanvas.getContext('2d') : null;

    this.animFrameId = null;
    this.bgParticles = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.time = 0;
    this.isPaused = false;

    // Accessibility check: user system reduced-motion preference
    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = this.mediaQuery.matches;
    this.mediaQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      this.initBackgroundAtmosphere();
    });

    this.initCanvases();
    this.initBackgroundAtmosphere();
  }

  readConfigFromDOM() {
    const script = document.getElementById('celebrationAnimationConfig');
    if (script && script.textContent) {
      try {
        return JSON.parse(script.textContent);
      } catch (e) {
        console.warn('Could not parse celebrationAnimationConfig:', e);
      }
    }
    return {
      preset_id: 'cinematic_luxury',
      screen_transition: 'screen.light_sweep',
      image_transition: 'image.floating_memory',
      background_effect: 'background.golden_dust',
      gift_effect: 'gift.magical_light',
      finale_effect: 'finale.grand_celebration',
      intensity: 'cinematic',
      speed: 1.0,
      respect_reduced_motion: true
    };
  }

  updateConfig(newConfig) {
    this.config = Object.assign({}, this.config, newConfig);
    this.initBackgroundAtmosphere();
  }

  initCanvases() {
    if (!this.bgCanvas) {
      this.bgCanvas = document.createElement('canvas');
      this.bgCanvas.id = 'bgAnimationCanvas';
      this.bgCanvas.className = 'bg-animation-canvas';
      this.viewport.prepend(this.bgCanvas);
      this.bgCtx = this.bgCanvas.getContext('2d');
    }

    if (!this.fxCanvas) {
      this.fxCanvas = document.createElement('canvas');
      this.fxCanvas.id = 'fxTransitionCanvas';
      this.fxCanvas.className = 'fx-transition-canvas';
      this.viewport.appendChild(this.fxCanvas);
      this.fxCtx = this.fxCanvas.getContext('2d');
    }

    const resize = () => {
      this.width = this.bgCanvas.width = this.fxCanvas.width = window.innerWidth;
      this.height = this.bgCanvas.height = this.fxCanvas.height = window.innerHeight;
      this.initBackgroundParticles();
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Visibility-aware pausing
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
      if (!this.isPaused && !this.animFrameId) {
        this.startBackgroundLoop();
      }
    });

    this.startBackgroundLoop();
  }

  // -------------------------------------------------------------
  // BACKGROUND ATMOSPHERE ENGINE
  // -------------------------------------------------------------
  initBackgroundAtmosphere() {
    this.initBackgroundParticles();
  }

  initBackgroundParticles() {
    this.bgParticles = [];
    const count = this.prefersReducedMotion ? 0 : this.getParticleCount();

    const effect = this.config.background_effect || 'background.golden_dust';

    if (effect === 'background.starfield') {
      for (let i = 0; i < count; i++) {
        this.bgParticles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 1.8 + 0.4,
          alpha: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          color: Math.random() > 0.8 ? '#38E1FF' : (Math.random() > 0.6 ? '#B588FF' : '#FFFFFF')
        });
      }
    } else if (effect === 'background.golden_dust') {
      for (let i = 0; i < count; i++) {
        this.bgParticles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 3.5 + 1.2,
          alpha: Math.random() * 0.7 + 0.2,
          pulse: Math.random() * Math.PI,
          vy: -(Math.random() * 0.6 + 0.2) * (this.config.speed || 1.0),
          vx: (Math.random() - 0.5) * 0.3,
          color: Math.random() > 0.4 ? '#E6C065' : '#FFD700'
        });
      }
    } else if (effect === 'background.dream_clouds') {
      const cloudCount = Math.max(4, Math.floor(count / 15));
      for (let i = 0; i < cloudCount; i++) {
        this.bgParticles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 160 + 120,
          alpha: Math.random() * 0.15 + 0.06,
          angle: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          color: i % 2 === 0 ? 'rgba(181, 136, 255, ' : 'rgba(255, 101, 132, '
        });
      }
    } else if (effect === 'background.candlelight') {
      this.candleFlicker = { alpha: 0.25, target: 0.25 };
    } else if (effect === 'background.aurora') {
      this.auroraOffset = 0;
    }
  }

  getParticleCount() {
    const isMobile = this.width < 768;
    const intensity = this.config.intensity || 'cinematic';
    let base = isMobile ? 35 : 85;
    if (intensity === 'subtle') base = Math.floor(base * 0.5);
    if (intensity === 'cinematic') base = Math.floor(base * 1.3);
    return base;
  }

  startBackgroundLoop() {
    const loop = () => {
      if (!this.isPaused) {
        this.renderBackgroundFrame();
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  renderBackgroundFrame() {
    if (!this.bgCtx) return;
    const ctx = this.bgCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.prefersReducedMotion) return;

    this.time += 0.016 * (this.config.speed || 1.0);
    const effect = this.config.background_effect || 'background.golden_dust';

    if (effect === 'background.starfield') {
      this.renderStarfield(ctx);
    } else if (effect === 'background.golden_dust') {
      this.renderGoldenDust(ctx);
    } else if (effect === 'background.dream_clouds') {
      this.renderDreamClouds(ctx);
    } else if (effect === 'background.candlelight') {
      this.renderCandlelight(ctx);
    } else if (effect === 'background.aurora') {
      this.renderAurora(ctx);
    } else if (effect === 'background.liquid_glass') {
      this.renderLiquidGlass(ctx);
    }
  }

  renderStarfield(ctx) {
    for (let p of this.bgParticles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      const currentAlpha = Math.abs(Math.sin(this.time * p.twinkleSpeed * 10)) * p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = currentAlpha;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Rare shooting star
    if (Math.random() < 0.006) {
      this.shootingStar = {
        x: Math.random() * this.width * 0.8,
        y: Math.random() * this.height * 0.4,
        len: Math.random() * 80 + 40,
        speed: 16,
        alpha: 1.0
      };
    }

    if (this.shootingStar) {
      ctx.save();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = this.shootingStar.alpha;
      ctx.beginPath();
      ctx.moveTo(this.shootingStar.x, this.shootingStar.y);
      ctx.lineTo(this.shootingStar.x + this.shootingStar.len, this.shootingStar.y + this.shootingStar.len * 0.4);
      ctx.stroke();
      ctx.restore();

      this.shootingStar.x += this.shootingStar.speed;
      this.shootingStar.y += this.shootingStar.speed * 0.4;
      this.shootingStar.alpha -= 0.035;
      if (this.shootingStar.alpha <= 0) this.shootingStar = null;
    }
  }

  renderGoldenDust(ctx) {
    for (let p of this.bgParticles) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(this.time + p.pulse) * 0.4;

      if (p.y < -20) {
        p.y = this.height + 20;
        p.x = Math.random() * this.width;
      }

      ctx.save();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
      grad.addColorStop(0, p.color);
      grad.addColorStop(0.4, p.color);
      grad.addColorStop(1, 'rgba(230, 192, 101, 0)');

      ctx.globalAlpha = (Math.sin(this.time * 2 + p.pulse) * 0.25 + 0.75) * p.alpha;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderDreamClouds(ctx) {
    for (let p of this.bgParticles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -p.radius) p.x = this.width + p.radius;
      if (p.x > this.width + p.radius) p.x = -p.radius;
      if (p.y < -p.radius) p.y = this.height + p.radius;
      if (p.y > this.height + p.radius) p.y = -p.radius;

      ctx.save();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, p.color + p.alpha + ')');
      grad.addColorStop(0.6, p.color + (p.alpha * 0.5) + ')');
      grad.addColorStop(1, p.color + '0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderCandlelight(ctx) {
    if (!this.candleFlicker) this.candleFlicker = { alpha: 0.25, target: 0.25 };
    if (Math.random() < 0.1) {
      this.candleFlicker.target = 0.20 + Math.random() * 0.15;
    }
    this.candleFlicker.alpha += (this.candleFlicker.target - this.candleFlicker.alpha) * 0.1;

    ctx.save();
    const cx = this.width * 0.5;
    const cy = this.height * 0.65;
    const grad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(this.width, this.height) * 0.7);
    grad.addColorStop(0, `rgba(245, 158, 11, ${this.candleFlicker.alpha})`);
    grad.addColorStop(0.4, `rgba(217, 119, 6, ${this.candleFlicker.alpha * 0.4})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  renderAurora(ctx) {
    if (typeof this.auroraOffset === 'undefined') this.auroraOffset = 0;
    this.auroraOffset += 0.015;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, this.height * 0.3);

      const color = i === 0 ? 'rgba(46, 196, 182, 0.12)' : (i === 1 ? 'rgba(138, 79, 255, 0.10)' : 'rgba(56, 225, 255, 0.08)');
      ctx.fillStyle = color;

      for (let x = 0; x <= this.width; x += 30) {
        const y = this.height * 0.25 +
                  Math.sin(x * 0.003 + this.auroraOffset + i) * 60 +
                  Math.cos(x * 0.006 - this.auroraOffset * 0.7) * 35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(this.width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  renderLiquidGlass(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const waveY = this.height * 0.5 + Math.sin(this.time) * 40;

    const grad = ctx.createLinearGradient(0, waveY - 80, this.width, waveY + 80);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  // -------------------------------------------------------------
  // FULL-SCREEN SCENE TRANSITIONS (Layer A Execution)
  // -------------------------------------------------------------
  executeTransition(oldScene, newScene, onComplete) {
    if (this.prefersReducedMotion || !window.gsap) {
      this.executeFadeTransition(oldScene, newScene, onComplete);
      return;
    }

    const effect = this.config.screen_transition || 'screen.light_sweep';

    switch (effect) {
      case 'screen.light_sweep':
        this.transitionLightSweep(oldScene, newScene, onComplete);
        break;
      case 'screen.liquid_silk':
        this.transitionLiquidSilk(oldScene, newScene, onComplete);
        break;
      case 'screen.universe_warp':
        this.transitionUniverseWarp(oldScene, newScene, onComplete);
        break;
      case 'screen.petal_curtain':
        this.transitionPetalCurtain(oldScene, newScene, onComplete);
        break;
      case 'screen.portal_open':
        this.transitionPortalOpen(oldScene, newScene, onComplete);
        break;
      case 'screen.memory_film':
        this.transitionMemoryFilm(oldScene, newScene, onComplete);
        break;
      default:
        this.executeFadeTransition(oldScene, newScene, onComplete);
        break;
    }
  }

  executeFadeTransition(oldScene, newScene, onComplete) {
    if (oldScene) {
      oldScene.classList.remove('scene-active');
      oldScene.style.opacity = '0';
    }
    if (newScene) {
      newScene.classList.add('scene-active');
      newScene.style.opacity = '1';
    }
    if (onComplete) onComplete();
  }

  // 1. Cinematic Light Sweep
  transitionLightSweep(oldScene, newScene, onComplete) {
    const sweep = document.createElement('div');
    sweep.className = 'fx-light-sweep-beam';
    this.viewport.appendChild(sweep);

    const tl = gsap.timeline({
      onComplete: () => {
        sweep.remove();
        if (onComplete) onComplete();
      }
    });

    tl.set(sweep, { x: '-120%', opacity: 1 });
    tl.to(sweep, {
      x: '120%',
      duration: 0.95 / (this.config.speed || 1.0),
      ease: 'power3.inOut'
    });

    // Midpoint switch
    tl.add(() => {
      if (oldScene) oldScene.classList.remove('scene-active');
      if (newScene) {
        newScene.classList.add('scene-active');
        this.animateSceneEntrance(newScene);
      }
    }, 0.45 / (this.config.speed || 1.0));
  }

  // 2. Liquid Silk Reveal
  transitionLiquidSilk(oldScene, newScene, onComplete) {
    const silk = document.createElement('div');
    silk.className = 'fx-liquid-silk-curtain';
    this.viewport.appendChild(silk);

    const tl = gsap.timeline({
      onComplete: () => {
        silk.remove();
        if (onComplete) onComplete();
      }
    });

    tl.set(silk, { y: '100%', opacity: 1 });
    tl.to(silk, {
      y: '-100%',
      duration: 1.15 / (this.config.speed || 1.0),
      ease: 'power2.inOut'
    });

    tl.add(() => {
      if (oldScene) oldScene.classList.remove('scene-active');
      if (newScene) {
        newScene.classList.add('scene-active');
        this.animateSceneEntrance(newScene);
      }
    }, 0.55 / (this.config.speed || 1.0));
  }

  // 3. Universe Warp
  transitionUniverseWarp(oldScene, newScene, onComplete) {
    const warp = document.createElement('div');
    warp.className = 'fx-universe-warp-overlay';
    this.viewport.appendChild(warp);

    const tl = gsap.timeline({
      onComplete: () => {
        warp.remove();
        if (onComplete) onComplete();
      }
    });

    tl.to(oldScene, { scale: 1.15, opacity: 0, duration: 0.5, ease: 'power2.in' });
    tl.fromTo(warp, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1.5, duration: 0.6, ease: 'expo.in' }, '-=0.3');

    tl.add(() => {
      if (oldScene) {
        oldScene.classList.remove('scene-active');
        gsap.set(oldScene, { scale: 1 });
      }
      if (newScene) {
        newScene.classList.add('scene-active');
        this.animateSceneEntrance(newScene);
      }
    });

    tl.to(warp, { opacity: 0, scale: 2.0, duration: 0.6, ease: 'power2.out' });
    tl.fromTo(newScene, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.65, ease: 'power3.out' }, '-=0.4');
  }

  // 4. Petal Curtain
  transitionPetalCurtain(oldScene, newScene, onComplete) {
    const curtain = document.createElement('div');
    curtain.className = 'fx-petal-curtain-container';
    // Create falling petals
    for (let i = 0; i < 28; i++) {
      const petal = document.createElement('div');
      petal.className = 'fx-curtain-petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.animationDelay = `${Math.random() * 0.4}s`;
      petal.style.transform = `scale(${Math.random() * 0.6 + 0.7}) rotate(${Math.random() * 360}deg)`;
      curtain.appendChild(petal);
    }
    this.viewport.appendChild(curtain);

    const tl = gsap.timeline({
      onComplete: () => {
        curtain.remove();
        if (onComplete) onComplete();
      }
    });

    tl.fromTo(curtain, { opacity: 0 }, { opacity: 1, duration: 0.35 });
    tl.to(oldScene, { opacity: 0, duration: 0.45 }, '-=0.1');

    tl.add(() => {
      if (oldScene) oldScene.classList.remove('scene-active');
      if (newScene) {
        newScene.classList.add('scene-active');
        this.animateSceneEntrance(newScene);
      }
    });

    tl.to(curtain, { opacity: 0, duration: 0.6, delay: 0.25 });
  }

  // 5. Portal Open
  transitionPortalOpen(oldScene, newScene, onComplete) {
    const portal = document.createElement('div');
    portal.className = 'fx-portal-circle-mask';
    this.viewport.appendChild(portal);

    const tl = gsap.timeline({
      onComplete: () => {
        portal.remove();
        if (onComplete) onComplete();
      }
    });

    tl.fromTo(portal,
      { scale: 0, opacity: 1 },
      { scale: 28, duration: 0.9 / (this.config.speed || 1.0), ease: 'power3.inOut' }
    );

    tl.add(() => {
      if (oldScene) oldScene.classList.remove('scene-active');
      if (newScene) {
        newScene.classList.add('scene-active');
        this.animateSceneEntrance(newScene);
      }
    }, 0.45 / (this.config.speed || 1.0));

    tl.to(portal, { opacity: 0, duration: 0.3 }, '-=0.2');
  }

  // 6. Memory Film Wipe
  transitionMemoryFilm(oldScene, newScene, onComplete) {
    const shutter = document.createElement('div');
    shutter.className = 'fx-memory-film-shutter';
    this.viewport.appendChild(shutter);

    const tl = gsap.timeline({
      onComplete: () => {
        shutter.remove();
        if (onComplete) onComplete();
      }
    });

    tl.fromTo(shutter, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power1.in' });
    tl.add(() => {
      if (oldScene) oldScene.classList.remove('scene-active');
      if (newScene) {
        newScene.classList.add('scene-active');
        this.animateSceneEntrance(newScene);
      }
    });
    tl.to(shutter, { opacity: 0, duration: 0.45, ease: 'power2.out' });
  }

  // -------------------------------------------------------------
  // TEXT & CONTENT ENTRANCE ORCHESTRATION
  // -------------------------------------------------------------
  animateSceneEntrance(sceneElement) {
    if (this.prefersReducedMotion || !window.gsap) return;

    const title = sceneElement.querySelector('h1, h2, .cinematic-title, .dream-quote');
    const subtitle = sceneElement.querySelector('p, .cinematic-subtitle, .dream-message');
    const buttons = sceneElement.querySelectorAll('.btn, .cinematic-cta-btn, .finale-replay-btn');

    const tl = gsap.timeline();
    if (title) {
      tl.fromTo(title,
        { opacity: 0, y: 24, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out' }
      );
    }
    if (subtitle) {
      tl.fromTo(subtitle,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.45'
      );
    }
    if (buttons && buttons.length > 0) {
      tl.fromTo(buttons,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' },
        '-=0.3'
      );
    }
  }

  // Image transition helper for Memory Lane photo decks
  getImageTransitionConfig() {
    return {
      type: this.config.image_transition || 'image.floating_memory',
      speed: this.config.speed || 1.0
    };
  }
}
