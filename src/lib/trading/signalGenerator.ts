import { QuantumWaveFunction, QuantumSuperposition, QuantumEntanglement } from '../quantum';
import { QuantumSignal } from '../../types';

export class QuantumSignalGenerator {
  private waveFunction: QuantumWaveFunction;
  private superposition: QuantumSuperposition;
  private entanglement: QuantumEntanglement;

  constructor() {
    this.waveFunction = new QuantumWaveFunction();
    this.superposition = new QuantumSuperposition();
    this.entanglement = new QuantumEntanglement();
  }

  generateSignal(
    algorithmId: string,
    symbol: string,
    priceData: number[],
    timestamp: number,
    relatedSymbolsData?: Map<string, number[]>
  ): Omit<QuantumSignal, 'id' | 'created_at'> {
    const waveState = this.waveFunction.calculateWaveState(priceData, timestamp);
    const superpositionState = this.superposition.createSuperposition(priceData);

    let entanglementScore = 0;
    if (relatedSymbolsData && relatedSymbolsData.size > 0) {
      const entanglementScores: number[] = [];
      relatedSymbolsData.forEach((data, relatedSymbol) => {
        const pair = this.entanglement.calculateEntanglement(
          priceData,
          data,
          symbol,
          relatedSymbol
        );
        entanglementScores.push(Math.abs(pair.correlation) * pair.coherence);
      });
      entanglementScore = entanglementScores.reduce((a, b) => a + b, 0) / entanglementScores.length;
    }

    const expectedReturn = this.superposition.measureExpectedValue(superpositionState);
    const variance = this.superposition.calculateVariance(superpositionState);
    const predictions = this.waveFunction.calculateWavePrediction(waveState, 5);

    const signalStrength = this.calculateSignalStrength(
      waveState.amplitude,
      waveState.coherence,
      superpositionState.entropy,
      entanglementScore
    );

    const signalType = this.determineSignalType(
      expectedReturn,
      predictions,
      signalStrength
    );

    const confidence = this.calculateConfidence(
      waveState.coherence,
      superpositionState.entropy,
      entanglementScore,
      variance
    );

    return {
      algorithm_id: algorithmId,
      symbol,
      signal_type: signalType,
      strength: signalStrength,
      wave_amplitude: waveState.amplitude,
      phase_angle: waveState.phase,
      entanglement_score: entanglementScore,
      confidence,
      metadata: {
        frequency: waveState.frequency,
        entropy: superpositionState.entropy,
        expected_return: expectedReturn,
        variance,
        predictions
      }
    };
  }

  private calculateSignalStrength(
    amplitude: number,
    coherence: number,
    entropy: number,
    entanglement: number
  ): number {
    const amplitudeWeight = 0.3;
    const coherenceWeight = 0.3;
    const entropyWeight = 0.2;
    const entanglementWeight = 0.2;

    const normalizedAmplitude = Math.min(1, amplitude / 2);
    const normalizedEntropy = 1 - entropy;

    const strength =
      normalizedAmplitude * amplitudeWeight +
      coherence * coherenceWeight +
      normalizedEntropy * entropyWeight +
      entanglement * entanglementWeight;

    return Math.max(0, Math.min(1, strength));
  }

  private determineSignalType(
    expectedReturn: number,
    predictions: number[],
    strength: number
  ): 'buy' | 'sell' | 'hold' {
    const trend = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;

    const threshold = 0.4;

    if (strength < threshold) {
      return 'hold';
    }

    if (expectedReturn > 0 && trend > 0) {
      return 'buy';
    } else if (expectedReturn < 0 && trend < 0) {
      return 'sell';
    }

    return 'hold';
  }

  private calculateConfidence(
    coherence: number,
    entropy: number,
    entanglement: number,
    variance: number
  ): number {
    const coherenceWeight = 0.35;
    const entropyWeight = 0.25;
    const entanglementWeight = 0.25;
    const stabilityWeight = 0.15;

    const normalizedEntropy = 1 - entropy;
    const stability = 1 / (1 + variance);

    const confidence =
      coherence * coherenceWeight +
      normalizedEntropy * entropyWeight +
      entanglement * entanglementWeight +
      stability * stabilityWeight;

    return Math.max(0, Math.min(1, confidence));
  }

  analyzeMultipleTimeframes(
    algorithmId: string,
    symbol: string,
    shortTermData: number[],
    mediumTermData: number[],
    longTermData: number[],
    timestamp: number
  ): Omit<QuantumSignal, 'id' | 'created_at'> {
    const shortSignal = this.generateSignal(algorithmId, symbol, shortTermData, timestamp);
    const mediumSignal = this.generateSignal(algorithmId, symbol, mediumTermData, timestamp);
    const longSignal = this.generateSignal(algorithmId, symbol, longTermData, timestamp);

    const weights = {
      short: 0.5,
      medium: 0.3,
      long: 0.2
    };

    const aggregatedStrength =
      shortSignal.strength * weights.short +
      mediumSignal.strength * weights.medium +
      longSignal.strength * weights.long;

    const aggregatedConfidence =
      shortSignal.confidence * weights.short +
      mediumSignal.confidence * weights.medium +
      longSignal.confidence * weights.long;

    const signalVotes = [shortSignal, mediumSignal, longSignal];
    const buyVotes = signalVotes.filter(s => s.signal_type === 'buy').length;
    const sellVotes = signalVotes.filter(s => s.signal_type === 'sell').length;

    let finalSignalType: 'buy' | 'sell' | 'hold' = 'hold';
    if (buyVotes >= 2) finalSignalType = 'buy';
    else if (sellVotes >= 2) finalSignalType = 'sell';

    return {
      algorithm_id: algorithmId,
      symbol,
      signal_type: finalSignalType,
      strength: aggregatedStrength,
      wave_amplitude: (shortSignal.wave_amplitude + mediumSignal.wave_amplitude + longSignal.wave_amplitude) / 3,
      phase_angle: shortSignal.phase_angle,
      entanglement_score: (shortSignal.entanglement_score + mediumSignal.entanglement_score + longSignal.entanglement_score) / 3,
      confidence: aggregatedConfidence,
      metadata: {
        short_term: shortSignal.metadata,
        medium_term: mediumSignal.metadata,
        long_term: longSignal.metadata,
        timeframe_consensus: {
          buy_votes: buyVotes,
          sell_votes: sellVotes
        }
      }
    };
  }
}
