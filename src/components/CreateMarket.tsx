import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, HelpCircle } from 'lucide-react';
import { useMarketFactory } from '../hooks/useContracts';
import { useTheme } from './ThemeProvider';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

export default function CreateMarket() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [duration, setDuration] = useState(24);
  const [durationUnit, setDurationUnit] = useState('hours');
  
  const { isDark } = useTheme();
  const { address } = useAccount();
  const { createMarket, isConfirming, isConfirmed, error } = useMarketFactory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const durationInSeconds = duration * (durationUnit === 'hours' ? 3600 : 86400);
    
    try {
      createMarket(question, durationInSeconds);
      toast.loading('Creating market...', { id: 'create-market' });
    } catch (err) {
      toast.error('Failed to create market');
    }
  };

  React.useEffect(() => {
    if (isConfirmed) {
      toast.success('Market created successfully!', { id: 'create-market' });
      setQuestion('');
      setDuration(24);
      setIsOpen(false);
    }
  }, [isConfirmed]);

  React.useEffect(() => {
    if (error) {
      toast.error(error.message || 'Transaction failed', { id: 'create-market' });
    }
  }, [error]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDark 
            ? 'border-purple-400/30 hover:border-purple-400/50 bg-purple-900/10 hover:bg-purple-900/20' 
            : 'border-purple-300/50 hover:border-purple-400/70 bg-purple-50/50 hover:bg-purple-50/80'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-center space-x-3">
          <Plus className={`h-6 w-6 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
          <span className={`text-lg font-medium ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
            Create New Market
          </span>
        </div>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`mt-4 p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/50 border border-gray-200/50'
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`flex items-center space-x-2 text-sm font-medium mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <HelpCircle className="h-4 w-4" />
                <span>Market Question</span>
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
                className={`w-full p-4 rounded-xl transition-all ${
                  isDark 
                    ? 'bg-gray-900/50 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' 
                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                required
              />
            </div>

            <div>
              <label className={`flex items-center space-x-2 text-sm font-medium mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <Clock className="h-4 w-4" />
                <span>Duration</span>
              </label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min="1"
                  max={durationUnit === 'hours' ? 8760 : 365}
                  className={`flex-1 p-4 rounded-xl transition-all ${
                    isDark 
                      ? 'bg-gray-900/50 border border-gray-600 text-white focus:border-purple-400' 
                      : 'bg-white border border-gray-300 text-gray-900 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  required
                />
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value)}
                  className={`p-4 rounded-xl transition-all ${
                    isDark 
                      ? 'bg-gray-900/50 border border-gray-600 text-white focus:border-purple-400' 
                      : 'bg-white border border-gray-300 text-gray-900 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <motion.button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isConfirming || !address}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isConfirming ? 'Creating...' : 'Create Market'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}