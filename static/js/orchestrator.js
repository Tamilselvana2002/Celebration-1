/**
 * CELEBRATION STUDIO — SCENE ORCHESTRATOR
 * Coordinates scene lifecycle, cinematic transitions via AnimationController,
 * audio controller, HUD, and live studio sync.
 */

import { CinematicEngine } from './engines/cinematic.js';
import { RomanticDreamEngine } from './engines/romantic_dream.js';
import { MemoryLaneEngine } from './engines/memory_lane.js';
import { SecretSurpriseEngine } from './engines/secret_surprise.js';
import { CosmicUniverseEngine } from './engines/cosmic_universe.js';
import { AnimationController } from './animation_controller.js';

export class SceneOrchestrator {
  constructor(viewportElement) {
    this.viewport = viewportElement;
    this.scenes = Array.from(this.viewport.querySelectorAll('.scene-container'));
    this.currentIndex = 0;
    this.activeEngine = null;
    this.isTransitioning = false;

    // Layer B Animation Controller
    this.animationController = new AnimationController(this.viewport);

    // HUD Elements
    this.dotsContainer = this.viewport.querySelector('.hud-nav-dots');
    this.prevBtn = this.viewport.querySelector('.hud-prev-btn');
    this.nextBtn = this.viewport.querySelector('.hud-next-btn');
    this.audioToggle = this.viewport.querySelector('.hud-audio-toggle');
    this.skipIntroBtn = this.viewport.querySelector('.hud-skip-intro-btn');
    this.fullscreenBtn = this.viewport.querySelector('.hud-fullscreen-btn');

    this.engineRegistry = {
      cinematic: CinematicEngine,
      romantic_dream: RomanticDreamEngine,
      memory_lane: MemoryLaneEngine,
      secret_surprise: SecretSurpriseEngine,
      cosmic_universe: CosmicUniverseEngine
    };
  }

  init() {
    if (this.scenes.length === 0) return;

    this.bindEvents();
    this.renderHUD();
    this.activateScene(0, false);

    // Sync listener for Experience Studio iframe communication
    window.addEventListener('message', (e) => {
      if (!e.data) return;
      if (e.data.type === 'GO_TO_SCENE') {
        const target = parseInt(e.data.index, 10);
        if (!isNaN(target) && target >= 0 && target < this.scenes.length) {
          this.activateScene(target);
        }
      } else if (e.data.type === 'UPDATE_ANIMATION_CONFIG') {
        if (e.data.config) {
          this.animationController.updateConfig(e.data.config);
        }
      } else if (e.data.type === 'TEST_TRANSITION') {
        if (this.scenes.length > 1) {
          const nextIdx = (this.currentIndex + 1) % this.scenes.length;
          this.activateScene(nextIdx, true);
        }
      }
    });
  }

  bindEvents() {
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextScene());
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevScene());
    }
    if (this.audioToggle) {
      this.audioToggle.addEventListener('click', () => {
        if (window.CelebrationAudio) {
          const isUnmuted = window.CelebrationAudio.toggleMute();
          this.audioToggle.classList.toggle('audio-muted', !isUnmuted);
        }
      });
    }
    if (this.skipIntroBtn) {
      this.skipIntroBtn.addEventListener('click', () => {
        if (this.scenes.length > 1) {
          this.activateScene(1);
        }
      });
    }
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Keyboard navigation (Enter, Arrow keys, Space, PageDown)
    window.addEventListener('keydown', (e) => {
      // If user is actively typing in an input or textarea, don't trigger navigation
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const activeScene = this.scenes[this.currentIndex];
      const isMemoryLane = activeScene && activeScene.dataset.sceneType === 'memory_lane';

      if (e.key === 'Enter') {
        // If on Memory Lane, let MemoryLaneEngine cycle through memories first
        // If it's on the last memory or any other scene, advance to next scene
        if (isMemoryLane && this.activeEngine && this.activeEngine.slides) {
          if (this.activeEngine.currentIndex === this.activeEngine.slides.length - 1) {
            this.nextScene();
          } else {
            this.activeEngine.nextSlide();
          }
        } else {
          this.nextScene();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (!isMemoryLane) {
          this.nextScene();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (!isMemoryLane) {
          this.prevScene();
        }
      }
    });

    // Touch swipe handling
    let touchStartX = 0;
    this.viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.viewport.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        this.nextScene();
      } else if (touchEndX - touchStartX > 50) {
        this.prevScene();
      }
    }, { passive: true });
  }

  renderHUD() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    this.scenes.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `hud-dot ${i === this.currentIndex ? 'active' : ''}`;
      dot.setAttribute('title', `Scene ${i + 1}`);
      dot.addEventListener('click', () => this.activateScene(i));
      this.dotsContainer.appendChild(dot);
    });
  }

  activateScene(targetIndex, animate = true) {
    if (targetIndex < 0 || targetIndex >= this.scenes.length || this.isTransitioning) return;
    this.isTransitioning = true;

    const oldScene = this.scenes[this.currentIndex];
    const newScene = this.scenes[targetIndex];

    // Cleanup previous engine
    if (this.activeEngine) {
      try {
        this.activeEngine.destroy();
      } catch (err) {
        console.warn('Engine destroy error:', err);
      }
      this.activeEngine = null;
    }

    const onTransitionReady = () => {
      this.currentIndex = targetIndex;

      // Instantiate respective engine with animation config passed
      const sceneType = newScene.dataset.sceneType;
      const EngineClass = this.engineRegistry[sceneType];
      if (EngineClass) {
        this.activeEngine = new EngineClass(newScene, this.animationController.config);
        this.activeEngine.mount();
      }

      // Update HUD dots
      if (this.dotsContainer) {
        const dots = Array.from(this.dotsContainer.querySelectorAll('.hud-dot'));
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === targetIndex);
        });
      }

      // Notify parent window (for Experience Studio live sync)
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'SCENE_CHANGED', index: targetIndex }, '*');
      }

      setTimeout(() => {
        this.isTransitioning = false;
      }, 350);
    };

    if (animate && oldScene && oldScene !== newScene) {
      this.animationController.executeTransition(oldScene, newScene, onTransitionReady);
    } else {
      if (oldScene && oldScene !== newScene) {
        oldScene.classList.remove('scene-active');
      }
      newScene.classList.add('scene-active');
      onTransitionReady();
    }
  }

  nextScene() {
    if (this.currentIndex < this.scenes.length - 1) {
      this.activateScene(this.currentIndex + 1);
    }
  }

  prevScene() {
    if (this.currentIndex > 0) {
      this.activateScene(this.currentIndex - 1);
    }
  }

  replayClimax() {
    if (this.activeEngine && typeof this.activeEngine.triggerFinaleClimax === 'function') {
      this.activeEngine.triggerFinaleClimax();
    }
  }
}

// Auto-boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.querySelector('.celebration-viewport');
  if (viewport) {
    window.orchestrator = new SceneOrchestrator(viewport);
    window.orchestrator.init();
  }
});
