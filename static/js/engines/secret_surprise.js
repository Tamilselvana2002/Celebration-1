/**
 * ENGINE 4: SECRET SURPRISE (Layer A & B True 3D Three.js Gift Box Engine)
 * Features True 3D Volumetric Meshes, Interactive 3D Drag-to-Rotate,
 * Kinetic 3D Lid Detachment & Internal Light Chamber Eruption.
 *
 * 3D Styles:
 * 1. cosmic_relic: Fabergé Starlight Celestial Egg with counter-rotating gilded 3D orbital rings & glowing stellar core (User Image #1).
 * 2. champagne_gold / royal_gold: Luxury satin-textured 3D box with 3D organza bow knot and ribbon wraps (User Image #2).
 * 3. dream_prism / cyber_crystal: Translucent 3D crystal cube with cyan & magenta neon edge bevels and floating core shard (User Image #3).
 * Additional styles: enchanted_chest, holographic, blooming, liquid_glass, minimal_art.
 * CSS 3D fallback is preserved if WebGL is unsupported.
 */

export class SecretSurpriseEngine {
  constructor(container, animationConfig = {}) {
    this.container = container;
    this.animConfig = animationConfig;
    this.boxStage = null;
    this.letterUnfold = null;
    this.state = 'idle'; // idle | opening | revealed | skipped
    this.isOpened = false;

    // Three.js 3D properties
    this.threeContainer = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.giftGroup = null;
    this.baseGroup = null;
    this.lidGroup = null;
    this.relicCoreGroup = null;
    this.orbitalRings = [];
    this.innerPointLight = null;
    this.animFrameId = null;
    this.targetRotX = 0.18;
    this.targetRotY = 0.35;
    this.isPointerDown = false;
    this.pointerStart = { x: 0, y: 0 };
    this.pointerLast = { x: 0, y: 0 };
    this.totalDragDist = 0;

    // Bound listeners
    this.handleClick = this.openSurprise.bind(this);
    this.handleSkip = this.skipToReveal.bind(this);
    this.handleRewrap = this.rewrapBox.bind(this);
    this.handleResize = this.resize.bind(this);
    this.onPointerDown = this.handlePointerDown.bind(this);
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerUp = this.handlePointerUp.bind(this);
  }

  mount() {
    this.boxStage = this.container.querySelector('.sculpture-stage-viewport, .gift-box-stage');
    this.letterUnfold = this.container.querySelector('.surprise-letter-unfold');
    this.threeContainer = this.container.querySelector('#giftThreeContainer, .gift-three-canvas-wrap');
    this.cssBox = this.container.querySelector('.sculpture-artifact-3d, .gift-box-3d');

    // Ensure stage and 3D container are visible and letter is hidden on initial mount or replay
    if (this.boxStage) this.boxStage.style.display = 'block';
    if (this.threeContainer) this.threeContainer.style.display = 'block';
    if (this.letterUnfold) this.letterUnfold.style.display = 'none';
    const prompt = this.container.querySelector('.surprise-prompt');
    if (prompt) {
      prompt.style.opacity = '1';
      prompt.style.transform = '';
    }
    this.isOpened = false;
    this.state = 'idle';

    // Attempt to initialize True 3D Three.js WebGL engine
    const threeInitialized = this.initThreeBox();

    if (!threeInitialized) {
      // Fallback: attach click listener to CSS 3D stage
      if (this.boxStage) {
        this.boxStage.addEventListener('click', this.handleClick);
      }
    } else {
      // Hide CSS 3D box when Three.js is actively rendering
      if (this.cssBox) {
        this.cssBox.style.display = 'none';
      }
    }

    const skipBtn = this.container.querySelector('.gift-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', this.handleSkip);
    }

    const rewrapBtn = this.container.querySelector('.gift-rewrap-btn');
    if (rewrapBtn) {
      rewrapBtn.addEventListener('click', this.handleRewrap);
    }

