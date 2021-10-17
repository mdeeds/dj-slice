import * as Tone from "tone";

export class PositronConfig {
  env: Tone.EnvelopeOptions;
  freqEnv: Tone.FrequencyEnvelopeOptions;
  filterEnv: Tone.FrequencyEnvelopeOptions;
  osc1: Tone.ToneOscillatorType;
  osc2: Tone.ToneOscillatorType; // Oscilator shape
  osc2Detune: number;
  filter: BiquadFilterType;
  filterScale: number;
  noise: number;
  distortion: number;

  static patch808: PositronConfig = {
    env: {
      attack: 0.01, decay: 0.4, sustain: 0, release: 0.3,
      attackCurve: "exponential", releaseCurve: "exponential", decayCurve: "exponential",
      context: Tone.getContext(),
    },
    freqEnv: {
      attack: 0.01, decay: 0.2, sustain: 0, release: 0.2, baseFrequency: 'a1', octaves: 1.5,
      attackCurve: "exponential", releaseCurve: "exponential", decayCurve: "exponential",
      context: Tone.getContext(), exponent: 2,
    },
    filterEnv: {
      attack: 0.01, decay: 0.2, sustain: 0, release: 0.2, baseFrequency: 'a1', octaves: 1.5,
      attackCurve: "exponential", releaseCurve: "exponential", decayCurve: "exponential",
      context: Tone.getContext(), exponent: 2,
    },
    osc1: "square",
    osc2: "sine",
    osc2Detune: 0.5,
    filter: "bandpass",
    filterScale: 1.0,
    noise: 0.2,
    distortion: 2.0,
  }

  static patchSaw: PositronConfig = {
    env: {
      attack: 0.1, decay: 0.1, sustain: 0.5, release: 0.5,
      attackCurve: "exponential", releaseCurve: "exponential", decayCurve: "exponential",
      context: Tone.getContext(),
    },
    freqEnv: {
      attack: 0, decay: 0, sustain: 0, release: 0, baseFrequency: 'a1', octaves: 0,
      attackCurve: "exponential", releaseCurve: "exponential", decayCurve: "exponential",
      context: Tone.getContext(), exponent: 2,
    },
    filterEnv: {
      attack: 0, decay: 0, sustain: 0, release: 0, baseFrequency: 'a1', octaves: 0,
      attackCurve: "exponential", releaseCurve: "exponential", decayCurve: "exponential",
      context: Tone.getContext(), exponent: 2,
    },
    osc1: "sawtooth",
    osc2: "sawtooth",
    osc2Detune: 1.0,
    filter: "lowpass",
    filterScale: 32,  // 5 octaves
    noise: 0,
    distortion: 0,
  }

  static patchSoftBass: PositronConfig = {
    "env": {
      "attack": 0.01,
      "decay": 0.1,
      "sustain": 0.5,
      "release": 0.2,
      "attackCurve": "exponential",
      "releaseCurve": "exponential",
      "decayCurve": "exponential",
      "context": Tone.getContext()
    },
    "freqEnv": {
      "attack": 0,
      "decay": 0,
      "sustain": 0,
      "release": 0,
      "baseFrequency": "a1",
      "octaves": 0,
      "attackCurve": "exponential",
      "releaseCurve": "exponential",
      "decayCurve": "exponential",
      "context": Tone.getContext(),
      "exponent": 2
    },
    "filterEnv": {
      "attack": 0.001,
      "decay": 0.1,
      "sustain": 0,
      "release": 0.1,
      "baseFrequency": "a1",
      "octaves": 0,
      "attackCurve": "exponential",
      "releaseCurve": "exponential",
      "decayCurve": "exponential",
      "context": Tone.getContext(),
      "exponent": 2
    },
    "osc1": "sawtooth",
    "osc2": "sine",
    "osc2Detune": 2,
    "filter": "lowpass",
    "filterScale": 3,
    "noise": 0,
    "distortion": 0
  };

  static fromString(config: string) {
    const result = new PositronConfig();
    Object.assign(result, JSON.parse(config));
    result.env.context = Tone.getContext();
    result.freqEnv.context = Tone.getContext();
    result.filterEnv.context = Tone.getContext();
    return result;
  }
}

export class Positron {
  private env: Tone.Envelope;
  private freqEnv: Tone.FrequencyEnvelope;
  private filterEnv: Tone.FrequencyEnvelope;

  constructor(config: PositronConfig) {
    this.env = new Tone.Envelope(config.env);
    this.freqEnv = new Tone.FrequencyEnvelope(config.freqEnv);
    this.filterEnv = new Tone.FrequencyEnvelope(config.filterEnv);

    const filterScale = new Tone.Scale(0, config.filterScale);

    const osc1 = new Tone.Oscillator(220, config.osc1).start();
    const harmonic = new Tone.Scale(0, config.osc2Detune);
    const osc2 = new Tone.Oscillator(1000, config.osc2).start();
    const noise = new Tone.Noise("white").start();
    const filter = new Tone.Filter(0, config.filter);
    const gainNode = new Tone.Gain(0);
    const noiseGain = new Tone.Gain(config.noise);
    const dist = new Tone.Distortion(config.distortion);

    this.freqEnv.connect(osc1.frequency);
    this.freqEnv.connect(harmonic);
    harmonic.connect(osc2.frequency);

    this.filterEnv.connect(filterScale);
    filterScale.connect(filter.frequency);
    this.env.connect(gainNode.gain);
    noise.connect(noiseGain);
    noiseGain.connect(filter);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dist);
    gainNode.toDestination();
  }

  triggerAttackRelease(note: string, duration: string, time: number) {
    this.freqEnv.baseFrequency = note;
    this.filterEnv.baseFrequency = note;
    this.env.triggerAttackRelease(duration, time);
    this.freqEnv.triggerAttackRelease(duration, time);
    this.filterEnv.triggerAttackRelease(duration, time);
  }

  triggerAttack(note: string, time: number) {
    this.freqEnv.baseFrequency = note;
    this.filterEnv.baseFrequency = note;
    this.env.triggerAttack(time);
    this.freqEnv.triggerAttack(time);
    this.filterEnv.triggerAttack(time);
  }

  triggerRelease(note: string, time: number) {
    this.freqEnv.baseFrequency = note;
    this.filterEnv.baseFrequency = note;
    this.env.triggerRelease(time);
    this.freqEnv.triggerRelease(time);
    this.filterEnv.triggerRelease(time);
  }
}