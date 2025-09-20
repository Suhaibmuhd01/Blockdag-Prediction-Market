import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Users, Filter } from 'lucide-react';
import { useMarketFactory } from '../hooks/useContracts';
import { useTheme } from './ThemeProvider';
import MarketCard from './MarketCard';
import MarketModal from './MarketModal';

export default function MarketList() {
  const { isDark } = useTheme();
  const { markets, isLoading, refetch } = useMarketFactory();
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, resolved

  React.useEffect(() => {
    const interval = setInterval(refetch, 10000); // Refetch every 10 seconds
    return () => clearInterval(interval);
  }, [refetch]);

  const filteredMarkets = markets.filter(market => {
    if (filter === 'active') return !market.resolved && Date.now() / 1000 < market.endTime;
    if (filter === 'resolved') return market.resolved;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          isDark ? 'border-purple-400' : 'border-purple-600'
        }`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className={`h-6 w-6 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Active Markets
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isDark ? 'bg-purple-900/50 text-purple-200' : 'bg-purple-100 text-purple-700'
          }`}>
            {filteredMarkets.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              isDark 
                ? 'bg-gray-800 border border-gray-600 text-white focus:border-purple-400' 
                : 'bg-white border border-gray-300 text-gray-900 focus:border-purple-500'
            } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
          >
            <option value="all">All Markets</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {filteredMarkets.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No markets found</p>
          <p className="text-sm">Create the first prediction market!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MarketCard
                market={market}
                onClick={() => setSelectedMarket(market)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {selectedMarket && (
        <MarketModal
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
          onUpdate={refetch}
        />
      )}
    </div>
  );
}