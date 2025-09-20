import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Users, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { formatUnits } from 'ethers';

interface MarketCardProps {
  market: any;
  onClick: () => void;
}

export default function MarketCard({ market, onClick }: MarketCardProps) {
  const { isDark } = useTheme();
  
  const isExpired = Date.now() / 1000 > market.endTime;
  const timeLeft = Math.max(0, market.endTime - Date.now() / 1000);
  const totalStake = Number(formatUnits(market.totalStake || '0', 6));
  
  const formatTimeLeft = (seconds: number) => {
    if (seconds === 0) return 'Ended';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getStatusIcon = () => {
    if (market.resolved) {
      return market.outcome ? 
        <CheckCircle className="h-5 w-5 text-green-500" /> : 
        <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (isExpired) {
      return <Clock className="h-5 w-5 text-orange-500" />;
    }
    return <Clock className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />;
  };

  const getStatusText = () => {
    if (market.resolved) {
      return market.outcome ? 'Resolved: YES' : 'Resolved: NO';
    }
    if (isExpired) return 'Awaiting Resolution';
    return formatTimeLeft(timeLeft);
  };

  return (
    <motion.div
      className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
        isDark 
          ? 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600' 
          : 'bg-white/60 border border-gray-200/50 hover:bg-white/80 hover:border-gray-300'
      } hover:shadow-lg`}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`font-semibold text-lg leading-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {market.question}
            </h3>
          </div>
          <div className="ml-3">
            {getStatusIcon()}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Stake
              </span>
            </div>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${totalStake.toFixed(0)} USDC
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Creator
              </span>
            </div>
            <span className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {market.creator.slice(0, 6)}...{market.creator.slice(-4)}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-200/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Status
                </span>
              </div>
              <span className={`text-sm font-medium ${
                market.resolved 
                  ? (market.outcome ? 'text-green-500' : 'text-red-500')
                  : (isExpired ? 'text-orange-500' : (isDark ? 'text-blue-400' : 'text-blue-600'))
              }`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        <div className={`mt-4 py-2 px-3 rounded-lg text-center ${
          isDark ? 'bg-purple-900/30' : 'bg-purple-100/50'
        }`}>
          <span className={`text-sm font-medium ${
            isDark ? 'text-purple-200' : 'text-purple-700'
          }`}>
            Click to trade
          </span>
        </div>
      </div>
    </motion.div>
  );
}