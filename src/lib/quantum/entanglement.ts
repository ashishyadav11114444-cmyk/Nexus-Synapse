import { EntanglementPair } from '../../types';

export class QuantumEntanglement {
  private coherenceThreshold: number;

  constructor(coherenceThreshold: number = 0.6) {
    this.coherenceThreshold = coherenceThreshold;
  }

  calculateEntanglement(
    symbol1Data: number[],
    symbol2Data: number[],
    symbol1: string,
    symbol2: string
  ): EntanglementPair {
    if (symbol1Data.length !== symbol2Data.length) {
      throw new Error('Price data arrays must have equal length');
    }

    const correlation = this.calculateCorrelation(symbol1Data, symbol2Data);
    const mutualInfo = this.calculateMutualInformation(symbol1Data, symbol2Data);
    const coherence = this.calculateQuantumCoherence(symbol1Data, symbol2Data);

    return {
      symbol1,
      symbol2,
      correlation: correlation * mutualInfo,
      coherence
    };
  }

  private calculateCorrelation(data1: number[], data2: number[]): number {
    const n = data1.length;
    if (n === 0) return 0;

    const mean1 = data1.reduce((sum, val) => sum + val, 0) / n;
    const mean2 = data2.reduce((sum, val) => sum + val, 0) / n;

    let covariance = 0;
    let variance1 = 0;
    let variance2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = data1[i] - mean1;
      const diff2 = data2[i] - mean2;

      covariance += diff1 * diff2;
      variance1 += diff1 * diff1;
      variance2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(variance1 * variance2);
    return denominator === 0 ? 0 : covariance / denominator;
  }

  private calculateMutualInformation(data1: number[], data2: number[]): number {
    const bins = 10;
    const hist1 = this.createHistogram(data1, bins);
    const hist2 = this.createHistogram(data2, bins);
    const joint = this.createJointHistogram(data1, data2, bins);

    let mutualInfo = 0;
    const n = data1.length;

    for (let i = 0; i < bins; i++) {
      for (let j = 0; j < bins; j++) {
        if (joint[i][j] > 0 && hist1[i] > 0 && hist2[j] > 0) {
          const pxy = joint[i][j] / n;
          const px = hist1[i] / n;
          const py = hist2[j] / n;
          mutualInfo += pxy * Math.log2(pxy / (px * py));
        }
      }
    }

    return Math.min(1, mutualInfo / 2);
  }

  private createHistogram(data: number[], bins: number): number[] {
    const hist = new Array(bins).fill(0);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    for (const value of data) {
      const binIndex = Math.min(Math.floor(((value - min) / range) * bins), bins - 1);
      hist[binIndex]++;
    }

    return hist;
  }

  private createJointHistogram(data1: number[], data2: number[], bins: number): number[][] {
    const joint: number[][] = Array(bins).fill(0).map(() => Array(bins).fill(0));

    const min1 = Math.min(...data1);
    const max1 = Math.max(...data1);
    const range1 = max1 - min1 || 1;

    const min2 = Math.min(...data2);
    const max2 = Math.max(...data2);
    const range2 = max2 - min2 || 1;

    for (let i = 0; i < data1.length; i++) {
      const binI = Math.min(Math.floor(((data1[i] - min1) / range1) * bins), bins - 1);
      const binJ = Math.min(Math.floor(((data2[i] - min2) / range2) * bins), bins - 1);
      joint[binI][binJ]++;
    }

    return joint;
  }

  private calculateQuantumCoherence(data1: number[], data2: number[]): number {
    const n = Math.min(data1.length, 50);

    let coherenceSum = 0;
    for (let lag = 0; lag < n / 2; lag++) {
      let crossCorr = 0;
      for (let i = 0; i < n - lag; i++) {
        const norm1 = this.normalize(data1.slice(Math.max(0, data1.length - n), data1.length));
        const norm2 = this.normalize(data2.slice(Math.max(0, data2.length - n), data2.length));

        if (i < norm1.length && i + lag < norm2.length) {
          crossCorr += norm1[i] * norm2[i + lag];
        }
      }

      crossCorr /= (n - lag);
      coherenceSum += Math.abs(crossCorr) * Math.exp(-lag / 10);
    }

    return Math.min(1, coherenceSum / 5);
  }

  private normalize(data: number[]): number[] {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const std = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );

    return data.map(val => std === 0 ? 0 : (val - mean) / std);
  }

  isEntangled(pair: EntanglementPair): boolean {
    return Math.abs(pair.correlation) > this.coherenceThreshold &&
           pair.coherence > this.coherenceThreshold;
  }

  predictFromEntanglement(
    pair: EntanglementPair,
    knownSymbolChange: number
  ): number {
    if (!this.isEntangled(pair)) {
      return 0;
    }

    const correlation = pair.correlation;
    const coherence = pair.coherence;

    return knownSymbolChange * correlation * coherence;
  }

  calculateEntanglementStrength(pairs: EntanglementPair[]): number {
    if (pairs.length === 0) return 0;

    const totalStrength = pairs.reduce((sum, pair) => {
      return sum + Math.abs(pair.correlation) * pair.coherence;
    }, 0);

    return totalStrength / pairs.length;
  }

  findBellInequality(data1: number[], data2: number[]): number {
    const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
    let bellValue = 0;

    for (let i = 0; i < angles.length - 1; i++) {
      const corr1 = this.measureAtAngle(data1, data2, angles[i], angles[i + 1]);
      const corr2 = this.measureAtAngle(data1, data2, angles[i], angles[(i + 2) % angles.length]);

      bellValue += Math.abs(corr1) + Math.abs(corr2);
    }

    return bellValue;
  }

  private measureAtAngle(data1: number[], data2: number[], angle1: number, angle2: number): number {
    const rotated1 = data1.map((val, i) => val * Math.cos(angle1 * i / data1.length));
    const rotated2 = data2.map((val, i) => val * Math.cos(angle2 * i / data2.length));

    return this.calculateCorrelation(rotated1, rotated2);
  }
}
