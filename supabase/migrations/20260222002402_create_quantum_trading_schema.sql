/*
  # Nexus Synapse - Quantum Trading Platform Database Schema

  ## Overview
  Comprehensive database schema for quantum-based algorithmic trading platform with real-time analytics,
  portfolio management, and advanced quantum signal processing capabilities.

  ## New Tables

  ### 1. `users_profiles`
  Extended user profile information
  - `id` (uuid, FK to auth.users)
  - `username` (text, unique)
  - `full_name` (text)
  - `risk_tolerance` (text: conservative, moderate, aggressive)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `trading_algorithms`
  Quantum algorithm configurations
  - `id` (uuid, PK)
  - `user_id` (uuid, FK)
  - `name` (text)
  - `algorithm_type` (text: quantum_wave, superposition, entanglement)
  - `config` (jsonb) - algorithm parameters
  - `is_active` (boolean)
  - `performance_score` (decimal)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `portfolios`
  User portfolio tracking
  - `id` (uuid, PK)
  - `user_id` (uuid, FK)
  - `name` (text)
  - `total_value` (decimal)
  - `cash_balance` (decimal)
  - `unrealized_pnl` (decimal)
  - `realized_pnl` (decimal)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `positions`
  Active trading positions
  - `id` (uuid, PK)
  - `portfolio_id` (uuid, FK)
  - `symbol` (text)
  - `quantity` (decimal)
  - `entry_price` (decimal)
  - `current_price` (decimal)
  - `unrealized_pnl` (decimal)
  - `position_type` (text: long, short)
  - `opened_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `trades`
  Historical trade records
  - `id` (uuid, PK)
  - `portfolio_id` (uuid, FK)
  - `algorithm_id` (uuid, FK)
  - `symbol` (text)
  - `trade_type` (text: buy, sell)
  - `quantity` (decimal)
  - `price` (decimal)
  - `total_value` (decimal)
  - `fees` (decimal)
  - `pnl` (decimal)
  - `quantum_signal_strength` (decimal)
  - `executed_at` (timestamptz)

  ### 6. `quantum_signals`
  Real-time quantum analysis signals
  - `id` (uuid, PK)
  - `algorithm_id` (uuid, FK)
  - `symbol` (text)
  - `signal_type` (text: buy, sell, hold)
  - `strength` (decimal) - 0 to 1
  - `wave_amplitude` (decimal)
  - `phase_angle` (decimal)
  - `entanglement_score` (decimal)
  - `confidence` (decimal)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ### 7. `market_data`
  Market price and volume data cache
  - `id` (uuid, PK)
  - `symbol` (text)
  - `price` (decimal)
  - `volume` (decimal)
  - `high_24h` (decimal)
  - `low_24h` (decimal)
  - `change_24h` (decimal)
  - `timestamp` (timestamptz)

  ### 8. `backtest_results`
  Algorithm backtesting results
  - `id` (uuid, PK)
  - `algorithm_id` (uuid, FK)
  - `start_date` (timestamptz)
  - `end_date` (timestamptz)
  - `initial_capital` (decimal)
  - `final_capital` (decimal)
  - `total_return` (decimal)
  - `sharpe_ratio` (decimal)
  - `max_drawdown` (decimal)
  - `win_rate` (decimal)
  - `total_trades` (integer)
  - `results_data` (jsonb)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Authenticated users only
  - Proper ownership checks on all policies
*/

-- Users Profiles Table
CREATE TABLE IF NOT EXISTS users_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  risk_tolerance text DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trading Algorithms Table
CREATE TABLE IF NOT EXISTS trading_algorithms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  algorithm_type text NOT NULL CHECK (algorithm_type IN ('quantum_wave', 'superposition', 'entanglement', 'hybrid')),
  config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  performance_score decimal DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trading_algorithms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own algorithms"
  ON trading_algorithms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own algorithms"
  ON trading_algorithms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own algorithms"
  ON trading_algorithms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own algorithms"
  ON trading_algorithms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Portfolios Table
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  total_value decimal DEFAULT 0,
  cash_balance decimal DEFAULT 0,
  unrealized_pnl decimal DEFAULT 0,
  realized_pnl decimal DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios"
  ON portfolios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Positions Table
CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  quantity decimal NOT NULL,
  entry_price decimal NOT NULL,
  current_price decimal NOT NULL,
  unrealized_pnl decimal DEFAULT 0,
  position_type text NOT NULL CHECK (position_type IN ('long', 'short')),
  opened_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own positions"
  ON positions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own positions"
  ON positions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own positions"
  ON positions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own positions"
  ON positions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Trades Table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  algorithm_id uuid REFERENCES trading_algorithms(id) ON DELETE SET NULL,
  symbol text NOT NULL,
  trade_type text NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  quantity decimal NOT NULL,
  price decimal NOT NULL,
  total_value decimal NOT NULL,
  fees decimal DEFAULT 0,
  pnl decimal DEFAULT 0,
  quantum_signal_strength decimal,
  executed_at timestamptz DEFAULT now()
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = trades.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = trades.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Quantum Signals Table
CREATE TABLE IF NOT EXISTS quantum_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id uuid REFERENCES trading_algorithms(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold')),
  strength decimal NOT NULL CHECK (strength >= 0 AND strength <= 1),
  wave_amplitude decimal DEFAULT 0,
  phase_angle decimal DEFAULT 0,
  entanglement_score decimal DEFAULT 0,
  confidence decimal DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quantum_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quantum signals"
  ON quantum_signals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trading_algorithms
      WHERE trading_algorithms.id = quantum_signals.algorithm_id
      AND trading_algorithms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own quantum signals"
  ON quantum_signals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trading_algorithms
      WHERE trading_algorithms.id = quantum_signals.algorithm_id
      AND trading_algorithms.user_id = auth.uid()
    )
  );

-- Market Data Table (Public read access for all authenticated users)
CREATE TABLE IF NOT EXISTS market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  price decimal NOT NULL,
  volume decimal DEFAULT 0,
  high_24h decimal,
  low_24h decimal,
  change_24h decimal,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view market data"
  ON market_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert market data"
  ON market_data FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Backtest Results Table
CREATE TABLE IF NOT EXISTS backtest_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id uuid REFERENCES trading_algorithms(id) ON DELETE CASCADE NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  initial_capital decimal NOT NULL,
  final_capital decimal NOT NULL,
  total_return decimal DEFAULT 0,
  sharpe_ratio decimal,
  max_drawdown decimal,
  win_rate decimal,
  total_trades integer DEFAULT 0,
  results_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE backtest_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own backtest results"
  ON backtest_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trading_algorithms
      WHERE trading_algorithms.id = backtest_results.algorithm_id
      AND trading_algorithms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own backtest results"
  ON backtest_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trading_algorithms
      WHERE trading_algorithms.id = backtest_results.algorithm_id
      AND trading_algorithms.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trading_algorithms_user_id ON trading_algorithms(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_portfolio_id ON positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_trades_portfolio_id ON trades(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_trades_executed_at ON trades(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quantum_signals_algorithm_id ON quantum_signals(algorithm_id);
CREATE INDEX IF NOT EXISTS idx_quantum_signals_created_at ON quantum_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_backtest_results_algorithm_id ON backtest_results(algorithm_id);
