import { QuantumSignal } from '../../types';
import { ArrowUp, ArrowDown, Minus, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface SignalsPanelProps {
  signals: QuantumSignal[];
}

export function SignalsPanel({ signals }: SignalsPanelProps) {
  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowUp className="w-5 h-5 text-green-400" />;
      case 'sell':
        return <ArrowDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-dark-400" />;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'border-green-500/50 bg-green-500/5';
      case 'sell':
        return 'border-red-500/50 bg-red-500/5';
      default:
        return 'border-dark-700 bg-dark-900/30';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary-400" />
        <h3 className="text-lg font-semibold">Quantum Signals</h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {signals.length === 0 ? (
          <p className="text-dark-500 text-center py-8">No signals generated</p>
        ) : (
          signals.slice(0, 10).map((signal, index) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 border rounded-lg ${getSignalColor(signal.signal_type)} transition-all duration-200`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSignalIcon(signal.signal_type)}
                  <div>
                    <h4 className="font-semibold text-dark-50">{signal.symbol}</h4>
                    <p className="text-xs text-dark-400 uppercase">{signal.signal_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-dark-300">
                    Strength: {(signal.strength * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-dark-500">
                    Confidence: {(signal.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-dark-800">
                <div>
                  <p className="text-xs text-dark-500">Wave Amp.</p>
                  <p className="text-sm font-medium text-dark-300">
                    {signal.wave_amplitude.toFixed(3)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-500">Phase</p>
                  <p className="text-sm font-medium text-dark-300">
                    {(signal.phase_angle * 180 / Math.PI).toFixed(1)}°
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-500">Entangle.</p>
                  <p className="text-sm font-medium text-dark-300">
                    {(signal.entanglement_score * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
