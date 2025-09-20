import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, DollarSign, Clock, User } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAccount } from 'wagmi';
import { useMarket, useUSDC } from '../hooks/useContracts';
import { formatUnits, parseUnits } from 'ethers';
import toast from 'react-hot-toast';
import StakeForm from './StakeForm';

interface MarketModalProps {
  market: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function MarketModal({ market, onClose, onUpdate }: MarketModalProps) {
  const { isDark } = useTheme();
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [prediction, setPrediction] = useState<boolean | null>(null);

  const { 
    marketSummary, 
    getPosition, 
    getWinnings, 
    getOdds,
    stake,
    withdraw,
    isConfirming,
    error 
  } = useMarket(market.marketAddress);
  
  const { getBalance, getAllowance, approve } = useUSDC();
  
  const { data: userBalance } = getBalance(address || '');
  const { data: allowance } = getAllowance(address || '', market.marketAddress);
  const { data: position } = getPosition(address || '');
  const { data: winnings } = getWinnings(address || '');
  const { data: odds } = getOdds();

  const balance = userBalance ? Number(formatUnits(userBalance, 6)) : 0;
  const currentAllowance = allowance ? Number(formatUnits(allowance, 6)) : 0;
  const userWinnings = winnings ? Number(formatUnits(winnings, 6)) : 0;
  const currentOdds = odds || 50;
  
  const isExpired = Date.now() / 1000 > market.endTime;
  const canStake = !isExpired && !market.resolved;
  const canWithdraw = market.resolved && userWinnings > 0;

  const handleStake = async () => {
    if (!address || prediction === null || !stakeAmount) return;
    
    const amount = parseFloat(stakeAmount);
    if (amount <= 0 || amount > balance) {
      toast.error('Invalid amount');
      return;
    }

    try {
      // Check if approval is needed
      if (currentAllowance < amount) {
        toast.loading('Approving USDC...', { id: 'approve' });
        await approve(market.marketAddress, amount);
        toast.success('USDC approved!', { id: 'approve' });
      }

      toast.loading('Placing stake...', { id: 'stake' });
      await stake(prediction, amount);
      toast.success('Stake placed successfully!', { id: 'stake' });
      setStakeAmount('');
      setPrediction(null);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Transaction failed', { id: 'stake' });
    }
  };

  const handleWithdraw = async () => {
    try {
      toast.loading('Withdrawing winnings...', { id: 'withdraw' });
      await withdraw();
      toast.success('Winnings withdrawn!', { id: 'withdraw' });
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Withdrawal failed', { id: 'withdraw' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {market.question}
              </h2>
              <div className="mt-2 flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <User className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {market.creator.slice(0, 6)}...{market.creator.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {isExpired ? 'Ended' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>

          {/* Market Stats */}
          <div className={`p-4 rounded-xl ${
            isDark ? 'bg-gray-900/50' : 'bg-gray-50'
          }`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {currentOdds}%
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  YES Probability
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${Number(formatUnits(market.totalStake || '0', 6)).toFixed(0)}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Volume
                </div>
              </div>
            </div>
          </div>

          {/* User Balance */}
          {address && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Your USDC Balance:
                </span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${balance.toFixed(2)}
                </span>
              </div>
              {userWinnings > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-green-500">Winnings Available:</span>
                  <span className="font-semibold text-green-500">
                    ${userWinnings.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Stake Form or Status */}
          {canStake && address ? (
            <StakeForm
              balance={balance}
              onStake={handleStake}
              stakeAmount={stakeAmount}
              setStakeAmount={setStakeAmount}
              prediction={prediction}
              setPrediction={setPrediction}
              isConfirming={isConfirming}
            />
          ) : canWithdraw ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl text-center ${
                isDark ? 'bg-green-900/20 border border-green-700/30' : 'bg-green-50 border border-green-200'
              }`}>
                <div className="text-green-500 font-semibold">
                  You won ${userWinnings.toFixed(2)} USDC!
                </div>
              </div>
              <motion.button
                onClick={handleWithdraw}
                disabled={isConfirming}
                className="w-full py-3 px-6 rounded-xl font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white transition-all disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isConfirming ? 'Withdrawing...' : 'Withdraw Winnings'}
              </motion.button>
            </div>
          ) : (
            <div className={`p-4 rounded-xl text-center ${
              isDark ? 'bg-gray-900/50' : 'bg-gray-50'
            }`}>
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {!address ? 'Connect wallet to participate' : 
                 market.resolved ? 'Market resolved' : 'Market ended'}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}