import { Position } from '../../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PositionsListProps {
  positions: Position[];
}

export function PositionsList({ positions }: PositionsListProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Active Positions</h3>
      <div className="space-y-3">
        {positions.length === 0 ? (
          <p className="text-dark-500 text-center py-8">No active positions</p>
        ) : (
          positions.map((position) => {
            const pnlPercent = ((position.current_price - position.entry_price) / position.entry_price) * 100;
            const isProfit = position.unrealized_pnl >= 0;

            return (
              <div
                key={position.id}
                className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg hover:bg-dark-800/50 transition-all duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-dark-50">{position.symbol}</h4>
                    <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded">
                      {position.position_type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-dark-400">
                    {position.quantity.toFixed(4)} @ ${position.entry_price.toFixed(2)}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    {isProfit ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                      ${Math.abs(position.unrealized_pnl).toFixed(2)}
                    </span>
                  </div>
                  <p className={`text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
