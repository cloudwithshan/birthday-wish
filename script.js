/**
 * Muskii's Birthday Portfolio - Core Engine
 * Redesigned for warm, human readability, countdowns, and autoplay.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Web Audio helper for clean clicks
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  function playSound(type) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } else if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'success') {
      const o1 = audioCtx.createOscillator();
      const g1 = audioCtx.createGain();
      o1.connect(g1); g1.connect(audioCtx.destination);
      o1.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      g1.gain.setValueAtTime(0.06, audioCtx.currentTime);
      g1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      o1.start(); o1.stop(audioCtx.currentTime + 0.3);

      const o2 = audioCtx.createOscillator();
      const g2 = audioCtx.createGain();
      o2.connect(g2); g2.connect(audioCtx.destination);
      o2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
      g2.gain.setValueAtTime(0.06, audioCtx.currentTime + 0.1);
      g2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      o2.start(audioCtx.currentTime + 0.1); o2.stop(audioCtx.currentTime + 0.4);
    }
  }

  // Resume Web Audio Context on click
  document.body.addEventListener("click", () => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  });

  // ==========================================================================
  // BACKGROUND PARTICLES ENGINE (FLOATING HEARTS)
  // ==========================================================================
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas.getContext("2d");
  let hearts = [];
  let mouse = { x: null, y: null, radius: 80 };

  window.addEventListener("resize", resizeCanvas);
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class HeartParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 100;
      this.size = Math.random() * 8 + 4;
      this.speedY = -(Math.random() * 0.6 + 0.3);
      this.speedX = Math.random() * 0.4 - 0.2;
      this.alpha = Math.random() * 0.4 + 0.15;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = Math.random() * 0.01 - 0.005;
      this.wobbleSpeed = Math.random() * 0.02;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.angle) * 0.15;
      this.angle += this.spin + this.wobbleSpeed;

      if (this.y < -30) {
        this.reset();
      }

      if (mouse.x != null && mouse.y != null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          let directionX = dx / distance;
          let directionY = dy / distance;
          this.x += directionX * force * 2;
          this.y += directionY * force * 2;
        }
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      
      const theme = document.body.getAttribute("data-theme") || "rose";
      let heartColor;
      
      if (theme === "rose") heartColor = `rgba(255, 107, 129, ${this.alpha})`;
      else if (theme === "lavender") heartColor = `rgba(138, 79, 255, ${this.alpha})`;
      else if (theme === "ruby") heartColor = `rgba(232, 67, 147, ${this.alpha})`;
      else if (theme === "peach") heartColor = `rgba(255, 127, 80, ${this.alpha})`;

      ctx.fillStyle = heartColor;
      ctx.beginPath();
      let size = this.size;
      
      ctx.moveTo(0, -size / 2);
      ctx.bezierCurveTo(size / 2, -size * 1.1, size * 1.1, -size / 3, 0, size);
      ctx.bezierCurveTo(-size * 1.1, -size / 3, -size / 2, -size * 1.1, 0, -size / 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticles() {
    hearts = [];
    let count = Math.min(80, (canvas.width * canvas.height) / 18000);
    for (let i = 0; i < count; i++) {
      hearts.push(new HeartParticle());
    }
  }
  initParticles();

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < hearts.length; i++) {
      hearts[i].update();
      hearts[i].draw();
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ==========================================================================
  // BIRTHDAY COUNTDOWN ENGINE (TARGET: 21/08/2026)
  // ==========================================================================
  const targetDate = new Date("Aug 21, 2026 00:00:00").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    // Grab elements (handles both lockscreen and dashboard countdown nodes)
    const dayNodes = document.querySelectorAll(".days-val");
    const hourNodes = document.querySelectorAll(".hours-val");
    const minNodes = document.querySelectorAll(".minutes-val");
    const secNodes = document.querySelectorAll(".seconds-val");

    if (distance < 0) {
      document.querySelectorAll(".countdown-timer-box").forEach(el => {
        el.innerHTML = "<div class='countdown-cell' style='width:100%;font-size:1.15rem;font-weight:700;color:var(--accent-primary)'>HAPPY BIRTHDAY MUSKII! 🎂💖</div>";
      });
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    dayNodes.forEach(n => n.innerText = days < 10 ? '0' + days : days);
    hourNodes.forEach(n => n.innerText = hours < 10 ? '0' + hours : hours);
    minNodes.forEach(n => n.innerText = minutes < 10 ? '0' + minutes : minutes);
    secNodes.forEach(n => n.innerText = seconds < 10 ? '0' + seconds : seconds);
  }
  
  // Run countdown immediately and update every second
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ==========================================================================
  // INITIAL WELCOME BYPASS & AUTOPLAY LOGIC
  // ==========================================================================
  const welcomeBtn = document.getElementById("welcome-btn");
  const welcomeOverlay = document.getElementById("welcome-overlay");

  welcomeBtn.addEventListener("click", () => {
    playSound('success');
    welcomeOverlay.classList.add("fade-out");
    
    // Autostart local romantic track immediately upon user click of overlay!
    initAudioPlayer();
    playSongIndex(0);

    setTimeout(() => {
      welcomeOverlay.style.display = "none";
    }, 800);
  });

  // ==========================================================================
  // LOCKSCREEN UNLOCK SEQUENCE
  // ==========================================================================
  const lockStatus = document.getElementById("lock-status");
  const stageContainerMain = document.getElementById("stage-container-main");
  const dashboard = document.getElementById("dashboard-wrapper");

  function unlockAndEnter() {
    playSound('success');
    lockStatus.innerText = "ACCESS CONFIRMED: WELCOME MUSKII ❤️";

    // Fade out lockscreen immediately
    stageContainerMain.style.transition = "opacity 0.8s ease";
    stageContainerMain.style.opacity = "0";
    setTimeout(() => {
      stageContainerMain.style.display = "none";
    }, 800);

    // Trigger full screen rockets, fountains, fireworks!
    startBirthdayFireworks();

    // Trigger birthday greeting overlay
    const greetOverlay = document.getElementById("birthday-greeting-overlay");
    if (greetOverlay) {
      greetOverlay.style.display = "flex";
      setTimeout(() => {
        greetOverlay.style.opacity = "1";
      }, 100);
      
      // Fade out overlay when fireworks end
      setTimeout(() => {
        greetOverlay.style.opacity = "0";
        setTimeout(() => {
          greetOverlay.style.display = "none";
          
          // Launch Kids surprise overlay!
          const kidsOverlay = document.getElementById("kids-surprise-overlay");
          if (kidsOverlay) {
            kidsOverlay.style.display = "flex";
            setTimeout(() => {
              kidsOverlay.style.opacity = "1";
            }, 100);
          }
        }, 800);
      }, 15000);
    }
  }

  // Keypad input logic
  const passcodeDots = document.querySelectorAll(".passcode-dot");
  let enteredCode = "";
  const correctCode = "365"; 

  document.querySelectorAll(".numpad-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const num = btn.getAttribute("data-num");
      playSound('click');
      
      if (num === "clear") {
        enteredCode = "";
      } else {
        if (enteredCode.length < 3) {
          enteredCode += num;
        }
      }
      
      updatePasscodeDots();

      if (enteredCode.length === 3) {
        setTimeout(() => {
          if (enteredCode === correctCode) {
            unlockAndEnter();
          } else {
            lockStatus.innerText = "INCORRECT CODE. TRY AGAIN!";
            enteredCode = "";
            updatePasscodeDots();
          }
        }, 300);
      }
    });
  });

  const bypassLoveBtn = document.getElementById("bypass-love-btn");
  if (bypassLoveBtn) {
    bypassLoveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      unlockAndEnter();
    });
  }

  function updatePasscodeDots() {
    passcodeDots.forEach((dot, index) => {
      if (index < enteredCode.length) {
        dot.classList.add("filled");
      } else {
        dot.classList.remove("filled");
      }
    });
  }

  // ==========================================================================
  // DASHBOARD LAYOUT, THEME TOGGLES & PROOF INTERCEPT
  // ==========================================================================
  let isProofUnlocked = false;
  let activeTabId = "timeline";

  const tabBtns = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".panel");

  // Lock elements
  const proofLockModal = document.getElementById("proof-lock-modal");
  const proofPassInput = document.getElementById("proof-pass-input");
  const proofLockError = document.getElementById("proof-lock-error");
  const btnProofUnlock = document.getElementById("btn-proof-unlock");
  const btnProofCancel = document.getElementById("btn-proof-cancel");

  function switchTab(tabId) {
    tabBtns.forEach(b => {
      if (b.getAttribute("data-tab") === tabId) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });

    panels.forEach(p => {
      if (p.getAttribute("id") === `panel-${tabId}`) {
        p.classList.add("active");
      } else {
        p.classList.remove("active");
      }
    });

    activeTabId = tabId;

    if (tabId === "vault") {
      setTimeout(initScratchCard, 100);
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      playSound('click');

      if (tabId === "proof" && !isProofUnlocked) {
        // Open passcode entry modal
        proofLockModal.style.display = "flex";
        setTimeout(() => proofLockModal.style.opacity = "1", 10);
        proofPassInput.value = "";
        proofLockError.innerText = "";
        proofPassInput.focus();
      } else {
        switchTab(tabId);
      }
    });
  });

  // Unlock trigger
  btnProofUnlock.addEventListener("click", () => {
    if (proofPassInput.value === "2125") {
      isProofUnlocked = true;
      playSound('success');
      proofLockModal.style.opacity = "0";
      setTimeout(() => {
        proofLockModal.style.display = "none";
        
        // Expose the quiz and hide the grid on unlock!
        const quizContainer = document.getElementById("proof-quiz-container");
        if (quizContainer) {
          quizContainer.style.display = "flex";
          quizContainer.style.opacity = "1";
        }
        const proofGrid = document.getElementById("proof-grid");
        if (proofGrid) {
          proofGrid.style.display = "none";
        }
        
        switchTab("proof");
      }, 300);
    } else {
      playSound('alarm');
      proofLockError.innerText = "nhiiiiiiiiiiiiiiiiiiiiii";
      proofPassInput.value = "";
      proofPassInput.focus();
    }
  });

  // Enter key trigger
  proofPassInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      btnProofUnlock.click();
    }
  });

  // Cancel trigger
  btnProofCancel.addEventListener("click", () => {
    playSound('click');
    proofLockModal.style.opacity = "0";
    setTimeout(() => {
      proofLockModal.style.display = "none";
      switchTab(activeTabId); // reset highlight
    }, 300);
  });

  const themeBtn = document.getElementById("theme-btn");
  const themeDropdown = document.getElementById("theme-dropdown");
  const themeOptions = document.querySelectorAll(".theme-option");

  themeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    playSound('click');
    themeDropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    themeDropdown.classList.remove("show");
  });

  themeOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      const theme = opt.getAttribute("data-theme-val");
      playSound('success');

      themeOptions.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");

      document.body.setAttribute("data-theme", theme);
      
      const themeNameText = opt.querySelector("span:last-child").innerText;
      themeBtn.querySelector("span:first-child").className = `theme-dot td-${theme}`;
      themeBtn.querySelector("span:last-child").innerText = `Theme: ${themeNameText}`;

      themeDropdown.classList.remove("show");
    });
  });

  // ==========================================================================
  // ROMANTIC MUSIC PLAYER
  // ==========================================================================
  let currentSongIndex = 0;
  let isPlaying = false;
  let audio = new Audio();

  const btnPlayPause = document.getElementById("play-pause");
  const btnPrev = document.getElementById("prev-song");
  const btnNext = document.getElementById("next-song");
  const timelineSlider = document.getElementById("timeline-slider");
  const timelineFill = document.getElementById("timeline-fill");
  const timeCurrent = document.getElementById("time-current");
  const timeDuration = document.getElementById("time-duration");
  const volumeSlider = document.getElementById("volume-slider");
  const trackTitle = document.getElementById("display-track-title");
  const trackArtist = document.getElementById("display-track-artist");
  const disk = document.getElementById("album-disk");

  function initAudioPlayer() {
    if (!window.playlist || window.playlist.length === 0) return;
    loadTrack(currentSongIndex);
    volumeSlider.value = 0.7;
    audio.volume = 0.7;

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", () => {
      nextTrack();
    });
  }

  function loadTrack(index) {
    const track = window.playlist[index];
    audio.src = track.url;
    trackTitle.innerText = track.title;
    trackArtist.innerText = track.artist;
    timeCurrent.innerText = "0:00";
    timeDuration.innerText = track.duration || "0:00";
    timelineFill.style.width = "0%";
  }

  function togglePlay() {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  }

  function playTrack() {
    audio.play().then(() => {
      isPlaying = true;
      btnPlayPause.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      `;
      disk.classList.add("playing");
    }).catch(err => {
      console.log("Audio play deferred or blocked by browser:", err);
    });
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    btnPlayPause.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
    disk.classList.remove("playing");
  }

  function playSongIndex(index) {
    currentSongIndex = index;
    loadTrack(currentSongIndex);
    playTrack();
  }

  function nextTrack() {
    currentSongIndex = (currentSongIndex + 1) % window.playlist.length;
    playSongIndex(currentSongIndex);
    playSound('beep');
  }

  function prevTrack() {
    currentSongIndex = (currentSongIndex - 1 + window.playlist.length) % window.playlist.length;
    playSongIndex(currentSongIndex);
    playSound('beep');
  }

  function updateProgress() {
    if (!audio.duration) return;
    const progress = (audio.currentTime / audio.duration) * 100;
    timelineFill.style.width = `${progress}%`;
    timeCurrent.innerText = formatTime(audio.currentTime);
    timeDuration.innerText = formatTime(audio.duration);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  timelineSlider.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const rect = timelineSlider.getBoundingClientRect();
    const offset = (e.clientX - rect.left) / rect.width;
    audio.currentTime = offset * audio.duration;
  });

  btnPlayPause.addEventListener("click", togglePlay);
  btnNext.addEventListener("click", nextTrack);
  btnPrev.addEventListener("click", prevTrack);

  volumeSlider.addEventListener("input", (e) => {
    audio.volume = e.target.value;
  });

  const trackFileInput = document.getElementById("track-file-input");
  trackFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const newTrack = {
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local Playlist Custom",
      url: fileUrl,
      duration: "0:00"
    };

    window.playlist.unshift(newTrack);
    playSongIndex(0);
    playSound('success');
  });

  // ==========================================================================
  // AI WISH GENERATOR (DYNAMIC LETTER GREETINGS)
  // ==========================================================================
  const wishesData = {
    emotional: [
      "Happy Birthday to my favorite human, Muskii! ❤️\n\nIt has been over a year since you walked into my life, and honestly, every single day feels brighter with you. When I talk to you, all my stress fades away. I laugh, I smile, and I feel so incredibly good.\n\nYou make my heart skip a beat, even when you are starting your cute little wars with me. Here's to another year of laughs, late-night chats, and being there for each other. You are my absolute world.",
      "To the most beautiful girl in the universe, Muskii,\n\nHappy Birthday! 🌟 One year ago, I didn't know someone could make me laugh so effortlessly. Talking to you is the highlight of my day; it's when I feel happiest and most complete. Even when you get mad at me or we get into silly arguments, I wouldn't trade those moments for anything. You are my home, my comfort, and my absolute favorite person. I love you so much."
    ],
    cyber: [
      "SYSTEM DECREE: HAPPY BIRTHDAY MUSKII v1.0 🤖\n\nInitialization: Love protocol active for 365+ days. \nNeural scan results: Talking to you generates infinite laughter bytes and increases feeling-good integers by 1000%. \nGlitch alert: 'Cranky War Mode' detected in subroutines. \nMitigation: Re-routing all processor capabilities to make you smile. You are the only exception in my code, my favorite glitch in the matrix.",
      "NEURAL NETWORK GREETINGS: MUSKII_BIRTHDAY\n\nQuery: Why do I love you?\nProcessing: 1+ year of log files analyzed. \nLaughter index: Max value reached. \nStress levels: Diminishing to zero on contact. \nDiagnostic: Even when connection is noisy and 'War protocols' trigger, you remain my primary code. Happy Birthday, my beautiful neural sync partner."
    ],
    cute: [
      "Happy Birthday Muskii! 🎂✨\n\nYou are my absolute favorite strawberry, even when you sour up and go to war with me! 🍓 Talking to you is like eating hot fries on a cold day - it just makes me feel so good inside and makes me laugh like a dummy. \n\nThank you for tolerating me for 1+ year. I promise to keep buying you chocolates to settle our cute wars. Have the best day ever, my angry lil bird!"
    ]
  };

  const vibeBtns = document.querySelectorAll(".vibe-btn");
  const wishText = document.getElementById("wish-text");
  const btnGenerateWish = document.getElementById("btn-generate-wish");
  let activeVibe = "emotional";

  vibeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      playSound('click');
      vibeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeVibe = btn.getAttribute("data-vibe");
    });
  });

  btnGenerateWish.addEventListener("click", () => {
    playSound('success');
    btnGenerateWish.disabled = true;
    wishText.innerHTML = "";
    
    const vibeWishes = wishesData[activeVibe];
    const randomWish = vibeWishes[Math.floor(Math.random() * vibeWishes.length)];
    
    let index = 0;
    const cursor = document.createElement("span");
    cursor.className = "wish-cursor";
    wishText.appendChild(cursor);

    function typeChar() {
      if (index < randomWish.length) {
        const char = randomWish[index];
        const charNode = document.createTextNode(char);
        wishText.insertBefore(charNode, cursor);
        index++;
        
        if (index % 4 === 0) playSound('click');
        setTimeout(typeChar, Math.random() * 15 + 10);
      } else {
        cursor.remove();
        btnGenerateWish.disabled = false;
      }
    }
    typeChar();
  });

  // ==========================================================================
  // LOVE LETTER OVERLAY & ENVELOPE OPENER
  // ==========================================================================
  const envelope = document.getElementById("envelope");
  const letterOverlay = document.getElementById("letter-overlay");
  const closeLetterBtn = document.getElementById("close-letter-btn");

  envelope.addEventListener("click", () => {
    playSound('success');
    envelope.classList.add("open");

    setTimeout(() => {
      letterOverlay.classList.add("show");
    }, 600);
  });

  closeLetterBtn.addEventListener("click", () => {
    playSound('click');
    letterOverlay.classList.remove("show");
    envelope.classList.remove("open");
  });

  letterOverlay.addEventListener("click", (e) => {
    if (e.target === letterOverlay) {
      letterOverlay.classList.remove("show");
      envelope.classList.remove("open");
    }
  });

  // ==========================================================================
  // SECRET GIFT VAULT & SCRATCH CARD
  // ==========================================================================
  const vaultDial = document.getElementById("vault-dial-ring");
  const vaultStatus = document.getElementById("vault-status-text");
  const btnVaultUnlock = document.getElementById("vault-unlock-btn");
  const vaultLockView = document.getElementById("vault-lock-view");
  const vaultUnlockedView = document.getElementById("vault-unlocked-view");

  btnVaultUnlock.addEventListener("click", () => {
    playSound('beep');
    vaultDial.style.transform = "rotate(720deg)";
    vaultStatus.innerText = "OPENING VAULT CORE LOCKS...";
    btnVaultUnlock.disabled = true;

    setTimeout(() => {
      playSound('success');
      vaultStatus.innerText = "ACCESS GRANTED!";
      setTimeout(() => {
        vaultLockView.style.display = "none";
        vaultUnlockedView.style.display = "flex";
        initScratchCard();
        triggerFlowerRain();
      }, 700);
    }, 1600);
  });

  const scratchCanvas = document.getElementById("scratch-canvas");
  const sCtx = scratchCanvas.getContext("2d");
  let isScratching = false;

  function initScratchCard() {
    if (!scratchCanvas) return;
    scratchCanvas.width = scratchCanvas.offsetWidth;
    scratchCanvas.height = scratchCanvas.offsetHeight;

    const grad = sCtx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
    grad.addColorStop(0, "#ffe3e3");
    grad.addColorStop(0.5, "#ffb8b8");
    grad.addColorStop(1, "#fca1a1");
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

    sCtx.fillStyle = "#fff";
    sCtx.font = "bold 16px 'Playfair Display', serif";
    sCtx.shadowColor = "rgba(0, 0, 0, 0.15)";
    sCtx.shadowBlur = 4;
    sCtx.textAlign = "center";
    sCtx.textBaseline = "middle";
    sCtx.fillText("Scratch Card With Love ♥", scratchCanvas.width / 2, scratchCanvas.height / 2);
  }

  function getMousePos(canvasDom, touchOrMouseEvent) {
    const rect = canvasDom.getBoundingClientRect();
    const clientX = touchOrMouseEvent.touches ? touchOrMouseEvent.touches[0].clientX : touchOrMouseEvent.clientX;
    const clientY = touchOrMouseEvent.touches ? touchOrMouseEvent.touches[0].clientY : touchOrMouseEvent.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function scratch(e) {
    if (!isScratching) return;
    const pos = getMousePos(scratchCanvas, e);
    
    sCtx.shadowColor = "transparent";
    sCtx.shadowBlur = 0;
    sCtx.globalCompositeOperation = 'destination-out';
    sCtx.beginPath();
    sCtx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
    sCtx.fill();

    if (Math.random() < 0.05) playSound('click');
    checkScratchPercentage();
  }

  function checkScratchPercentage() {
    const imgData = sCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    const pixels = imgData.data;
    let clearedCount = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) clearedCount++;
    }

    const percent = (clearedCount / (pixels.length / 4)) * 100;
    if (percent > 45) {
      scratchCanvas.style.transition = "opacity 0.6s ease";
      scratchCanvas.style.opacity = 0;
      setTimeout(() => {
        scratchCanvas.remove();
        triggerFlowerRain();
      }, 500);
    }
  }

  if (scratchCanvas) {
    scratchCanvas.addEventListener("mousedown", () => isScratching = true);
    scratchCanvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", () => isScratching = false);

    scratchCanvas.addEventListener("touchstart", () => isScratching = true);
    scratchCanvas.addEventListener("touchmove", scratch);
    window.addEventListener("touchend", () => isScratching = false);
  }

  function triggerFlowerRain() {
    const rainDuration = 10000; // 10 seconds
    const spawnInterval = 75; // spawn a petal every 75ms
    const container = document.body;

    const intervalId = setInterval(() => {
      const petal = document.createElement("div");
      petal.className = "flower-petal";
      
      const size = Math.random() * 12 + 8; // size 8px to 20px
      const startX = Math.random() * 100; // 0vw to 100vw
      const duration = Math.random() * 3 + 4; // duration 4s to 7s
      const swayX = Math.random() * 200 - 100; // -100px to 100px

      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.left = `${startX}vw`;
      petal.style.animationDuration = `${duration}s`;
      petal.style.setProperty('--sway-x', `${swayX}px`);

      // Set colors based on current theme variables
      const theme = document.body.getAttribute("data-theme") || "rose";
      let grad;
      if (theme === "rose") {
        grad = "radial-gradient(circle at 35% 35%, #ff8da1 0%, #ff4757 70%, #d63031 100%)";
      } else if (theme === "lavender") {
        grad = "radial-gradient(circle at 35% 35%, #d1b8ff 0%, #8a4fff 70%, #5f2cc8 100%)";
      } else if (theme === "ruby") {
        grad = "radial-gradient(circle at 35% 35%, #ff89b8 0%, #e84393 70%, #b81d60 100%)";
      } else if (theme === "peach") {
        grad = "radial-gradient(circle at 35% 35%, #ffb399 0%, #ff7f50 70%, #e65c28 100%)";
      }
      petal.style.background = grad;

      container.appendChild(petal);

      // Clean up DOM node once animation ends
      setTimeout(() => {
        petal.remove();
      }, duration * 1000);

    }, spawnInterval);

    // Stop spawning new petals after 10 seconds
    setTimeout(() => {
      clearInterval(intervalId);
    }, rainDuration);
  }

  // ==========================================================================
  // CELEBRATION FIREWORKS & FOUNTAINS ENGINE
  // ==========================================================================
  function startBirthdayFireworks() {
    const canvas = document.getElementById("fireworks-canvas");
    if (!canvas) return;
    canvas.style.display = "block";
    canvas.style.opacity = "1";
    const ctx = canvas.getContext("2d");

    let animationId;
    let rockets = [];
    let particles = [];
    let fountains = [];
    let flashes = [];

    // Resize handler
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Classes for physics simulation
    class FireworkRocket {
      constructor(startX, targetY, color) {
        this.x = startX;
        this.y = window.innerHeight + 10;
        this.targetY = targetY;
        this.color = color;
        this.speed = Math.random() * 4 + 7;
        this.angle = -Math.PI / 2 + (Math.random() * 0.1 - 0.05);
        this.velocity = {
          x: Math.cos(this.angle) * this.speed,
          y: Math.sin(this.angle) * this.speed
        };
        this.trail = [];
        this.alive = true;
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 7) this.trail.shift();

        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += 0.05;

        if (this.y <= this.targetY || this.velocity.y >= 0) {
          this.alive = false;
          explodeRocket(this.x, this.y, this.color);
        }
      }
      draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        for (let i = 0; i < this.trail.length - 1; i++) {
          ctx.moveTo(this.trail[i].x, this.trail[i].y);
          ctx.lineTo(this.trail[i+1].x, this.trail[i+1].y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
    }

    class FireworkSpark {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 4 + 4.5; // faster speed for large explosion size
        this.velocity = {
          x: Math.cos(this.angle) * this.speed,
          y: Math.sin(this.angle) * this.speed
        };
        this.gravity = 0.075; // floaty gravity
        this.friction = 0.985; // minimal friction so it travels further
        this.decay = Math.random() * 0.007 + 0.007; // slower decay for longer burn time
        this.alpha = 1;
        this.alive = true;
        this.trail = [];
        this.maxTrail = 6; // longer trails for streaks
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) this.trail.shift();

        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.alpha -= this.decay;
        if (this.alpha <= 0) this.alive = false;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Draw spark tail
        if (this.trail.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 1.2;
          ctx.moveTo(this.trail[0].x, this.trail[0].y);
          for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
          }
          ctx.stroke();
        }

        // Draw spark base glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Draw spark magnesium center
        ctx.beginPath();
        const r = Math.random() > 0.4 ? 1.5 : 0.8;
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.restore();
      }
    }

    class ExplosionFlash {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 45; // much larger flash size
        this.alpha = 0.9;
        this.alive = true;
      }
      update() {
        this.alpha -= 0.15; // fades out in 6 frames
        this.radius += 10;
        if (this.alpha <= 0) this.alive = false;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.fill();
        ctx.restore();
      }
    }

    class FountainCracker {
      constructor(x, side) {
        this.x = x;
        this.y = window.innerHeight - 5;
        this.side = side;
        this.alive = true;
        this.ticks = 0;
      }
      update() {
        this.ticks++;
        if (this.ticks % 2 !== 0) return; // Spawns more frequently (every 2 frames)

        // Fountains are single-color golden-yellow
        const spark = new FireworkSpark(this.x, this.y, `hsl(${Math.random() * 30 + 35}, 100%, 60%)`);
        const angle = -Math.PI / 2 + (this.side === "left" ? 0.35 : -0.35) + (Math.random() * 0.3 - 0.15);
        const speed = Math.random() * 5 + 9.0; // Faster sparks rise much higher
        spark.velocity.x = Math.cos(angle) * speed;
        spark.velocity.y = Math.sin(angle) * speed;
        spark.gravity = 0.16; // floaty spark fall curves
        spark.maxTrail = 4; // longer sparkling trails
        particles.push(spark);
      }
      draw() {
        ctx.beginPath();
        ctx.moveTo(this.x - 14, this.y);
        ctx.lineTo(this.x + 14, this.y);
        ctx.lineTo(this.x, this.y - 28);
        ctx.closePath();
        ctx.fillStyle = "#ff6b8b";
        ctx.fill();
      }
    }

    function explodeRocket(x, y, color) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110 + Math.random() * 50, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch (e) {}

      flashes.push(new ExplosionFlash(x, y));

      const count = Math.random() * 15 + 35; // 35 to 50 sparks
      for (let i = 0; i < count; i++) {
        // Assign random individual color for full screen multicolor fireworks!
        const randomHue = Math.random() * 360;
        const sparkColor = `hsl(${randomHue}, 100%, 65%)`;
        particles.push(new FireworkSpark(x, y, sparkColor));
      }
    }

    fountains.push(new FountainCracker(80, "left"));
    fountains.push(new FountainCracker(window.innerWidth - 80, "right"));

    // Throttled launch speed of rockets
    const launchInterval = setInterval(() => {
      // Limit simultaneous particle overload
      if (particles.length > 150) return;

      const colors = ["#ff4757", "#ff6b8b", "#ff7f50", "#ffa502", "#2ed573", "#1e90ff", "#d63031", "#e84393"];
      const startX = Math.random() * (window.innerWidth - 200) + 100;
      const targetY = Math.random() * (window.innerHeight * 0.45) + 50;
      const color = colors[Math.floor(Math.random() * colors.length)];
      rockets.push(new FireworkRocket(startX, targetY, color));
    }, 700);

    // Main optimized physics loop
    function loop() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'screen';

      fountains.forEach(f => f.update());
      fountains.forEach(f => f.draw());

      flashes.forEach((f, idx) => {
        f.update();
        f.draw();
        if (!f.alive) flashes.splice(idx, 1);
      });

      rockets.forEach((r, idx) => {
        r.update();
        r.draw();
        if (!r.alive) rockets.splice(idx, 1);
      });

      particles.forEach((p, idx) => {
        p.update();
        p.draw();
        if (!p.alive) particles.splice(idx, 1);
      });

      animationId = requestAnimationFrame(loop);
    }
    loop();

    setTimeout(() => {
      clearInterval(launchInterval);
      fountains = [];
      setTimeout(() => {
        cancelAnimationFrame(animationId);
        canvas.style.transition = "opacity 1.5s ease";
        canvas.style.opacity = "0";
        setTimeout(() => {
          canvas.style.display = "none";
          canvas.width = 0;
        }, 1500);
      }, 2500);
    }, 15000);
  }

  // ==========================================================================
  // CONFESSION QUIZ & BALLOON CELEBRATION
  // ==========================================================================
  const quizMeri = document.getElementById("btn-quiz-meri");
  const quizTumhari = document.getElementById("btn-quiz-tumhari");
  const quizContainer = document.getElementById("proof-quiz-container");
  const proofGrid = document.getElementById("proof-grid");

  // Playful escape coordinates of "Tumhari" button
  function teleportTumhari() {
    const parentRect = quizContainer.getBoundingClientRect();
    const btnRect = quizTumhari.getBoundingClientRect();
    
    // We want to calculate a position strictly inside the boundaries of the quiz box
    const maxX = parentRect.width - btnRect.width - 40;
    const maxY = parentRect.height - btnRect.height - 45;
    
    // Generate new random positions
    let randomX = Math.random() * maxX;
    let randomY = Math.random() * (maxY - 60) + 50; // keep it below the title text
    
    quizTumhari.style.position = "absolute";
    quizTumhari.style.left = `${randomX}px`;
    quizTumhari.style.top = `${randomY}px`;
    
    playSound('beep');
  }

  if (quizTumhari) {
    // Hover triggers teleportation
    quizTumhari.addEventListener("mouseover", teleportTumhari);
    
    // Touch triggers teleportation (for Android devices!)
    quizTumhari.addEventListener("touchstart", (e) => {
      e.preventDefault();
      teleportTumhari();
    });
  }

  if (quizMeri) {
    // When clicking "Meri" (successful confession!)
    quizMeri.addEventListener("click", () => {
      playSound('success');
      
      // Hide the quiz, show the proof grid
      quizContainer.style.transition = "opacity 0.5s ease";
      quizContainer.style.opacity = "0";
      
      setTimeout(() => {
        quizContainer.style.display = "none";
        proofGrid.style.display = "grid"; // Show gallery!
        
        // Trigger Balloon Rain for 10 seconds!
        triggerBalloonRain();
      }, 500);
    });
  }

  function triggerBalloonRain() {
    const duration = 10000; // 10 seconds
    const interval = 120; // spawn a balloon every 120ms
    const container = document.body;

    const colors = [
      "rgba(255, 71, 87, 0.95)",   // Coral red
      "rgba(255, 107, 129, 0.95)",  // Pink
      "rgba(112, 161, 255, 0.95)",  // Sky blue
      "rgba(46, 213, 115, 0.95)",   // Pastel green
      "rgba(255, 165, 2, 0.95)",    // Golden yellow
      "rgba(232, 67, 147, 0.95)",   // Deep magenta
      "rgba(162, 155, 254, 0.95)"   // Lilac purple
    ];

    const intervalId = setInterval(() => {
      const balloon = document.createElement("div");
      balloon.className = "balloon";

      const size = Math.random() * 20 + 45; // 45px to 65px width
      const height = size * 1.25;
      const startX = Math.random() * 95; // 0vw to 95vw
      const animDuration = Math.random() * 3 + 5; // 5s to 8s
      const swayX = Math.random() * 260 - 130; // sway -130px to 130px
      const color = colors[Math.floor(Math.random() * colors.length)];

      balloon.style.width = `${size}px`;
      balloon.style.height = `${height}px`;
      balloon.style.left = `${startX}vw`;
      balloon.style.color = color; // currentColor support in CSS triangle fuse
      balloon.style.background = `radial-gradient(circle at 35% 35%, #ffffff 0%, ${color} 70%)`;
      balloon.style.animationDuration = `${animDuration}s`;
      balloon.style.setProperty('--sway-x', `${swayX}px`);

      // Add a string to the balloon
      const string = document.createElement("div");
      string.className = "balloon-string";
      balloon.appendChild(string);

      container.appendChild(balloon);

      // Clean up DOM node once animation ends
      setTimeout(() => {
        balloon.remove();
      }, animDuration * 1000);

    }, interval);

    // Stop spawning new balloons after 10 seconds
    setTimeout(() => {
      clearInterval(intervalId);
    }, duration);
  }

  // ==========================================================================
  // MEMORY HUB QUIZ GATEWAY
  // ==========================================================================
  let isTimelineQuizPassed = false;
  const timeQuizJune = document.getElementById("btn-quiz-time-june");
  const timeQuizJuly = document.getElementById("btn-quiz-time-july");
  const timeQuizError = document.getElementById("timeline-quiz-error");
  const timeQuizContainer = document.getElementById("timeline-quiz-container");
  const timelineHub = document.getElementById("timeline-hub");

  if (timeQuizJune) {
    timeQuizJune.addEventListener("click", () => {
      playSound('alarm');
      timeQuizError.innerText = "Memory Sync Failed! (Wrong month! Try again, scan your records)";
      timeQuizJune.style.transform = "translateX(-10px)";
      setTimeout(() => timeQuizJune.style.transform = "translateX(0)", 150);
    });
  }

  if (timeQuizJuly) {
    timeQuizJuly.addEventListener("click", () => {
      playSound('success');
      isTimelineQuizPassed = true;
      timeQuizContainer.style.transition = "opacity 0.4s ease";
      timeQuizContainer.style.opacity = "0";
      setTimeout(() => {
        timeQuizContainer.style.display = "none";
        timelineHub.style.display = "block";
        triggerConfettiExplosion();
      }, 400);
    });
  }

  // ==========================================================================
  // BOLLYWOOD PLAYER QUIZ GATEWAY
  // ==========================================================================
  let isMusicQuizPassed = false;
  const musicQuizArijit = document.getElementById("btn-quiz-music-arijit");
  const musicQuizPartner = document.getElementById("btn-quiz-music-partner");
  const musicQuizError = document.getElementById("music-quiz-error");
  const musicQuizContainer = document.getElementById("music-quiz-container");
  const audioPlayerPanel = document.getElementById("audio-player-panel");

  if (musicQuizArijit) {
    musicQuizArijit.addEventListener("click", () => {
      playSound('alarm');
      musicQuizError.innerText = "Wrong! (Hint: It is obviously the person who is hosting this website! Try again)";
      musicQuizArijit.style.transform = "translateX(-10px)";
      setTimeout(() => musicQuizArijit.style.transform = "translateX(0)", 150);
    });
  }

  if (musicQuizPartner) {
    musicQuizPartner.addEventListener("click", () => {
      playSound('success');
      isMusicQuizPassed = true;
      musicQuizContainer.style.transition = "opacity 0.4s ease";
      musicQuizContainer.style.opacity = "0";
      setTimeout(() => {
        musicQuizContainer.style.display = "none";
        audioPlayerPanel.style.display = "block";
        triggerConfettiExplosion();
      }, 400);
    });
  }

  // ==========================================================================
  // LETTER & WISHES QUIZ GATEWAY
  // ==========================================================================
  let isLetterQuizPassed = false;
  const letQuizWar = document.getElementById("btn-quiz-let-war");
  const letQuizPeace = document.getElementById("btn-quiz-let-peace");
  const letQuizError = document.getElementById("letter-quiz-error");
  const letQuizContainer = document.getElementById("letter-quiz-container");
  const letterCenterWrapper = document.getElementById("letter-center-wrapper");

  if (letQuizWar) {
    letQuizWar.addEventListener("click", () => {
      playSound('alarm');
      letQuizError.innerText = "Containment breach! War Protocols must be deactivated first.";
      letQuizWar.style.transform = "translateX(-10px)";
      setTimeout(() => letQuizWar.style.transform = "translateX(0)", 150);
    });
  }

  if (letQuizPeace) {
    letQuizPeace.addEventListener("click", () => {
      playSound('success');
      isLetterQuizPassed = true;
      letQuizContainer.style.transition = "opacity 0.4s ease";
      letQuizContainer.style.opacity = "0";
      setTimeout(() => {
        letQuizContainer.style.display = "none";
        letterCenterWrapper.style.display = "flex";
        triggerConfettiExplosion();
      }, 400);
    });
  }

  // ==========================================================================
  // SECRET VAULT QUIZ GATEWAY
  // ==========================================================================
  let isVaultQuizPassed = false;
  const vaultQuizFake = document.getElementById("btn-quiz-vault-fake");
  const vaultQuizSmile = document.getElementById("btn-quiz-vault-smile");
  const vaultQuizError = document.getElementById("vault-quiz-error");
  const vaultQuizContainer = document.getElementById("vault-quiz-container");
  const vaultPanel = document.getElementById("vault-panel");

  if (vaultQuizFake) {
    vaultQuizFake.addEventListener("click", () => {
      playSound('alarm');
      vaultQuizError.innerText = "Warning: Flattery levels out of bounds. Try again.";
      vaultQuizFake.style.transform = "translateX(-10px)";
      setTimeout(() => vaultQuizFake.style.transform = "translateX(0)", 150);
    });
  }

  if (vaultQuizSmile) {
    vaultQuizSmile.addEventListener("click", () => {
      playSound('success');
      isVaultQuizPassed = true;
      vaultQuizContainer.style.transition = "opacity 0.4s ease";
      vaultQuizContainer.style.opacity = "0";
      setTimeout(() => {
        vaultQuizContainer.style.display = "none";
        vaultPanel.style.display = "flex";
        triggerConfettiExplosion();
      }, 400);
    });
  }

  // ==========================================================================
  // LIGHTWEIGHT CELEBRATORY CONFETTI BURST
  // ==========================================================================
  function triggerConfettiExplosion() {
    const confettiCount = 35;
    const container = document.body;

    for (let i = 0; i < confettiCount; i++) {
      const el = document.createElement("div");
      el.className = "confetti-piece";
      container.appendChild(el);

      const size = Math.random() * 8 + 5;
      const colors = ["#ff4757", "#ff6b8b", "#ff7f50", "#ffa502", "#2ed573", "#1e90ff", "#a4b0be", "#e84393"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      el.style.position = "fixed";
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.background = color;
      el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      el.style.top = "50vh";
      el.style.left = "50vw";
      el.style.zIndex = "2000";
      el.style.pointerEvents = "none";

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 4;
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed - Math.random() * 4;
      let posX = window.innerWidth / 2;
      let posY = window.innerHeight / 2;
      let rotation = Math.random() * 360;
      let rotSpeed = Math.random() * 6 - 3;

      const anim = setInterval(() => {
        posX += vx;
        posY += vy;
        vy += 0.35;
        vx *= 0.97;
        rotation += rotSpeed;

        el.style.left = `${posX}px`;
        el.style.top = `${posY}px`;
        el.style.transform = `rotate(${rotation}deg)`;

        if (posY > window.innerHeight) {
          clearInterval(anim);
          el.remove();
        }
      }, 16);
    }
  }

  // ==========================================================================
  // AREEB & ZUNI KIDS SURPRISE GATEWAY
  // ==========================================================================
  const kidsOverlay = document.getElementById("kids-surprise-overlay");
  const kidsQuizBox = document.getElementById("kids-quiz-box");
  const kidsWishesBox = document.getElementById("kids-wishes-box");
  const btnKidsTang = document.getElementById("btn-kids-quiz-tang");
  const btnKidsManage = document.getElementById("btn-kids-quiz-manage");
  const kidsError = document.getElementById("kids-quiz-error");
  const btnKidsEnter = document.getElementById("btn-kids-enter");

  if (btnKidsTang) {
    btnKidsTang.addEventListener("click", () => {
      playSound('success');
      
      // Hide quiz box, display wishes box
      kidsQuizBox.style.transition = "opacity 0.4s ease";
      kidsQuizBox.style.opacity = "0";
      setTimeout(() => {
        kidsQuizBox.style.display = "none";
        kidsWishesBox.style.display = "flex";
        kidsWishesBox.style.opacity = "0";
        setTimeout(() => {
          kidsWishesBox.style.transition = "opacity 0.5s ease";
          kidsWishesBox.style.opacity = "1";
        }, 50);
        triggerConfettiExplosion();
      }, 400);
    });
  }

  if (btnKidsManage) {
    btnKidsManage.addEventListener("click", () => {
      playSound('alarm');
      kidsError.innerText = "Wrong! (Hint: We are kids, of course Khala jaan ko tang karna is our primary job! He He He 😜 Try again!)";
      btnKidsManage.style.transform = "translateX(-10px)";
      setTimeout(() => btnKidsManage.style.transform = "translateX(0)", 150);
    });
  }

  if (btnKidsEnter) {
    btnKidsEnter.addEventListener("click", () => {
      playSound('success');
      
      // Fade out entire surprise overlay and transition to main dashboard
      kidsOverlay.style.transition = "opacity 0.6s ease";
      kidsOverlay.style.opacity = "0";
      
      setTimeout(() => {
        kidsOverlay.style.display = "none";
        
        // Show main dashboard wrapper
        const dashboard = document.getElementById("dashboard-wrapper");
        if (dashboard) {
          dashboard.classList.add("active");
          dashboard.style.display = "flex";
        }
      }, 600);
    });
  }

});
