import { create } from 'zustand';
import { Portfolio, Position, Trade, TradingAlgorithm, QuantumSignal, MarketData } from '../types';

interface TradingState {
  portfolios: Portfolio[];
  positions: Position[];
  trades: Trade[];
  algorithms: TradingAlgorithm[];
  signals: QuantumSignal[];
  marketData: Map<string, MarketData>;
  selectedPortfolio: Portfolio | null;

  setPortfolios: (portfolios: Portfolio[]) => void;
  setPositions: (positions: Position[]) => void;
  setTrades: (trades: Trade[]) => void;
  setAlgorithms: (algorithms: TradingAlgorithm[]) => void;
  setSignals: (signals: QuantumSignal[]) => void;
  updateMarketData: (symbol: string, data: MarketData) => void;
  selectPortfolio: (portfolio: Portfolio) => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  portfolios: [],
  positions: [],
  trades: [],
  algorithms: [],
  signals: [],
  marketData: new Map(),
  selectedPortfolio: null,

  setPortfolios: (portfolios) => set({ portfolios }),
  setPositions: (positions) => set({ positions }),
  setTrades: (trades) => set({ trades }),
  setAlgorithms: (algorithms) => set({ algorithms }),
  setSignals: (signals) => set({ signals }),

  updateMarketData: (symbol, data) =>
    set((state) => {
      const newMarketData = new Map(state.marketData);
      newMarketData.set(symbol, data);
      return { marketData: newMarketData };
    }),

  selectPortfolio: (portfolio) => set({ selectedPortfolio: portfolio }),
}));
