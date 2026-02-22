import { Portfolio, Position } from '../../types';

export interface RiskMetrics {
  portfolioRisk: number;
  sharpeRatio: number;
  maxDrawdown: number;
  valueAtRisk: number;
  concentration: number;
}

export interface PositionSizingResult {
  recommendedSize: number;
  maxSize: number;
  riskScore: number;
}

export class RiskManager {
  private maxPositionSize: number;
  private maxPortfolioRisk: number;
  private confidenceLevel: number;

  constructor(
    maxPositionSize: number = 0.2,
    maxPortfolioRisk: number = 0.02,
    confidenceLevel: number = 0.95
  ) {
    this.maxPositionSize = maxPositionSize;
    this.maxPortfolioRisk = maxPortfolioRisk;
    this.confidenceLevel = confidenceLevel;
  }

  calculateRiskMetrics(
    portfolio: Portfolio,
    positions: Position[],
    historicalReturns: number[]
  ): RiskMetrics {
    const portfolioRisk = this.calculatePortfolioRisk(positions, portfolio.total_value);
    const sharpeRatio = this.calculateSharpeRatio(historicalReturns);
    const maxDrawdown = this.calculateMaxDrawdown(historicalReturns);
    const valueAtRisk = this.calculateVaR(historicalReturns, portfolio.total_value);
    const concentration = this.calculateConcentration(positions, portfolio.total_value);

    return {
      portfolioRisk,
      sharpeRatio,
      maxDrawdown,
      valueAtRisk,
      concentration
    };
  }

  private calculatePortfolioRisk(positions: Position[], totalValue: number): number {
    if (totalValue === 0) return 0;

    const volatilities = positions.map(position => {
      const positionValue = position.quantity * position.current_price;
      const weight = positionValue / totalValue;
      const volatility = Math.abs(position.unrealized_pnl) / positionValue || 0.01;
      return weight * volatility;
    });

    return volatilities.reduce((sum, vol) => sum + vol, 0);
  }

  private calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    const annualizedReturn = avgReturn * 252;
    const annualizedStdDev = stdDev * Math.sqrt(252);

    return (annualizedReturn - riskFreeRate) / annualizedStdDev;
  }

  private calculateMaxDrawdown(returns: number[]): number {
    if (returns.length === 0) return 0;

    let peak = 1;
    let maxDrawdown = 0;
    let cumulative = 1;

    for (const ret of returns) {
      cumulative *= (1 + ret);
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = (peak - cumulative) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  private calculateVaR(returns: number[], portfolioValue: number): number {
    if (returns.length === 0) return 0;

    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - this.confidenceLevel) * sortedReturns.length);
    const varReturn = sortedReturns[index] || 0;

    return Math.abs(varReturn * portfolioValue);
  }

  private calculateConcentration(positions: Position[], totalValue: number): number {
    if (totalValue === 0 || positions.length === 0) return 0;

    const weights = positions.map(position => {
      const positionValue = position.quantity * position.current_price;
      return positionValue / totalValue;
    });

    const herfindahlIndex = weights.reduce((sum, w) => sum + w * w, 0);

    return herfindahlIndex;
  }

  calculatePositionSize(
    portfolio: Portfolio,
    targetPrice: number,
    signalStrength: number,
    volatility: number
  ): PositionSizingResult {
    const kellyFraction = this.calculateKellyCriterion(signalStrength, volatility);

    const riskBasedSize = (portfolio.total_value * this.maxPortfolioRisk) / (targetPrice * volatility);

    const kellySize = (portfolio.total_value * kellyFraction) / targetPrice;

    const maxShares = (portfolio.total_value * this.maxPositionSize) / targetPrice;

    const recommendedShares = Math.min(
      riskBasedSize,
      kellySize * 0.5,
      maxShares
    );

    const riskScore = this.assessPositionRisk(
      recommendedShares * targetPrice / portfolio.total_value,
      volatility
    );

    return {
      recommendedSize: Math.max(0, Math.floor(recommendedShares)),
      maxSize: Math.floor(maxShares),
      riskScore
    };
  }

  private calculateKellyCriterion(winProbability: number, volatility: number): number {
    const winLossRatio = 1 / volatility;
    const kellyFraction = (winProbability * winLossRatio - (1 - winProbability)) / winLossRatio;

    return Math.max(0, Math.min(0.25, kellyFraction));
  }

  private assessPositionRisk(positionWeight: number, volatility: number): number {
    const sizeRisk = positionWeight / this.maxPositionSize;
    const volRisk = volatility / 0.3;

    const riskScore = (sizeRisk * 0.6 + volRisk * 0.4);

    return Math.min(1, riskScore);
  }

  shouldExecuteTrade(
    portfolio: Portfolio,
    _positions: Position[],
    proposedTradeValue: number,
    currentRiskMetrics: RiskMetrics
  ): { allowed: boolean; reason?: string } {
    if (currentRiskMetrics.portfolioRisk > 0.15) {
      return {
        allowed: false,
        reason: 'Portfolio risk too high'
      };
    }

    if (currentRiskMetrics.concentration > 0.5) {
      return {
        allowed: false,
        reason: 'Portfolio too concentrated'
      };
    }

    if (proposedTradeValue > portfolio.total_value * this.maxPositionSize) {
      return {
        allowed: false,
        reason: 'Trade size exceeds maximum position size'
      };
    }

    if (proposedTradeValue > portfolio.cash_balance) {
      return {
        allowed: false,
        reason: 'Insufficient cash balance'
      };
    }

    return { allowed: true };
  }

  calculateStopLoss(entryPrice: number, volatility: number, riskTolerance: 'conservative' | 'moderate' | 'aggressive'): number {
    const multipliers = {
      conservative: 1.5,
      moderate: 2.0,
      aggressive: 2.5
    };

    const stopDistance = entryPrice * volatility * multipliers[riskTolerance];
    return entryPrice - stopDistance;
  }

  calculateTakeProfit(entryPrice: number, stopLoss: number, riskRewardRatio: number = 2): number {
    const riskAmount = entryPrice - stopLoss;
    return entryPrice + (riskAmount * riskRewardRatio);
  }

  rebalancePortfolio(
    positions: Position[],
    targetAllocations: Map<string, number>
  ): Map<string, number> {
    const totalValue = positions.reduce((sum, pos) => {
      return sum + pos.quantity * pos.current_price;
    }, 0);

    const rebalancingTrades = new Map<string, number>();

    targetAllocations.forEach((targetWeight, symbol) => {
      const currentPosition = positions.find(p => p.symbol === symbol);
      const currentValue = currentPosition
        ? currentPosition.quantity * currentPosition.current_price
        : 0;

      const targetValue = totalValue * targetWeight;
      const difference = targetValue - currentValue;

      if (Math.abs(difference) > totalValue * 0.05) {
        const currentPrice = currentPosition?.current_price || 0;
        if (currentPrice > 0) {
          rebalancingTrades.set(symbol, difference / currentPrice);
        }
      }
    });

    return rebalancingTrades;
  }
}
