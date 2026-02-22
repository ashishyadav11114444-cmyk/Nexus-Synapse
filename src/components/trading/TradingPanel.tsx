import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface TradingPanelProps {
  onTrade: (symbol: string, side: 'buy' | 'sell', quantity: number) => void;
  availableBalance: number;
}

export function TradingPanel({ onTrade, availableBalance }: TradingPanelProps) {
  const [symbol, setSymbol] = useState('BTC');
  const [quantity, setQuantity] = useState('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (qty > 0) {
      onTrade(symbol, side, qty);
      setQuantity('');
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary-400" />
        Quick Trade
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="input"
            placeholder="BTC, ETH, etc."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Quantity
          </label>
          <input
            type="number"
            step="0.0001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input"
            placeholder="0.0"
            required
          />
        </div>

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setSide('buy')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              side === 'buy'
                ? 'bg-green-600 text-white shadow-lg shadow-green-900/50'
                : 'bg-dark-800 text-dark-400 border border-dark-700'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Buy
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setSide('sell')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              side === 'sell'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                : 'bg-dark-800 text-dark-400 border border-dark-700'
            }`}
          >
            <TrendingDown className="w-5 h-5" />
            Sell
          </motion.button>
        </div>

        <div className="p-3 bg-dark-900/50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-dark-400">Available Balance</span>
          <span className="font-semibold text-dark-200 flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {availableBalance.toLocaleString()}
          </span>
        </div>

        <button
          type="submit"
          className="w-full btn-primary py-3"
        >
          Execute Trade
        </button>
      </form>
    </div>
  );
}
