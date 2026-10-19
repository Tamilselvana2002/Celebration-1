/**
 * ENGINE 2: ROMANTIC DREAM WORLD
 * Fullscreen Canvas petal & heart particle simulation + soft glassmorphic reveal
 * Auto-fits across all viewports (mobile, tablet, desktop, 4K ultrawide).
 */

export class RomanticDreamEngine {
  constructor(container, config = {}) {
    this.container = container;
    this.config = config;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationFrameId = null;
    this.timeline = null;
    this.handleResize = this.resize.bind(this);
    this.handleClick = this.spawnBloom.bind(this);
  }

  mount() {
    this.canvas = this.container.querySelector('.dream-particles-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'dream-particles-canvas viewport-ambient-canvas';
      this.container.prepend(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);
    this.container.addEventListener('click', this.handleClick);

    this.initParticles();
    this.render();

    // Reveal glass card with smooth GSAP entrance
    const card = this.container.querySelector('.dream-glass-card');
    if (card && window.gsap) {
      this.timeline = gsap.timeline();
      this.timeline.fromTo(card, 
        { opacity: 0, y: 35, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' }
      );
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    // Responsive particle count: more on wide screens, optimized on mobile
    const count = window.innerWidth > 1200 ? 55 : (window.innerWidth > 768 ? 40 : 25);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle(x, y) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      x: x !== undefined ? x : Math.random() * w,
      y: y !== undefined ? y : Math.random() * h,
      size: Math.random() * 12 + 6,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: Math.random() * 1.2 + 0.5,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.01,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2.5,
      opacity: Math.random() * 0.5 + 0.35,
      isHeart: Math.random() > 0.55
    };
  }

  spawnBloom(e) {
    const clickX = e.clientX;
    const clickY = e.clientY;
    for (let i = 0; i < 12; i++) {
      const p = this.createParticle(clickX, clickY);
      p.speedX = (Math.random() - 0.5) * 4;
      p.speedY = (Math.random() - 0.5) * 4;
      p.opacity = 0.9;
      this.particles.push(p);
    }
    if (window.CelebrationAudio) window.CelebrationAudio.playChime();
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let p of this.particles) {
      p.y += p.speedY;
      p.sway += p.swaySpeed;
      p.x += p.speedX + Math.sin(p.sway) * 0.7;
      p.rotation += p.rotationSpeed;

      if (p.y > this.canvas.height + 25) {
        p.y = -25;
        p.x = Math.random() * this.canvas.width;
      }
      if (p.x < -30) p.x = this.canvas.width + 30;
      if (p.x > this.canvas.width + 30) p.x = -30;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;

      if (p.isHeart) {
        this.drawHeart(this.ctx, p.size);
      } else {
        this.drawPetal(this.ctx, p.size);
      }

      this.ctx.restore();
    }

    this.animationFrameId = requestAnimationFrame(this.render.bind(this));
  }

  drawPetal(ctx, size) {
    ctx.fillStyle = '#FF8DA1';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.55, size * 1.25, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHeart(ctx, size) {
    ctx.fillStyle = '#FF6584';
    ctx.beginPath();
    const d = size * 0.7;
    ctx.moveTo(0, d / 4);
    ctx.quadraticCurveTo(0, 0, d / 2, 0);
    ctx.quadraticCurveTo(d, 0, d, d / 2);
    ctx.quadraticCurveTo(d, d, 0, d * 1.5);
    ctx.quadraticCurveTo(-d, d, -d, d / 2);
    ctx.quadraticCurveTo(-d, 0, -d / 2, 0);
    ctx.quadraticCurveTo(0, 0, 0, d / 4);
    ctx.fill();
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
    this.container.removeEventListener('click', this.handleClick);
  }
}
