/**
 * ENGINE 5: COSMIC UNIVERSE (Layer A & B Finale Climax Engine)
 * Three.js 3D Starfield & Celestial Sphere + 5 Configurable Climax Choreographies:
 * 1. finale.heart_of_light: Luminous glowing particle heart framing the final wish.
 * 2. finale.grand_celebration: Multi-wave golden confetti cannons and starlight fireworks.
 * 3. finale.animated_letter: Keepsake royal scroll parchment reveal with glowing calligraphy.
 * 4. finale.universe: Hyperspace camera acceleration into recipient's personal constellation.
 * 5. finale.quiet_emotional: Candlelit breathing aura, slow intimate typography fade.
 */

export class CosmicUniverseEngine {
  constructor(container, animationConfig = {}) {
    this.container = container;
    this.animConfig = animationConfig;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.stars = null;
    this.sphere = null;
    this.animationFrameId = null;
    this.handleResize = this.resize.bind(this);
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.mouseX = 0;
    this.mouseY = 0;
  }

  mount() {
    this.initThree();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);
    window.addEventListener('mousemove', this.handleMouseMove);

    // Run the tailored Finale Climax choreography
    this.triggerFinaleClimax();
  }

  triggerFinaleClimax() {
    const finaleEffect = this.animConfig.finale_effect || 'finale.grand_celebration';
    const stardust = this.container.querySelector('.cosmic-stardust-message');
    const wishes = Array.from(this.container.querySelectorAll('.cosmic-wish-phrase, .cosmic-wish-tag'));
    const signature = this.container.querySelector('.cosmic-signature');
    const closingMsg = this.container.querySelector('.cosmic-closing-message');
    const haloStage = this.container.querySelector('.finale-hero-sculpture-stage');
    const portraitFrame = this.container.querySelector('.finale-recipient-portrait-frame');
    const centerpiece = this.container.querySelector('.finale-abstract-celestial-centerpiece');
    const constellationTitle = this.container.querySelector('.cosmic-constellation-title');
    const recipientName = this.container.querySelector('.finale-recipient-display-name');
    const tributeQuote = this.container.querySelector('.finale-tribute-quote');

    if (!window.gsap) return;

    const tl = gsap.timeline();

    // 1. Entrance of Hero Sculpture Stage (Luminous Halo & Celebrant Portrait)
    if (haloStage) {
      tl.fromTo(haloStage, { scale: 0.65, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.3, ease: 'power3.out' }, 0);
    }
    if (portraitFrame) {
      tl.fromTo(portraitFrame, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'back.out(1.4)' }, 0.2);
    }
    if (centerpiece) {
      tl.fromTo(centerpiece, { scale: 0.7, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: 0, duration: 1.2, ease: 'back.out(1.5)' }, 0.2);
    }
    if (constellationTitle) {
      tl.fromTo(constellationTitle, { opacity: 0, y: -10 }, { opacity: 0.9, y: 0, duration: 0.8, ease: 'power2.out' }, 0.4);
    }
    if (recipientName) {
      tl.fromTo(recipientName, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0.5);
    }

    if (finaleEffect === 'finale.heart_of_light') {
      // Create glowing SVG heart container
      const heart = document.createElement('div');
      heart.className = 'finale-fx-heart-light';
      heart.innerHTML = `
        <svg viewBox="0 0 100 100" class="heart-pulse-svg">
          <path d="M50 88 C20 60 5 40 5 25 A 20 20 0 0 1 50 15 A 20 20 0 0 1 95 25 C95 40 80 60 50 88 Z" fill="none" stroke="url(#heartGlow)" stroke-width="2.5" />
          <defs>
            <linearGradient id="heartGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FF6584" />
              <stop offset="50%" stop-color="#FFD700" />
              <stop offset="100%" stop-color="#B588FF" />
            </linearGradient>
          </defs>
        </svg>
      `;
      this.container.querySelector('.cosmic-content-wrap').prepend(heart);

      tl.fromTo(heart, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 0.85, duration: 1.4, ease: 'elastic.out(1, 0.5)' }, 0.4);
      if (stardust) tl.fromTo(stardust, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out' }, '-=0.8');
      if (closingMsg) tl.fromTo(closingMsg, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');
      if (tributeQuote) tl.fromTo(tributeQuote, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');
      if (wishes.length > 0) tl.fromTo(wishes, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.5 }, '-=0.3');
      if (signature) tl.fromTo(signature, { opacity: 0 }, { opacity: 1, duration: 0.8 });

    } else if (finaleEffect === 'finale.grand_celebration') {
      if (stardust) tl.fromTo(stardust, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.7)' }, 0.6);
      if (closingMsg) tl.fromTo(closingMsg, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5');
      if (tributeQuote) tl.fromTo(tributeQuote, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');
      if (wishes.length > 0) tl.fromTo(wishes, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.6 }, '-=0.3');
      if (signature) tl.fromTo(signature, { opacity: 0 }, { opacity: 1, duration: 0.8 });

      // Multi-stage fireworks & confetti bursts
      this.fireGrandCelebration();

    } else if (finaleEffect === 'finale.animated_letter' || finaleEffect === 'finale.letter_writes_itself') {
      const parchment = document.createElement('div');
      parchment.className = 'finale-fx-parchment-glow';
      this.container.querySelector('.cosmic-content-wrap').prepend(parchment);

      tl.fromTo(parchment, { opacity: 0, scaleY: 0 }, { opacity: 0.4, scaleY: 1, duration: 1.2, ease: 'power3.out' }, 0.5);
      if (stardust) tl.fromTo(stardust, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' }, '-=0.6');
      if (closingMsg) tl.fromTo(closingMsg, { opacity: 0, duration: 1.0 }, '-=0.4');
      if (tributeQuote) tl.fromTo(tributeQuote, { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.3');
      if (signature) tl.fromTo(signature, { opacity: 0, letterSpacing: '4px' }, { opacity: 1, letterSpacing: '1px', duration: 1.2 });

    } else if (finaleEffect === 'finale.universe' || finaleEffect === 'finale.universe_made_for_you') {
      // Warp camera acceleration in 3D
      if (this.camera) {
        gsap.fromTo(this.camera.position,
          { z: 600 },
          { z: 250, duration: 2.2, ease: 'power4.out' }
        );
      }
      if (stardust) tl.fromTo(stardust, { opacity: 0, scale: 0.5, filter: 'blur(10px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.6, ease: 'power3.out' }, 0.6);
      if (closingMsg) tl.fromTo(closingMsg, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9 }, '-=0.8');
      if (tributeQuote) tl.fromTo(tributeQuote, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
      if (wishes.length > 0) tl.fromTo(wishes, { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.6 }, '-=0.4');
      if (signature) tl.fromTo(signature, { opacity: 0 }, { opacity: 1, duration: 0.8 });

    } else if (finaleEffect === 'finale.living_portrait') {
      if (stardust) tl.fromTo(stardust, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, 0.6);
      if (closingMsg) tl.fromTo(closingMsg, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
      if (tributeQuote) tl.fromTo(tributeQuote, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');
      if (wishes.length > 0) tl.fromTo(wishes, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.6 }, '-=0.3');
      if (signature) tl.fromTo(signature, { opacity: 0 }, { opacity: 1, duration: 0.9 });

    } else if (finaleEffect === 'finale.storybook_finale') {
      if (stardust) tl.fromTo(stardust, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 0.6);
      if (closingMsg) tl.fromTo(closingMsg, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.0 }, '-=0.6');
      if (tributeQuote) tl.fromTo(tributeQuote, { opacity: 0 }, { opacity: 1, duration: 0.9 }, '-=0.4');
      if (signature) tl.fromTo(signature, { opacity: 0 }, { opacity: 1, duration: 0.8 });

    } else if (finaleEffect === 'finale.ethereal_pearl' || finaleEffect === 'finale.romantic_dream') {
      if (stardust) tl.fromTo(stardust, { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power2.out' }, 0.6);
      if (closingMsg) tl.fromTo(closingMsg, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.0 }, '-=0.6');
      if (tributeQuote) tl.fromTo(tributeQuote, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');
      if (wishes.length > 0) tl.fromTo(wishes, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.6 }, '-=0.4');
      if (signature) tl.fromTo(signature, { opacity: 0 }, { opacity: 1, duration: 0.9 });

    } else if (finaleEffect === 'finale.editorial_minimal') {
      if (stardust) tl.fromTo(stardust, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, 0.6);
      if (closingMsg) tl.fromTo(closingMsg, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.8 }, '-=0.4');
      if (tributeQuote) tl.fromTo(tributeQuote, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.7 }, '-=0.3');
      if (signature) tl.fromTo(signature, { opacity: 0 }, { opacity: 1, duration: 0.8 });

    } else if (finaleEffect === 'finale.memory_constellation' || finaleEffect === 'finale.memory_collage') {
      if (stardust) tl.fromTo(stardust, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.4)' }, 0.6);
      if (closingMsg) tl.fromTo(closingMsg, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
      if (tributeQuote) tl.fromTo(tributeQuote, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');
      if (wishes.length > 0) tl.fromTo(wishes, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.6 }, '-=0.3');
      if (signature) tl.fromTo(signature, { opacity: 0 }, { opacity: 1, duration: 0.8 });

    } else {
      // Quiet, dignified, heartfelt fade / fallback
      if (stardust) tl.fromTo(stardust, { opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'power2.out' }, 0.6);
      if (closingMsg) tl.fromTo(closingMsg, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power1.out' }, '-=0.8');
      if (tributeQuote) tl.fromTo(tributeQuote, { opacity: 0 }, { opacity: 1, duration: 1.0 }, '-=0.5');
      if (wishes.length > 0) tl.fromTo(wishes, { opacity: 0 }, { opacity: 1, stagger: 0.1, duration: 0.8 }, '-=0.5');
      if (signature) tl.fromTo(signature, { opacity: 0 }, { opacity: 1, duration: 1.2 });
    }
  }

  fireGrandCelebration() {
    if (!window.confetti) return;

    // Cannon 1 & 2: Left and Right bursts
    window.confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#E6C065', '#FFD700', '#FF6584']
    });
    window.confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#38E1FF', '#B588FF', '#FFD700']
    });

    // Cannon 3: High altitude center explosion
    setTimeout(() => {
      window.confetti({
        particleCount: 110,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#FFFFFF', '#FFD700', '#FF6584', '#B588FF', '#38E1FF']
      });
    }, 600);
  }

  initThree() {
    if (!window.THREE) {
      this.initCanvasFallback();
      return;
    }

    try {
      const w = window.innerWidth;
      const h = window.innerHeight;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
      this.camera.position.z = 250;

      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.domElement.className = 'cosmic-canvas-3d';
      this.container.prepend(this.renderer.domElement);

      // 1. Create Starfield Particles
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1400;
      const posArray = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 900;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const starMat = new THREE.PointsMaterial({
        size: 2.2,
        color: 0xE6C065,
        transparent: true,
        opacity: 0.85
      });
      this.stars = new THREE.Points(starGeo, starMat);
      this.scene.add(this.stars);

      // 2. Ethereal Celestial Orbital Rings (Deep atmospheric backdrop, no tiny sphere)
      const celestialGroup = new THREE.Group();
      celestialGroup.position.set(0, 0, -120);

      const ringGeo1 = new THREE.RingGeometry(110, 112, 64);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: 0xE6C065,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.18
      });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 3;
      celestialGroup.add(ring1);

      const ringGeo2 = new THREE.RingGeometry(75, 76.5, 64);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0xB588FF,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15
      });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.y = Math.PI / 4;
      ring2.rotation.x = -Math.PI / 5;
      celestialGroup.add(ring2);

      this.sphere = celestialGroup;
      this.scene.add(this.sphere);

      this.render();
    } catch (err) {
      console.warn('WebGL init failed, falling back to 2D Canvas:', err);
      this.initCanvasFallback();
    }
  }

  initCanvasFallback() {
    const canvas = document.createElement('canvas');
    canvas.className = 'cosmic-canvas-3d';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.container.prepend(canvas);
    const ctx = canvas.getContext('2d');

    const stars = Array.from({ length: 250 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      alpha: Math.random()
    }));

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      stars.forEach(s => {
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  onMouseMove(e) {
    this.mouseX = (e.clientX - window.innerWidth / 2) * 0.04;
    this.mouseY = (e.clientY - window.innerHeight / 2) * 0.04;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (this.camera && this.renderer) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }
  }

  render() {
    if (this.stars) {
      this.stars.rotation.y += 0.001;
      this.stars.rotation.x += 0.0005;
    }
    if (this.sphere) {
      this.sphere.rotation.y += 0.0035;
      this.sphere.rotation.x += 0.0018;
    }
    if (this.camera) {
      this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
      this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
      this.camera.lookAt(this.scene.position);
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    this.animationFrameId = requestAnimationFrame(this.render.bind(this));
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
      this.renderer.dispose();
      this.renderer = null;
    }
  }
}
