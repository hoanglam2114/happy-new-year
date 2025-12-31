// ==================== CONFIGURATION ====================
const CONFIG = {
  FADE_IN_DURATION: 0.2,
  DISPLAY_DURATION: 3,
  FADE_OUT_DURATION: 0.3,
  STAR_COUNT: 200,
  FIREWORK_INTERVAL: 800,
  FIREWORK_SOUND_PROBABILITY: 0.7,
  FIREWORK_SOUND_VOLUME: 0.3
};

CONFIG.TOTAL_DURATION = CONFIG.FADE_IN_DURATION + CONFIG.DISPLAY_DURATION + CONFIG.FADE_OUT_DURATION;

// ==================== AUDIO MANAGER ====================
class AudioManager {
  constructor() {
    this.bgMusic = document.getElementById("bg-music");
    this.buttonSound = document.getElementById("button-sound");
    this.fireworkSound = document.getElementById("firework-sound");
    this.isMusicPlaying = false;
    
    // Enable all sound effects by default
    this.soundEffectsEnabled = true;
    
    // Auto-start background music
    this.autoStartMusic();
  }

  autoStartMusic() {
    // Try to play music automatically when the page loads
    // Note: Some browsers block autoplay until user interaction
    const playPromise = this.bgMusic.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isMusicPlaying = true;
          // Update UI to show music is playing
          const musicToggle = document.getElementById("music-toggle");
          if (musicToggle) {
            musicToggle.classList.add("playing");
          }
        })
        .catch((error) => {
          console.log("Autoplay blocked by browser. Music will start after user interaction.");
          this.isMusicPlaying = false;
        });
    }
  }

  playButtonSound() {
    if (this.soundEffectsEnabled && this.buttonSound.src) {
      this.buttonSound.currentTime = 0;
      this.buttonSound.play().catch((e) => console.log("Button sound not loaded"));
    }
  }

  playFireworkSound() {
    if (this.soundEffectsEnabled && this.fireworkSound.src && Math.random() > CONFIG.FIREWORK_SOUND_PROBABILITY) {
      this.fireworkSound.currentTime = 0;
      this.fireworkSound.volume = CONFIG.FIREWORK_SOUND_VOLUME;
      this.fireworkSound.play().catch((e) => console.log("Firework sound not loaded"));
    }
  }

  toggleMusic() {
    if (this.isMusicPlaying) {
      this.bgMusic.pause();
      this.isMusicPlaying = false;
      return false;
    } else {
      this.bgMusic.play().catch((e) => {
        console.log("Background music not loaded or blocked by browser");
        alert("Vui lòng thêm file nhạc nền vào thẻ audio #bg-music");
      });
      this.isMusicPlaying = true;
      return true;
    }
  }
}

// ==================== PAGE MANAGER ====================
class PageManager {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.welcomePage = document.getElementById("welcome-page");
    this.fireworksPage = document.getElementById("fireworks-page");
    this.startButton = document.getElementById("start-button");
    this.musicToggle = document.getElementById("music-toggle");
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.startButton.addEventListener("click", () => this.transitionToFireworks());
    this.musicToggle.addEventListener("click", () => this.toggleMusic());
  }

  transitionToFireworks() {
    this.audioManager.playButtonSound();
    
    // Try to start music if it wasn't auto-started
    if (!this.audioManager.isMusicPlaying) {
      const isPlaying = this.audioManager.toggleMusic();
      if (isPlaying) {
        this.musicToggle.classList.add("playing");
      }
    }
    
    this.welcomePage.classList.add("hidden");
    setTimeout(() => {
      this.welcomePage.style.display = "none";
      this.fireworksPage.classList.add("visible");
      startFireworks();
    }, 500);
  }

  toggleMusic() {
    const isPlaying = this.audioManager.toggleMusic();
    if (isPlaying) {
      this.musicToggle.classList.add("playing");
    } else {
      this.musicToggle.classList.remove("playing");
    }
  }
}

// ==================== STARS GENERATOR ====================
class StarsGenerator {
  constructor(containerId, count) {
    this.container = document.getElementById(containerId);
    this.count = count;
  }

  generate() {
    for (let i = 0; i < this.count; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.animationDelay = Math.random() * 3 + "s";
      this.container.appendChild(star);
    }
  }
}

// ==================== SCRIPT ANIMATOR ====================
class ScriptAnimator {
  constructor(scriptData) {
    this.scriptText = document.getElementById("script-text");
    this.scripts = scriptData.script;
    this.currentIndex = 0;
  }

  start() {
    this.updateScript();
    setInterval(() => this.updateScript(), CONFIG.TOTAL_DURATION * 1000);
  }

  updateScript() {
    this.scriptText.style.animation = "none";
    this.scriptText.offsetHeight; // Trigger reflow
    this.scriptText.textContent = this.scripts[this.currentIndex];
    this.scriptText.style.animation = `fadeInOut ${CONFIG.TOTAL_DURATION}s`;
    
    this.currentIndex = (this.currentIndex + 1) % this.scripts.length;
  }
}

