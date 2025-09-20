import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface StakeFormProps {
  balance: number;
  onStake: () => void;
  stakeAmount: string;
  setStakeAmount: (amount: string) => void;
  prediction: boolean | null;
  setPrediction: (prediction: boolean) => void;
  isConfirming: boolean;
}

export default function StakeForm({
  balance,
  onStake,
  stakeAmount,
  setStakeAmount,
  prediction,
  setPrediction,
  isConfirming
}: StakeFormProps) {
  const { isDark } = useTheme();

  const quickAmounts = [10, 50, 100, balance / 2];

  return (
    <div className="space-y-6">
      {/* Prediction Selection */}
      <div>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Choose Your Prediction
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            onClick={() => setPrediction(true)}
            className={`p-4 rounded-xl border-2 transition-all ${
              prediction === true
                ? 'border-green-500 bg-green-500/10'
                : isDark
                ? 'border-gray-600 hover:border-green-400 bg-gray-800/50'
                : 'border-gray-300 hover:border-green-500 bg-white/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center space-x-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <span className={`font-semibold ${
                prediction === true ? 'text-green-500' : (isDark ? 'text-gray-300' : 'text-gray-600')
              }`}>
                YES
              </span>
            </div>
          </motion.button>
          
          <motion.button
            onClick={() => setPrediction(false)}
            className={`p-4 rounded-xl border-2 transition-all ${
              prediction === false
                ? 'border-red-500 bg-red-500/10'
                : isDark
                ? 'border-gray-600 hover:border-red-400 bg-gray-800/50'
                : 'border-gray-300 hover:border-red-500 bg-white/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center space-x-3">
              <TrendingDown className="h-6 w-6 text-red-500" />
              <span className={`font-semibold ${
                prediction === false ? 'text-red-500' : (isDark ? 'text-gray-300' : 'text-gray-600')
              }`}>
                NO
              </span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Stake Amount (USDC)
        </h3>
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          max={balance}
          step="0.01"
          className={`w-full p-4 rounded-xl text-xl font-semibold transition-all ${
            isDark 
              ? 'bg-gray-900/50 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' 
              : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
          } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
        />

        {/* Quick Amount Buttons */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {quickAmounts.map((amount) => (
            <motion.button
              key={amount}
              onClick={() => setStakeAmount(Math.min(amount, balance).toFixed(2))}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ${amount === balance / 2 ? (balance / 2).toFixed(0) : amount}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        onClick={onStake}
        disabled={!prediction || !stakeAmount || parseFloat(stakeAmount) <= 0 || isConfirming}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          prediction === true
            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500'
            : prediction === false
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400'
        } text-white`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isConfirming ? 'Processing...' : 
         prediction === null ? 'Select Prediction' :
         `Stake $${stakeAmount || '0'} on ${prediction ? 'YES' : 'NO'}`}
      </motion.button>
    </div>
  );
}