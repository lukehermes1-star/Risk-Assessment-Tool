const presets = {
  box: {
    name: "Box breathing",
    phases: [
      { label: "Inhale", type: "inhale", duration: 4 },
      { label: "Hold", type: "hold-high", duration: 4 },
      { label: "Exhale", type: "exhale", duration: 4 },
      { label: "Hold", type: "hold-low", duration: 4 }
    ]
  },
  "478": {
    name: "4-7-8",
    phases: [
      { label: "Inhale", type: "inhale", duration: 4 },
      { label: "Hold", type: "hold-high", duration: 7 },
      { label: "Exhale", type: "exhale", duration: 8 }
    ]
  },
  sigh: {
    name: "Physiological sigh",
    phases: [
      { label: "Inhale", type: "inhale", duration: 2 },
      { label: "Inhale", type: "inhale", duration: 1 },
      { label: "Exhale", type: "exhale", duration: 6 }
    ]
  }
};

const prepSeconds = 3;

const presetSelect = document.getElementById("preset");
const cyclesSelect = document.getElementById("cycles");
const soundToggle = document.getElementById("sound-toggle");
const vibrationToggle = document.getElementById("vibration-toggle");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const phaseLabel = document.getElementById("phase-label");
const countdownLabel = document.getElementById("countdown");
const cycleCountLabel = document.getElementById("cycle-count");
const prepLabel = document.getElementById("prep-label");
const circleInner = document.querySelector(".circle__inner");

let audioContext = null;
let session = null;
let rafId = null;

function buildCycleOptions() {
  for (let i = 1; i <= 20; i += 1) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = String(i);
    if (i === 6) {
      option.selected = true;
    }
    cyclesSelect.appendChild(option);
  }
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playTone() {
  if (!soundToggle.checked) {
    return;
  }
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 432;
  gain.gain.value = 0.12;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
  oscillator.stop(context.currentTime + 0.4);
}

function vibrate() {
  if (!vibrationToggle.checked) {
    return;
  }
  if (navigator.vibrate) {
    navigator.vibrate(60);
  }
}

function setCircleScale(scale) {
  circleInner.style.transform = `scale(${scale})`;
}

function getScaleForPhase(phaseType, progress) {
  const min = 0.7;
  const max = 1;
  if (phaseType === "inhale") {
    return min + (max - min) * progress;
  }
  if (phaseType === "exhale") {
    return max - (max - min) * progress;
  }
  if (phaseType === "hold-high") {
    return max;
  }
  return min;
}

function updatePhaseDisplay(phase, remainingSeconds) {
  phaseLabel.textContent = phase.label;
  countdownLabel.textContent = Math.max(0, Math.ceil(remainingSeconds));
}

function updateButtons(isRunning) {
  startButton.disabled = isRunning;
  pauseButton.disabled = !isRunning;
  presetSelect.disabled = isRunning;
  cyclesSelect.disabled = isRunning;
}

function createSession() {
  const preset = presets[presetSelect.value];
  return {
    preset,
    cycleTarget: Number(cyclesSelect.value),
    cycleIndex: 0,
    phaseIndex: 0,
    phaseStart: null,
    prepStart: null,
    isPaused: false,
    isRunning: false,
    elapsedBeforePause: 0
  };
}

function startSession() {
  if (session && session.isRunning) {
    return;
  }
  session = createSession();
  session.isRunning = true;
  session.prepStart = performance.now();
  prepLabel.textContent = `Starting in ${prepSeconds}...`;
  phaseLabel.textContent = "Prepare";
  countdownLabel.textContent = prepSeconds;
  setCircleScale(0.7);
  updateButtons(true);
  playTone();
  vibrate();
  rafId = requestAnimationFrame(updateLoop);
}

function pauseSession() {
  if (!session || !session.isRunning) {
    return;
  }
  session.isPaused = true;
  session.isRunning = false;
  session.elapsedBeforePause = performance.now() - (session.phaseStart || performance.now());
  updateButtons(false);
  phaseLabel.textContent = "Paused";
}

function resumeSession() {
  if (!session || session.isRunning) {
    return;
  }
  session.isPaused = false;
  session.isRunning = true;
  session.phaseStart = performance.now() - session.elapsedBeforePause;
  updateButtons(true);
  rafId = requestAnimationFrame(updateLoop);
}

function resetSession() {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
  session = null;
  prepLabel.textContent = "";
  phaseLabel.textContent = "Ready";
  countdownLabel.textContent = "0";
  cycleCountLabel.textContent = "0";
  setCircleScale(0.7);
  updateButtons(false);
}

function advancePhase() {
  if (!session) {
    return;
  }
  session.phaseIndex += 1;
  session.phaseStart = performance.now();
  session.elapsedBeforePause = 0;

  if (session.phaseIndex >= session.preset.phases.length) {
    session.phaseIndex = 0;
    session.cycleIndex += 1;
    cycleCountLabel.textContent = String(session.cycleIndex);
    if (session.cycleIndex >= session.cycleTarget) {
      completeSession();
      return;
    }
  }
  playTone();
  vibrate();
}

function completeSession() {
  session.isRunning = false;
  updateButtons(false);
  phaseLabel.textContent = "Complete";
  countdownLabel.textContent = "0";
  prepLabel.textContent = "Session complete.";
  playTone();
  vibrate();
}

function updateLoop(timestamp) {
  if (!session || !session.isRunning) {
    return;
  }

  if (session.prepStart !== null) {
    const prepElapsed = (timestamp - session.prepStart) / 1000;
    const remainingPrep = prepSeconds - prepElapsed;
    if (remainingPrep <= 0) {
      session.prepStart = null;
      session.phaseStart = performance.now();
      playTone();
      vibrate();
    } else {
      prepLabel.textContent = `Starting in ${Math.ceil(remainingPrep)}...`;
      countdownLabel.textContent = Math.ceil(remainingPrep);
      rafId = requestAnimationFrame(updateLoop);
      return;
    }
  }

  const phase = session.preset.phases[session.phaseIndex];
  const elapsed = (timestamp - session.phaseStart) / 1000;
  const remaining = phase.duration - elapsed;
  const progress = Math.min(Math.max(elapsed / phase.duration, 0), 1);
  const scale = getScaleForPhase(phase.type, progress);

  setCircleScale(scale);
  updatePhaseDisplay(phase, remaining);

  if (remaining <= 0) {
    advancePhase();
  }

  rafId = requestAnimationFrame(updateLoop);
}

startButton.addEventListener("click", () => {
  if (session && session.isPaused) {
    resumeSession();
    return;
  }
  startSession();
});

pauseButton.addEventListener("click", pauseSession);
resetButton.addEventListener("click", resetSession);

presetSelect.addEventListener("change", () => {
  resetSession();
});

cyclesSelect.addEventListener("change", () => {
  resetSession();
});

buildCycleOptions();
resetSession();
