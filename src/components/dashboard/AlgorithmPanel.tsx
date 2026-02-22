import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Play, Pause, Plus, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { TradingAlgorithm } from '../../types';

export function AlgorithmPanel() {
  const { user } = useAuthStore();
  const [algorithms, setAlgorithms] = useState<TradingAlgorithm[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlgoName, setNewAlgoName] = useState('');
  const [newAlgoType, setNewAlgoType] = useState<'quantum_wave' | 'superposition' | 'entanglement' | 'hybrid'>('quantum_wave');

  useEffect(() => {
    loadAlgorithms();
  }, [user]);

  const loadAlgorithms = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('trading_algorithms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setAlgorithms(data);
  };

  const createAlgorithm = async () => {
    if (!user || !newAlgoName) return;

    const { error } = await supabase
      .from('trading_algorithms')
      .insert({
        user_id: user.id,
        name: newAlgoName,
        algorithm_type: newAlgoType,
        config: {
          lookback_period: 50,
          signal_threshold: 0.6,
          wave_frequencies: [1, 2, 3, 5, 8],
          risk_multiplier: 1.0
        },
        is_active: false,
        performance_score: 0
      });

    if (!error) {
      setNewAlgoName('');
      setShowCreate(false);
      loadAlgorithms();
    }
  };

  const toggleAlgorithm = async (id: string, currentState: boolean) => {
    await supabase
      .from('trading_algorithms')
      .update({ is_active: !currentState })
      .eq('id', id);

    loadAlgorithms();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold">Quantum Algorithms</h3>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Algorithm
        </button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-dark-900/50 rounded-lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Algorithm Name
              </label>
              <input
                type="text"
                value={newAlgoName}
                onChange={(e) => setNewAlgoName(e.target.value)}
                className="input"
                placeholder="My Quantum Strategy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Algorithm Type
              </label>
              <select
                value={newAlgoType}
                onChange={(e) => setNewAlgoType(e.target.value as any)}
                className="input"
              >
                <option value="quantum_wave">Quantum Wave</option>
                <option value="superposition">Superposition</option>
                <option value="entanglement">Entanglement</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={createAlgorithm} className="btn-primary flex-1">
                Create
              </button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {algorithms.length === 0 ? (
          <p className="text-dark-500 text-center py-8">
            No algorithms created yet. Create your first quantum trading algorithm!
          </p>
        ) : (
          algorithms.map((algo) => (
            <motion.div
              key={algo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-dark-900/50 rounded-lg hover:bg-dark-800/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-dark-50 mb-1">{algo.name}</h4>
                  <div className="flex items-center gap-3 text-sm text-dark-400">
                    <span className="capitalize">{algo.algorithm_type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>Score: {(algo.performance_score * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlgorithm(algo.id, algo.is_active)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      algo.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-dark-800 text-dark-400'
                    }`}
                  >
                    {algo.is_active ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  <button className="p-2 bg-dark-800 text-dark-400 rounded-lg hover:bg-dark-700 transition-all duration-200">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