    window.addEventListener('resize', this.handleResize);
  }

  /* ==========================================================================
     TRUE 3D THREE.JS WEBGL INITIALIZATION & GEOMETRY BUILDER
     ========================================================================== */

  initThreeBox() {
    if (!window.THREE || !this.threeContainer) {
      return false;
    }

    try {
      const rect = this.threeContainer.getBoundingClientRect();
      const width = rect.width > 0 ? rect.width : 280;
      const height = rect.height > 0 ? rect.height : 280;

      // 1. Scene, Camera, Renderer
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.camera.position.set(0, 20, 185);
      this.camera.lookAt(0, 0, 0);

      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.threeContainer.innerHTML = '';
      this.threeContainer.appendChild(this.renderer.domElement);

      // 2. Lighting Setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      this.scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
      keyLight.position.set(60, 100, 80);
      this.scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xd4af37, 1.4);
      fillLight.position.set(-60, -30, -50);
      this.scene.add(fillLight);

      const topGlint = new THREE.DirectionalLight(0xffffff, 1.5);
      topGlint.position.set(0, 120, 30);
      this.scene.add(topGlint);

      // Internal light chamber source (erupts on click)
      this.innerPointLight = new THREE.PointLight(0xffd700, 0, 260);
      this.innerPointLight.position.set(0, 10, 0);
      this.scene.add(this.innerPointLight);

      // 3. Hierarchical Groups
      this.giftGroup = new THREE.Group();
      this.baseGroup = new THREE.Group();
      this.lidGroup = new THREE.Group();
      this.relicCoreGroup = new THREE.Group();
      this.orbitalRings = [];

      this.giftGroup.add(this.baseGroup);
      this.giftGroup.add(this.lidGroup);
      this.giftGroup.add(this.relicCoreGroup);
      this.scene.add(this.giftGroup);

      // 4. Construct 3D Mesh based on configured gift style
      const style = this.container.dataset.giftStyle || 'cosmic_relic';
      this.build3DBoxMesh(style);

      // 5. Drag-to-Rotate & Click Listeners on canvas container
      this.threeContainer.addEventListener('pointerdown', this.onPointerDown);
      window.addEventListener('pointermove', this.onPointerMove);
      window.addEventListener('pointerup', this.onPointerUp);

      // 6. Start Render Loop
      this.startRenderLoop();
      return true;
    } catch (err) {
      console.warn('Three.js gift box initialization failed, falling back to CSS 3D:', err);
      return false;
    }
  }

  build3DBoxMesh(style) {
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.22
    });

    const satinMat = new THREE.MeshStandardMaterial({
      color: 0xdec078,
      metalness: 0.35,
      roughness: 0.45
    });

    switch (style) {
      // 1. Cosmic Starlight Relic (User Image #1: Fabergé Celestial Egg & Orbiting Rings)
      case 'cosmic_relic':
      case 'cosmic_artifact':
      case 'cosmic_portal': {
        const velvetRubyMat = new THREE.MeshStandardMaterial({
          color: 0x6e101f,
          metalness: 0.5,
          roughness: 0.35
        });

        // Lower egg cup (Base)
        const baseCupGeo = new THREE.SphereGeometry(30, 36, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const baseCup = new THREE.Mesh(baseCupGeo, velvetRubyMat);
        baseCup.scale.set(1, 1.25, 1);
        this.baseGroup.add(baseCup);

        // Gilded filigree band around base rim
        const rimGeo = new THREE.TorusGeometry(30.2, 1.6, 16, 48);
        const rimMesh = new THREE.Mesh(rimGeo, goldMat);
        rimMesh.rotation.x = Math.PI / 2;
        this.baseGroup.add(rimMesh);

        // Upper dome lid (Detachable Crown)
        const lidDomeGeo = new THREE.SphereGeometry(30, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2);
        const lidDome = new THREE.Mesh(lidDomeGeo, velvetRubyMat);
        lidDome.scale.set(1, 1.25, 1);
        this.lidGroup.add(lidDome);

        // Crown finial ornament
        const finialGeo = new THREE.ConeGeometry(4.5, 14, 16);
        const finialMesh = new THREE.Mesh(finialGeo, goldMat);
        finialMesh.position.y = 38;
        this.lidGroup.add(finialMesh);

        // Top filigree ring on lid
        const lidRimGeo = new THREE.TorusGeometry(30.2, 1.4, 16, 48);
        const lidRimMesh = new THREE.Mesh(lidRimGeo, goldMat);
        lidRimMesh.rotation.x = Math.PI / 2;
        this.lidGroup.add(lidRimMesh);

        // Inner glowing stellar core relic
        const coreGeo = new THREE.OctahedronGeometry(9, 0);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xffea79,
          emissive: 0xffaa00,
          emissiveIntensity: 0.9,
          roughness: 0.1,
          metalness: 0.2
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        this.relicCoreGroup.add(coreMesh);

        // Gilded 3D Orbital Rings
        const ringGeo1 = new THREE.TorusGeometry(40, 1.3, 16, 64);
        const ring1 = new THREE.Mesh(ringGeo1, goldMat);
        ring1.rotation.x = Math.PI / 3;
        ring1.rotation.y = Math.PI / 6;
        this.giftGroup.add(ring1);
        this.orbitalRings.push(ring1);

        const ringGeo2 = new THREE.TorusGeometry(43, 1.1, 16, 64);
        const ring2 = new THREE.Mesh(ringGeo2, goldMat);
        ring2.rotation.x = -Math.PI / 3;
        ring2.rotation.y = -Math.PI / 5;
        this.giftGroup.add(ring2);
        this.orbitalRings.push(ring2);
        break;
      }

      // 2. Luxury Champagne Royal Gold (User Image #2: Satin Box & Organza Bow)
      case 'champagne_gold':
      case 'royal_gold':
      case 'velvet_heritage':
      case 'ruby_elegance':
      case 'emerald_royale':
      case 'midnight_sapphire': {
        const boxColor = style === 'ruby_elegance' ? 0x7a111e :
          style === 'emerald_royale' ? 0x0d3f28 :
          style === 'midnight_sapphire' ? 0x0f244c :
          style === 'velvet_heritage' ? 0x421018 : 0xdec078;

        const mainSatinMat = new THREE.MeshStandardMaterial({
          color: boxColor,
          roughness: 0.4,
          metalness: 0.35
        });

        // Box Base
        const baseBoxGeo = new THREE.BoxGeometry(50, 44, 50);
        const baseBox = new THREE.Mesh(baseBoxGeo, mainSatinMat);
        this.baseGroup.add(baseBox);

        // Vertical Ribbon Crosses around base
        const ribGeoV = new THREE.BoxGeometry(50.4, 44.4, 9);
        const ribMeshV = new THREE.Mesh(ribGeoV, goldMat);
        this.baseGroup.add(ribMeshV);

        const ribGeoH = new THREE.BoxGeometry(9, 44.4, 50.4);
        const ribMeshH = new THREE.Mesh(ribGeoH, goldMat);
        this.baseGroup.add(ribMeshH);

        // Detachable Lid
        const lidGeo = new THREE.BoxGeometry(53, 11, 53);
        const lidMesh = new THREE.Mesh(lidGeo, mainSatinMat);
        lidMesh.position.y = 23;
        this.lidGroup.add(lidMesh);

        // Lid ribbon cross
        const lidRibV = new THREE.BoxGeometry(53.4, 11.4, 9);
        const lidRibMeshV = new THREE.Mesh(lidRibV, goldMat);
        lidRibMeshV.position.y = 23;
        this.lidGroup.add(lidRibMeshV);

        const lidRibH = new THREE.BoxGeometry(9, 11.4, 53.4);
        const lidRibMeshH = new THREE.Mesh(lidRibH, goldMat);
        lidRibMeshH.position.y = 23;
        this.lidGroup.add(lidRibMeshH);

        // 3D Organza Bow Knot on Lid Top
        const bowGroup = new THREE.Group();
        bowGroup.position.set(0, 29, 0);

        // Left bow loop
        const loopGeo1 = new THREE.TorusGeometry(8, 2.2, 12, 28);
        const loop1 = new THREE.Mesh(loopGeo1, goldMat);
        loop1.position.set(-7, 3, 0);
        loop1.rotation.y = Math.PI / 4;
        loop1.rotation.z = Math.PI / 3;
        bowGroup.add(loop1);

        // Right bow loop
        const loopGeo2 = new THREE.TorusGeometry(8, 2.2, 12, 28);
        const loop2 = new THREE.Mesh(loopGeo2, goldMat);
        loop2.position.set(7, 3, 0);
        loop2.rotation.y = -Math.PI / 4;
        loop2.rotation.z = -Math.PI / 3;
        bowGroup.add(loop2);

        // Center tie
        const knotGeo = new THREE.SphereGeometry(3.8, 16, 16);
        const knotMesh = new THREE.Mesh(knotGeo, goldMat);
        bowGroup.add(knotMesh);

        this.lidGroup.add(bowGroup);
        break;
      }

      // 3. Cyber Neon Dream Prism (User Image #3: Translucent Crystal & Neon Bevels)
      case 'dream_prism':
      case 'cyber_crystal':
      case 'holographic':
      case 'liquid_glass':
      default: {
        const crystalMat = new THREE.MeshStandardMaterial({
          color: 0x121b2d,
          roughness: 0.12,
          metalness: 0.3,
          transparent: true,
          opacity: 0.8
        });

        const neonCyanMat = new THREE.LineBasicMaterial({ color: 0x38e1ff, linewidth: 2 });
        const neonMagentaMat = new THREE.LineBasicMaterial({ color: 0xd946ef, linewidth: 2 });

        // Base Crystal Box
        const baseBoxGeo = new THREE.BoxGeometry(48, 42, 48);
        const baseBox = new THREE.Mesh(baseBoxGeo, crystalMat);
        this.baseGroup.add(baseBox);

        // Glowing Neon Cyan Edges
        const baseEdgesGeo = new THREE.EdgesGeometry(baseBoxGeo);
        const baseEdges = new THREE.LineSegments(baseEdgesGeo, neonCyanMat);
        this.baseGroup.add(baseEdges);

        // Detachable Crystal Lid
        const lidGeo = new THREE.BoxGeometry(51, 10, 51);
        const lidMesh = new THREE.Mesh(lidGeo, crystalMat);
        lidMesh.position.y = 22;
        this.lidGroup.add(lidMesh);

        // Glowing Neon Magenta Edges on Lid
        const lidEdgesGeo = new THREE.EdgesGeometry(lidGeo);
        const lidEdges = new THREE.LineSegments(lidEdgesGeo, neonMagentaMat);
        lidEdges.position.y = 22;
        this.lidGroup.add(lidEdges);

        // Floating inner glowing cyan shard
        const shardGeo = new THREE.IcosahedronGeometry(8, 0);
        const shardMat = new THREE.MeshStandardMaterial({
          color: 0x38e1ff,
          emissive: 0x00c8ff,
          emissiveIntensity: 0.85,
          roughness: 0.15
        });
        const shardMesh = new THREE.Mesh(shardGeo, shardMat);
        this.relicCoreGroup.add(shardMesh);
        break;
      }
    }
  }

  /* ==========================================================================
     INTERACTIVE POINTER / TOUCH DRAG & CLICK CONTROLS
     ========================================================================== */

  handlePointerDown(e) {
    this.isPointerDown = true;
    this.pointerStart = { x: e.clientX, y: e.clientY };
    this.pointerLast = { x: e.clientX, y: e.clientY };
    this.totalDragDist = 0;
  }

  handlePointerMove(e) {
    if (!this.isPointerDown) return;
    const dx = e.clientX - this.pointerLast.x;
    const dy = e.clientY - this.pointerLast.y;
    this.totalDragDist += Math.hypot(dx, dy);

    this.targetRotY += dx * 0.012;
    this.targetRotX = Math.max(-0.6, Math.min(0.6, this.targetRotX + dy * 0.012));
    this.pointerLast = { x: e.clientX, y: e.clientY };
  }

  handlePointerUp() {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;

    // If pointer barely moved, treat as unlock click!
    if (this.totalDragDist < 9 && this.state === 'idle' && !this.isOpened) {
      this.openSurprise();
    }
  }

  /* ==========================================================================
     RENDER & ANIMATION LOOP
     ========================================================================== */

  startRenderLoop() {
    const render = () => {
      if (!this.renderer) return;
      this.animFrameId = requestAnimationFrame(render);

      // Idle float & gentle rotation when untouched
      if (!this.isPointerDown && this.state === 'idle') {
        this.targetRotY += 0.0035;
        this.giftGroup.position.y = Math.sin(Date.now() * 0.002) * 3.5;
      }

      // Smooth lerp rotation toward target
      this.giftGroup.rotation.y += (this.targetRotY - this.giftGroup.rotation.y) * 0.08;
      this.giftGroup.rotation.x += (this.targetRotX - this.giftGroup.rotation.x) * 0.08;

      // Real-time orbital ring counter-rotation
      if (this.orbitalRings.length >= 2) {
        this.orbitalRings[0].rotation.z += 0.015;
        this.orbitalRings[1].rotation.x += 0.012;
      }

      // Spinning inner relic core
      if (this.relicCoreGroup) {
        this.relicCoreGroup.rotation.y += 0.02;
        this.relicCoreGroup.rotation.z += 0.01;
      }

      this.renderer.render(this.scene, this.camera);
    };

    render();
  }

  resize() {
    if (!this.renderer || !this.camera || !this.threeContainer) return;
    const rect = this.threeContainer.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : 280;
    const height = rect.height > 0 ? rect.height : 280;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /* ==========================================================================
     3D SURPRISE UNLOCKING & REVEAL CHOREOGRAPHY
     ========================================================================== */

  openSurprise() {
    if (this.isOpened || this.state === 'opening' || this.state === 'revealed') return;
    this.state = 'opening';
    this.isOpened = true;

    // Trigger audio chime & duck background soundtrack
    if (window.CelebrationAudio) {
      if (typeof window.CelebrationAudio.playChime === 'function') {
        window.CelebrationAudio.playChime();
      }
      if (typeof window.CelebrationAudio.duckAudio === 'function') {
        window.CelebrationAudio.duckAudio(0.25, 2.8);
      }
    }

    const prompt = this.container.querySelector('.surprise-prompt');
    const guide = this.container.querySelector('.gift-interaction-guide');
    if (prompt && window.gsap) {
      gsap.to(prompt, { opacity: 0, y: -15, duration: 0.4 });
    }
    if (guide && window.gsap) {
      gsap.to(guide, { opacity: 0, duration: 0.3 });
    }

    // 1. If True 3D Three.js is active, run 3D WebGL unlocking choreography
    if (this.renderer && this.giftGroup && window.gsap) {
      this.openThree3DBox();
      return;
    }

    // 2. Fallback to CSS 3D opening
    const box = this.container.querySelector('.sculpture-artifact-3d, .gift-box-3d');
    const lid = this.container.querySelector('.sculpture-articulated-crown, .gift-box-lid');
    const innerChamber = this.container.querySelector('.sculpture-inner-chamber');
    this.openCosmicRelic(box, lid, innerChamber);
  }

  openThree3DBox() {
    const style = this.container.dataset.giftStyle || 'cosmic_relic';
    const tl = gsap.timeline();

    // 1. Shudder Shiver
    tl.to(this.giftGroup.position, {
      x: 3.5,
      duration: 0.06,
      repeat: 5,
      yoyo: true
    });

    // 2. Inner Light Flare erupts from chamber
    if (this.innerPointLight) {
      tl.to(this.innerPointLight, {
        intensity: 8.5,
        distance: 300,
        duration: 0.65,
        ease: 'power2.in'
      }, 0.1);
    }

    // 3. Kinetic 3D Lid Detachment & Flight
    if (this.lidGroup) {
      tl.to(this.lidGroup.position, {
        y: 110,
        duration: 0.85,
        ease: 'power3.out'
      }, 0.2);

      tl.to(this.lidGroup.rotation, {
        x: 1.6,
        z: 0.4,
        duration: 0.9,
        ease: 'power2.out'
      }, 0.2);

      tl.to(this.lidGroup.scale, {
        x: 0.3,
        y: 0.3,
        z: 0.3,
        duration: 0.6,
        ease: 'power2.in'
      }, 0.4);
    }

    // 4. Expand Orbital Rings if present
    if (this.orbitalRings.length > 0) {
      this.orbitalRings.forEach(ring => {
        tl.to(ring.scale, {
          x: 2.3,
          y: 2.3,
          z: 2.3,
          duration: 0.75,
          ease: 'power2.out'
        }, 0.25);
      });
    }

    // 5. Expand glowing core relic
    if (this.relicCoreGroup) {
      tl.to(this.relicCoreGroup.scale, {
        x: 2.6,
        y: 2.6,
        z: 2.6,
        duration: 0.8,
        ease: 'back.out(2)'
      }, 0.3);
    }

    // 6. Fade out 3D canvas and smoothly reveal letter
    tl.to(this.giftGroup.scale, {
      x: 1.25,
      y: 1.25,
      z: 1.25,
      duration: 0.6,
      delay: 0.35,
      onComplete: () => {
        if (this.threeContainer) {
          this.threeContainer.style.display = 'none';
        }
        this.revealLetter();
      }
    });

    // Fire themed confetti palette
    const confettiColors = style === 'dream_prism' ? ['#38E1FF', '#D946EF', '#B588FF', '#FFFFFF'] :
      style === 'champagne_gold' ? ['#FFD700', '#FFF3C4', '#E6C065', '#D4AF37'] :
      ['#FFD700', '#FFFFFF', '#38E1FF', '#E6C065'];

    this.fireConfetti(confettiColors);
  }

  // CSS 3D Fallback Methods
  openCosmicRelic(box, lid, innerChamber) {
    if (!window.gsap) {
      this.revealLetter();
      return;
    }

    const star = this.container.querySelector('.aperture-core-star');
    const sunbeams = this.container.querySelector('.aperture-sunbeams');

    const tl = gsap.timeline({ onComplete: () => this.revealLetter() });
    tl.to(box, { x: -5, duration: 0.08, repeat: 4, yoyo: true });
    if (star) {
      tl.to(star, { scale: 3.2, textShadow: '0 0 30px #fff, 0 0 80px #ffd700, 0 0 140px #ffaa00', duration: 0.8, ease: 'power2.in' }, 0.2);
    }
    if (sunbeams) {
      tl.to(sunbeams, { scale: 2.8, opacity: 1, duration: 0.8, ease: 'power2.in' }, 0.2);
    }
    tl.to(lid, { y: -160, rotateX: 60, opacity: 0, duration: 0.85, ease: 'power3.out' }, 0.5);
    tl.to(box, { scale: 1.25, opacity: 0, duration: 0.65, ease: 'power2.out' }, 0.7);

    this.fireConfetti(['#FFD700', '#FFFFFF', '#38E1FF', '#E6C065']);
  }

  skipToReveal() {
    this.state = 'skipped';
    this.isOpened = true;
    if (this.threeContainer) this.threeContainer.style.display = 'none';
    this.revealLetter();
  }

  rewrapBox() {
    this.state = 'idle';
    this.isOpened = false;

    // Reset Three.js 3D box
    if (this.threeContainer && this.renderer && this.giftGroup) {
      this.threeContainer.style.display = 'block';
      this.giftGroup.scale.set(1, 1, 1);
      this.giftGroup.position.set(0, 0, 0);
      if (this.lidGroup) {
        this.lidGroup.position.set(0, 0, 0);
        this.lidGroup.rotation.set(0, 0, 0);
        this.lidGroup.scale.set(1, 1, 1);
      }
      if (this.innerPointLight) {
        this.innerPointLight.intensity = 0;
      }
      if (this.relicCoreGroup) {
        this.relicCoreGroup.scale.set(1, 1, 1);
      }
      this.orbitalRings.forEach(ring => ring.scale.set(1, 1, 1));
    }

    if (this.boxStage) {
      this.boxStage.style.display = 'block';
      const prompt = this.container.querySelector('.surprise-prompt');
      const guide = this.container.querySelector('.gift-interaction-guide');
      if (prompt) {
        prompt.style.opacity = '1';
        prompt.style.transform = '';
      }
      if (guide) {
        guide.style.opacity = '0.85';
      }
    }

    if (this.letterUnfold) {
      this.letterUnfold.style.display = 'none';
    }

    const skipBtn = this.container.querySelector('.gift-skip-btn');
    const rewrapBtn = this.container.querySelector('.gift-rewrap-btn');
    if (skipBtn) skipBtn.style.display = 'inline-block';
    if (rewrapBtn) rewrapBtn.style.display = 'none';
  }

  revealLetter() {
    this.state = 'revealed';
    if (this.boxStage) this.boxStage.style.display = 'none';
    if (this.letterUnfold) {
      this.letterUnfold.style.display = 'block';
      if (window.gsap) {
        gsap.fromTo(this.letterUnfold,
          { scale: 0.7, opacity: 0, y: 35 },
          { scale: 1, opacity: 1, y: 0, duration: 0.85, ease: 'back.out(1.2)' }
        );
      } else {
        this.letterUnfold.style.opacity = '1';
      }
    }

    const skipBtn = this.container.querySelector('.gift-skip-btn');
    const rewrapBtn = this.container.querySelector('.gift-rewrap-btn');
    if (skipBtn) skipBtn.style.display = 'none';
    if (rewrapBtn) rewrapBtn.style.display = 'inline-block';
  }

  fireConfetti(customColors = null) {
    if (!window.confetti) return;

    const colors = customColors || ['#E6C065', '#FFD700', '#FF6584', '#B588FF', '#38E1FF'];
    const origins = [0.25, 0.5, 0.75];
    origins.forEach((xPos, idx) => {
      setTimeout(() => {
        window.confetti({
          particleCount: 75,
          spread: 85,
          origin: { y: 0.7, x: xPos },
          colors: colors
        });
      }, idx * 140);
    });
  }

  reset() {
    this.rewrapBox();
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.threeContainer) {
      this.threeContainer.removeEventListener('pointerdown', this.onPointerDown);
      this.threeContainer.innerHTML = '';
    }
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('resize', this.handleResize);

    if (this.boxStage) {
      this.boxStage.removeEventListener('click', this.handleClick);
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    this.giftGroup = null;
    this.baseGroup = null;
    this.lidGroup = null;
    this.relicCoreGroup = null;
    this.orbitalRings = [];
  }
}
