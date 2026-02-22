import { Trade, Position, Portfolio } from '../../types';

export interface OrderRequest {
  symbol: string;
  quantity: number;
  orderType: 'market' | 'limit';
  side: 'buy' | 'sell';
  limitPrice?: number;
}

export interface ExecutionResult {
  success: boolean;
  trade?: Partial<Trade>;
  error?: string;
}

export class TradingExecutionEngine {
  private slippageFactor: number;
  private feesRate: number;

  constructor(slippageFactor: number = 0.001, feesRate: number = 0.001) {
    this.slippageFactor = slippageFactor;
    this.feesRate = feesRate;
  }

  executeOrder(
    order: OrderRequest,
    currentPrice: number,
    portfolio: Portfolio,
    positions: Position[]
  ): ExecutionResult {
    const executionPrice = this.calculateExecutionPrice(
      currentPrice,
      order.side,
      order.orderType,
      order.limitPrice
    );

    if (order.orderType === 'limit' && !this.isLimitOrderFilled(executionPrice, order)) {
      return {
        success: false,
        error: 'Limit order not filled at current price'
      };
    }

    const totalValue = order.quantity * executionPrice;
    const fees = totalValue * this.feesRate;

    if (order.side === 'buy') {
      if (portfolio.cash_balance < totalValue + fees) {
        return {
          success: false,
          error: 'Insufficient cash balance'
        };
      }
    }

    const existingPosition = positions.find(p => p.symbol === order.symbol);

    const trade: Partial<Trade> = {
      symbol: order.symbol,
      trade_type: order.side,
      quantity: order.quantity,
      price: executionPrice,
      total_value: totalValue,
      fees,
      pnl: 0
    };

    if (order.side === 'sell' && existingPosition) {
      trade.pnl = this.calculatePnL(existingPosition, executionPrice, order.quantity);
    }

    return {
      success: true,
      trade
    };
  }

  private calculateExecutionPrice(
    currentPrice: number,
    side: 'buy' | 'sell',
    orderType: 'market' | 'limit',
    limitPrice?: number
  ): number {
    if (orderType === 'limit' && limitPrice) {
      return limitPrice;
    }

    const slippage = currentPrice * this.slippageFactor;
    return side === 'buy'
      ? currentPrice + slippage
      : currentPrice - slippage;
  }

  private isLimitOrderFilled(executionPrice: number, order: OrderRequest): boolean {
    if (!order.limitPrice) return false;

    if (order.side === 'buy') {
      return executionPrice <= order.limitPrice;
    } else {
      return executionPrice >= order.limitPrice;
    }
  }

  private calculatePnL(position: Position, exitPrice: number, quantity: number): number {
    const actualQuantity = Math.min(quantity, position.quantity);

    if (position.position_type === 'long') {
      return (exitPrice - position.entry_price) * actualQuantity;
    } else {
      return (position.entry_price - exitPrice) * actualQuantity;
    }
  }

  updatePosition(
    positions: Position[],
    trade: Trade
  ): Position[] {
    const updatedPositions = [...positions];
    const existingPositionIndex = updatedPositions.findIndex(p => p.symbol === trade.symbol);

    if (trade.trade_type === 'buy') {
      if (existingPositionIndex >= 0) {
        const existing = updatedPositions[existingPositionIndex];
        const totalQuantity = existing.quantity + trade.quantity;
        const avgPrice = (existing.entry_price * existing.quantity + trade.price * trade.quantity) / totalQuantity;

        updatedPositions[existingPositionIndex] = {
          ...existing,
          quantity: totalQuantity,
          entry_price: avgPrice,
          updated_at: new Date().toISOString()
        };
      } else {
        const newPosition: Position = {
          id: crypto.randomUUID(),
          portfolio_id: trade.portfolio_id,
          symbol: trade.symbol,
          quantity: trade.quantity,
          entry_price: trade.price,
          current_price: trade.price,
          unrealized_pnl: 0,
          position_type: 'long',
          opened_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        updatedPositions.push(newPosition);
      }
    } else if (trade.trade_type === 'sell' && existingPositionIndex >= 0) {
      const existing = updatedPositions[existingPositionIndex];
      const remainingQuantity = existing.quantity - trade.quantity;

      if (remainingQuantity <= 0) {
        updatedPositions.splice(existingPositionIndex, 1);
      } else {
        updatedPositions[existingPositionIndex] = {
          ...existing,
          quantity: remainingQuantity,
          updated_at: new Date().toISOString()
        };
      }
    }

    return updatedPositions;
  }

  calculatePortfolioValue(portfolio: Portfolio, positions: Position[]): number {
    const positionsValue = positions.reduce((total, position) => {
      return total + position.quantity * position.current_price;
    }, 0);

    return portfolio.cash_balance + positionsValue;
  }

  updatePortfolio(
    portfolio: Portfolio,
    trade: Trade,
    positions: Position[]
  ): Portfolio {
    let newCashBalance = portfolio.cash_balance;
    let newRealizedPnL = portfolio.realized_pnl;

    if (trade.trade_type === 'buy') {
      newCashBalance -= trade.total_value + trade.fees;
    } else {
      newCashBalance += trade.total_value - trade.fees;
      newRealizedPnL += trade.pnl;
    }

    const newTotalValue = this.calculatePortfolioValue(
      { ...portfolio, cash_balance: newCashBalance },
      positions
    );

    const unrealizedPnL = positions.reduce((total, position) => {
      return total + position.unrealized_pnl;
    }, 0);

    return {
      ...portfolio,
      cash_balance: newCashBalance,
      total_value: newTotalValue,
      realized_pnl: newRealizedPnL,
      unrealized_pnl: unrealizedPnL,
      updated_at: new Date().toISOString()
    };
  }
}