// ==================== PARTICLE CLASS ====================
class Particle {
  constructor(x, y, color, velocity, shape) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.015;
    this.shape = shape;
  }

  update() {
    this.velocity.x *= 0.98;
    this.velocity.y *= 0.98;
    this.velocity.y += 0.15;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;

    if (this.shape === "circle") {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === "star") {
      this.drawStar(ctx, this.x, this.y, 5, 4, 2);
    }

    ctx.restore();
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}

// ==================== FIREWORK CLASS ====================
class Firework {
  constructor(x, y, color, type, audioManager) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.type = type;
    this.particles = [];
    this.audioManager = audioManager;
    this.explode();
  }

  explode() {
    this.audioManager.playFireworkSound();

    const particleCount = Math.random() * 50 + 100;
    const shape = Math.random() > 0.7 ? "star" : "circle";

    if (this.type === "2026") {
      this.create2026();
    } else if (this.type === "horse") {
      this.createHorse();
    } else {
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = {
          x: Math.cos(angle) * (Math.random() * 6 + 2),
          y: Math.sin(angle) * (Math.random() * 6 + 2),
        };
        this.particles.push(
          new Particle(this.x, this.y, this.color, velocity, shape)
        );
      }
    }
  }

  create2026() {
    const text = "2026";
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const fontSize = 60;
    
    ctx.font = `bold ${fontSize}px Arial`;
    const metrics = ctx.measureText(text);
    const width = metrics.width;
    const height = fontSize;

    canvas.width = width;
    canvas.height = height;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y += 3) {
      for (let x = 0; x < width; x += 3) {
        const index = (y * width + x) * 4;
        if (data[index + 3] > 128) {
          const velocity = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
          };
          this.particles.push(
            new Particle(
              this.x - width / 2 + x,
              this.y - height / 2 + y,
              this.color,
              velocity,
              "circle"
            )
          );
        }
      }
    }
  }

  createHorse() {
    const horsePoints = [
      [0, -20], [5, -25], [10, -20], [15, -15], [15, -10],
      [20, -5], [20, 0], [18, 5], [15, 8], [12, 10],
      [10, 15], [8, 20], [5, 20], [3, 15], [0, 10],
      [-3, 15], [-5, 20], [-8, 20], [-10, 15], [-12, 10],
      [-15, 8], [-18, 5], [-20, 0], [-20, -5], [-15, -10],
      [-15, -15], [-10, -20], [-5, -25],
    ];

    horsePoints.forEach((point) => {
      const velocity = {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
      };
      this.particles.push(
        new Particle(
          this.x + point[0] * 2,
          this.y + point[1] * 2,
          this.color,
          velocity,
          "circle"
        )
      );
    });
  }

  update() {
    this.particles = this.particles.filter((p) => p.alpha > 0);
    this.particles.forEach((p) => p.update());
  }

  draw(ctx) {
    this.particles.forEach((p) => p.draw(ctx));
  }

  isDead() {
    return this.particles.length === 0;
  }
}

// ==================== FIREWORKS MANAGER ====================
class FireworksManager {
  constructor(canvasId, audioManager) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.audioManager = audioManager;
    this.fireworks = [];
    this.colors = [
      "#ff0000", "#00ff00", "#0000ff", "#ffff00",
      "#ff00ff", "#00ffff", "#ffa500", "#ff69b4",
    ];
    this.types = ["regular", "regular", "regular", "2026", "horse"];
    
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  launchFirework() {
    const x = Math.random() * this.canvas.width;
    const y = Math.random() * (this.canvas.height * 0.4) + this.canvas.height * 0.1;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const type = this.types[Math.floor(Math.random() * this.types.length)];
    this.fireworks.push(new Firework(x, y, color, type, this.audioManager));
  }

  animate() {
    this.ctx.fillStyle = "rgba(9, 10, 15, 0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.fireworks.forEach((fw, index) => {
      fw.update();
      fw.draw(this.ctx);
      if (fw.isDead()) {
        this.fireworks.splice(index, 1);
      }
    });

    requestAnimationFrame(() => this.animate());
  }

  start() {
    this.animate();
    setInterval(() => this.launchFirework(), CONFIG.FIREWORK_INTERVAL);
  }
}

// ==================== MAIN INITIALIZATION ====================
let audioManager;
let pageManager;

// Load sentences from JSON file
async function loadSentences() {
  try {
    const response = await fetch('sentences.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading sentences:', error);
    // Fallback sentences if JSON file is not available
    return {
      script: [
        "Chúc mừng năm mới 2026",
        "Một năm khép lại, một hành trình mới bắt đầu",
        "Happy New Year 2026"
      ]
    };
  }
}

async function startFireworks() {
  // Generate stars
  const starsGenerator = new StarsGenerator("stars", CONFIG.STAR_COUNT);
  starsGenerator.generate();

  // Load and start script animation
  const scriptData = await loadSentences();
  const scriptAnimator = new ScriptAnimator(scriptData);
  scriptAnimator.start();

  // Start fireworks
  const fireworksManager = new FireworksManager("fireworks-canvas", audioManager);
  fireworksManager.start();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  audioManager = new AudioManager();
  pageManager = new PageManager(audioManager);
});