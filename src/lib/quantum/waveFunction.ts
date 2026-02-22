import { QuantumWaveState } from '../../types';

export class QuantumWaveFunction {
  private harmonics: number[];
  private dampingFactor: number;

  constructor(harmonics: number[] = [1, 2, 3, 5, 8], dampingFactor: number = 0.95) {
    this.harmonics = harmonics;
    this.dampingFactor = dampingFactor;
  }

  calculateWaveState(priceData: number[], timestamp: number): QuantumWaveState {
    const normalizedPrices = this.normalizePrices(priceData);

    const amplitude = this.calculateAmplitude(normalizedPrices);
    const phase = this.calculatePhase(normalizedPrices, timestamp);
    const frequency = this.calculateDominantFrequency(normalizedPrices);
    const coherence = this.calculateCoherence(normalizedPrices);

    return {
      amplitude,
      phase,
      frequency,
      coherence
    };
  }

  private normalizePrices(prices: number[]): number[] {
    if (prices.length === 0) return [];

    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const std = Math.sqrt(
      prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length
    );

    return prices.map(p => std === 0 ? 0 : (p - mean) / std);
  }

  private calculateAmplitude(normalizedPrices: number[]): number {
    if (normalizedPrices.length === 0) return 0;

    const sumSquares = normalizedPrices.reduce((sum, p) => sum + p * p, 0);
    return Math.sqrt(sumSquares / normalizedPrices.length);
  }

  private calculatePhase(normalizedPrices: number[], timestamp: number): number {
    if (normalizedPrices.length < 2) return 0;

    const n = normalizedPrices.length;
    let realPart = 0;
    let imagPart = 0;

    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n;
      realPart += normalizedPrices[i] * Math.cos(angle);
      imagPart += normalizedPrices[i] * Math.sin(angle);
    }

    const phase = Math.atan2(imagPart, realPart);
    const timeModulation = (timestamp % 86400000) / 86400000 * 2 * Math.PI;

    return (phase + timeModulation) % (2 * Math.PI);
  }

  private calculateDominantFrequency(normalizedPrices: number[]): number {
    if (normalizedPrices.length < 3) return 0;

    const fft = this.simpleFourierTransform(normalizedPrices);
    let maxPower = 0;
    let dominantFreq = 0;

    for (let i = 1; i < fft.length / 2; i++) {
      const power = fft[i].real * fft[i].real + fft[i].imag * fft[i].imag;
      if (power > maxPower) {
        maxPower = power;
        dominantFreq = i / normalizedPrices.length;
      }
    }

    return dominantFreq;
  }

  private simpleFourierTransform(data: number[]): { real: number; imag: number }[] {
    const N = data.length;
    const result: { real: number; imag: number }[] = [];

    for (let k = 0; k < N; k++) {
      let real = 0;
      let imag = 0;

      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N;
        real += data[n] * Math.cos(angle);
        imag -= data[n] * Math.sin(angle);
      }

      result.push({ real: real / N, imag: imag / N });
    }

    return result;
  }

  private calculateCoherence(normalizedPrices: number[]): number {
    if (normalizedPrices.length < 2) return 0;

    let correlation = 0;
    const n = normalizedPrices.length;

    for (let lag = 1; lag < Math.min(n / 2, 20); lag++) {
      let autoCorr = 0;
      for (let i = 0; i < n - lag; i++) {
        autoCorr += normalizedPrices[i] * normalizedPrices[i + lag];
      }
      autoCorr /= (n - lag);
      correlation += Math.abs(autoCorr) * Math.pow(this.dampingFactor, lag);
    }

    return Math.min(1, correlation / 10);
  }

  calculateWavePrediction(currentState: QuantumWaveState, steps: number): number[] {
    const predictions: number[] = [];

    for (let i = 0; i < steps; i++) {
      let prediction = 0;

      for (const harmonic of this.harmonics) {
        const omega = 2 * Math.PI * currentState.frequency * harmonic;
        const t = i;
        prediction += currentState.amplitude * Math.sin(omega * t + currentState.phase) / harmonic;
      }

      prediction *= Math.pow(this.dampingFactor, i) * currentState.coherence;
      predictions.push(prediction);
    }

    return predictions;
  }

  calculateInterference(wave1: QuantumWaveState, wave2: QuantumWaveState): number {
    const phaseDiff = Math.abs(wave1.phase - wave2.phase);
    const freqRatio = wave1.frequency / (wave2.frequency || 1);

    const constructiveInterference = Math.cos(phaseDiff);
    const resonance = Math.exp(-Math.pow(Math.log(freqRatio), 2) / 2);

    return (wave1.amplitude + wave2.amplitude) * constructiveInterference * resonance;
  }
}
