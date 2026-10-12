// Magic Focus sounds - made with the browser Web Audio API (no sound files needed)

let ctx = null;
let enabled = true;
let cleanups = [];

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
  }

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  return ctx;
}

function tone(freq, start, duration, type = "sine", volume = 0.15) {
  if (!enabled) return;

  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  const t = c.currentTime + start;

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(c.destination);

  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export function setSoundEnabled(value) {
  enabled = value;

  if (!value) {
    stopAmbient();
  }
}

export const playClick = () => tone(660, 0, 0.08, "triangle", 0.1);

export const playFlip = () => tone(520, 0, 0.07, "triangle", 0.1);

export const playMatch = () => {
  tone(660, 0, 0.12, "sine", 0.14);
  tone(880, 0.1, 0.18, "sine", 0.14);
};

export const playWrong = () => tone(220, 0, 0.2, "sawtooth", 0.06);

export const playWin = () => {
  [523, 659, 784, 1047].forEach((f, i) =>
    tone(f, i * 0.12, 0.3, "sine", 0.15)
  );
};

export const playCollect = () => {
  tone(784, 0, 0.12, "sine", 0.14);
  tone(988, 0.1, 0.12, "sine", 0.14);
  tone(1319, 0.2, 0.25, "sine", 0.14);
};

export const playComplete = () => {
  [523, 659, 784, 1047, 1319].forEach((f, i) =>
    tone(f, i * 0.18, 0.5, "sine", 0.16)
  );
};

function makeNoise(c) {
  const length = c.sampleRate * 2;
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

// Ocean: deep waves that slowly rise and fall, with soft foam
function startOcean(c) {
  const source = c.createBufferSource();
  source.buffer = makeNoise(c);
  source.loop = true;

  const low = c.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 500;

  const foam = c.createBiquadFilter();
  foam.type = "bandpass";
  foam.frequency.value = 1800;
  foam.Q.value = 0.5;

  const waveGain = c.createGain();
  waveGain.gain.value = 0.18;

  const foamGain = c.createGain();
  foamGain.gain.value = 0.05;

  // One slow wave about every 10 seconds
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.1;

  const lfoWave = c.createGain();
  lfoWave.gain.value = 0.14;

  const lfoFoam = c.createGain();
  lfoFoam.gain.value = 0.04;

  lfo.connect(lfoWave);
  lfoWave.connect(waveGain.gain);
  lfo.connect(lfoFoam);
  lfoFoam.connect(foamGain.gain);

  source.connect(low);
  low.connect(waveGain);
  waveGain.connect(c.destination);

  source.connect(foam);
  foam.connect(foamGain);
  foamGain.connect(c.destination);

  source.start();
  lfo.start();

  return () => {
    source.stop();
    lfo.stop();

    [source, low, foam, waveGain, foamGain, lfo, lfoWave, lfoFoam].forEach(
      (node) => node.disconnect()
    );
  };
}

// Calm pad: slow, warm chords that change gently
function startCalm(c) {
  const chords = [
    [130.81, 164.81, 196.0, 246.94],
    [110.0, 164.81, 196.0, 261.63],
    [87.31, 130.81, 174.61, 220.0],
    [98.0, 146.83, 196.0, 246.94],
  ];

  const master = c.createGain();
  master.gain.value = 0.5;

  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;

  filter.connect(master);
  master.connect(c.destination);

  const voices = chords[0].map((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;
    osc.detune.value = (i - 1.5) * 4;
    gain.gain.value = 0.07;

    osc.connect(gain);
    gain.connect(filter);
    osc.start();

    return { osc, gain };
  });

  let step = 0;

  const timer = setInterval(() => {
    step = (step + 1) % chords.length;

    voices.forEach((voice, i) => {
      voice.osc.frequency.linearRampToValueAtTime(
        chords[step][i],
        c.currentTime + 4
      );
    });
  }, 8000);

  return () => {
    clearInterval(timer);

    voices.forEach((voice) => {
      voice.osc.stop();
      voice.osc.disconnect();
      voice.gain.disconnect();
    });

    filter.disconnect();
    master.disconnect();
  };
}

// Zen bowls: a soft bowl sound every few seconds
function startZen() {
  const notes = [220, 261.63, 293.66, 329.63, 392, 440];
  let timer = null;

  const strike = () => {
    const f = notes[Math.floor(Math.random() * notes.length)];

    tone(f, 0, 7, "sine", 0.1);
    tone(f * 2.76, 0, 3.5, "sine", 0.03);
    tone(f * 5.4, 0, 1.6, "sine", 0.015);

    timer = setTimeout(strike, 4500 + Math.random() * 3000);
  };

  strike();

  return () => clearTimeout(timer);
}

export function startAmbient(kind) {
  stopAmbient();

  if (!enabled) return;

  const c = getCtx();

  if (kind === "ocean") cleanups.push(startOcean(c));
  if (kind === "calm") cleanups.push(startCalm(c));
  if (kind === "zen") cleanups.push(startZen());
}

export function stopAmbient() {
  cleanups.forEach((cleanup) => {
    try {
      cleanup();
    } catch {
      /* already stopped */
    }
  });

  cleanups = [];
}