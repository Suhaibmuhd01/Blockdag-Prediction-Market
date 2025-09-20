import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Sun, Moon, TrendingUp } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

export default function Header() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.header 
      className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${
            isDark ? 'bg-purple-900/50' : 'bg-purple-100'
          }`}>
            <TrendingUp className={`h-6 w-6 ${
              isDark ? 'text-purple-300' : 'text-purple-600'
            }`} />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              PredictMarket
            </h1>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Decentralized Prediction Markets
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.button>
          
          <ConnectButton 
            showBalance={false}
            chainStatus="icon"
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
          />
        </div>
      </div>
    </motion.header>
  );
}