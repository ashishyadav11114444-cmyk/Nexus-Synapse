import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ title, value, change, icon: Icon, trend = 'neutral' }: MetricCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-dark-400'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card quantum-glow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-dark-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-dark-50 mb-2">{value}</h3>
          {change !== undefined && (
            <p className={`text-sm font-medium ${trendColors[trend]}`}>
              {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-500/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary-400" />
        </div>
      </div>
    </motion.div>
  );
}
