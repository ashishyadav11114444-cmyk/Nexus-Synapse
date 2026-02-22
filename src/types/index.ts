export interface QuantumSignal {
  id: string;
  algorithm_id: string;
  symbol: string;
  signal_type: 'buy' | 'sell' | 'hold';
  strength: number;
  wave_amplitude: number;
  phase_angle: number;
  entanglement_score: number;
  confidence: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TradingAlgorithm {
  id: string;
  user_id: string;
  name: string;
  algorithm_type: 'quantum_wave' | 'superposition' | 'entanglement' | 'hybrid';
  config: AlgorithmConfig;
  is_active: boolean;
  performance_score: number;
  created_at: string;
  updated_at: string;
}

export interface AlgorithmConfig {
  lookback_period?: number;
  signal_threshold?: number;
  wave_frequencies?: number[];
  entanglement_pairs?: string[];
  risk_multiplier?: number;
  max_position_size?: number;
  [key: string]: unknown;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  total_value: number;
  cash_balance: number;
  unrealized_pnl: number;
  realized_pnl: number;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  portfolio_id: string;
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  position_type: 'long' | 'short';
  opened_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  portfolio_id: string;
  algorithm_id?: string;
  symbol: string;
  trade_type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total_value: number;
  fees: number;
  pnl: number;
  quantum_signal_strength?: number;
  executed_at: string;
}

export interface MarketData {
  id: string;
  symbol: string;
  price: number;
  volume: number;
  high_24h: number;
  low_24h: number;
  change_24h: number;
  timestamp: string;
}

export interface BacktestResult {
  id: string;
  algorithm_id: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_capital: number;
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  results_data: Record<string, unknown>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  created_at: string;
  updated_at: string;
}

export interface QuantumWaveState {
  amplitude: number;
  phase: number;
  frequency: number;
  coherence: number;
}

export interface SuperpositionState {
  states: number[];
  probabilities: number[];
  entropy: number;
}

export interface EntanglementPair {
  symbol1: string;
  symbol2: string;
  correlation: number;
  coherence: number;
}
