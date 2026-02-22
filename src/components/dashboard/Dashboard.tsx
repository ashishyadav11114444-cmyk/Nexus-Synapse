import { useEffect, useState } from 'react';
import { useTradingStore } from '../../store/tradingStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { MetricCard } from './MetricCard';
import { PortfolioChart } from './PortfolioChart';
import { PositionsList } from './PositionsList';
import { SignalsPanel } from './SignalsPanel';
import { TradingPanel } from '../trading/TradingPanel';
import { AlgorithmPanel } from './AlgorithmPanel';
import { Wallet, TrendingUp, Activity, Brain, LogOut } from 'lucide-react';

export function Dashboard() {
  const { user, signOut } = useAuthStore();
  const { positions, signals, setPortfolios, setPositions, setSignals, selectPortfolio, selectedPortfolio } = useTradingStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id);

      if (portfolioData && portfolioData.length > 0) {
        setPortfolios(portfolioData);
        selectPortfolio(portfolioData[0]);

        const { data: positionsData } = await supabase
          .from('positions')
          .select('*')
          .eq('portfolio_id', portfolioData[0].id);

        setPositions(positionsData || []);

        const { data: algorithmsData } = await supabase
          .from('trading_algorithms')
          .select('id')
          .eq('user_id', user.id);

        if (algorithmsData && algorithmsData.length > 0) {
          const { data: signalsData } = await supabase
            .from('quantum_signals')
            .select('*')
            .in('algorithm_id', algorithmsData.map(a => a.id))
            .order('created_at', { ascending: false })
            .limit(20);

          setSignals(signalsData || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async (symbol: string, side: 'buy' | 'sell', quantity: number) => {
    console.log('Trade executed:', { symbol, side, quantity });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Loading quantum systems...</p>
        </div>
      </div>
    );
  }

  const mockChartData = Array.from({ length: 30 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 100000 + Math.random() * 20000
  }));

  const totalValue = selectedPortfolio?.total_value || 0;
  const totalPnL = (selectedPortfolio?.realized_pnl || 0) + (selectedPortfolio?.unrealized_pnl || 0);
  const pnlPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-dark-950">
      <nav className="glass border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Nexus Synapse</h1>
              <p className="text-sm text-dark-400">Quantum Trading Platform</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Portfolio Value"
            value={`$${totalValue.toLocaleString()}`}
            change={pnlPercent}
            icon={Wallet}
            trend={pnlPercent >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Total P&L"
            value={`$${totalPnL.toLocaleString()}`}
            change={pnlPercent}
            icon={TrendingUp}
            trend={pnlPercent >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Active Positions"
            value={positions.length}
            icon={Activity}
          />
          <MetricCard
            title="Active Signals"
            value={signals.length}
            icon={Brain}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PortfolioChart data={mockChartData} />
          </div>
          <div>
            <TradingPanel
              onTrade={handleTrade}
              availableBalance={selectedPortfolio?.cash_balance || 0}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PositionsList positions={positions} />
          <SignalsPanel signals={signals} />
        </div>

        <AlgorithmPanel />
      </div>
    </div>
  );
}
