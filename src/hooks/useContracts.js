import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'ethers';
import addresses from '../contracts/addresses.json';
import MarketFactoryABI from '../contracts/MarketFactory.json';
import MarketABI from '../contracts/Market.json';
import MockERC20ABI from '../contracts/MockERC20.json';

export function useMarketFactory() {
  const { data: markets, isLoading, refetch } = useReadContract({
    address: addresses.MarketFactory,
    abi: MarketFactoryABI.abi,
    functionName: 'getAllMarkets',
  });

  const { writeContract, data: hash, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const createMarket = (question, duration) => {
    writeContract({
      address: addresses.MarketFactory,
      abi: MarketFactoryABI.abi,
      functionName: 'createMarket',
      args: [question, duration],
    });
  };

  const resolveMarket = (marketId, outcome) => {
    writeContract({
      address: addresses.MarketFactory,
      abi: MarketFactoryABI.abi,
      functionName: 'resolveMarket',
      args: [marketId, outcome],
    });
  };

  return {
    markets: markets || [],
    isLoading,
    refetch,
    createMarket,
    resolveMarket,
    isConfirming,
    isConfirmed,
    error
  };
}

export function useMarket(marketAddress) {
  const { data: marketSummary, isLoading, refetch } = useReadContract({
    address: marketAddress,
    abi: MarketABI.abi,
    functionName: 'getMarketSummary',
    enabled: !!marketAddress,
  });

  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const stake = (prediction, amount) => {
    const amountWei = parseUnits(amount.toString(), 6);
    writeContract({
      address: marketAddress,
      abi: MarketABI.abi,
      functionName: 'stake',
      args: [prediction, amountWei],
    });
  };

  const withdraw = () => {
    writeContract({
      address: marketAddress,
      abi: MarketABI.abi,
      functionName: 'withdraw',
    });
  };

  const getPosition = (userAddress) => {
    return useReadContract({
      address: marketAddress,
      abi: MarketABI.abi,
      functionName: 'getPosition',
      args: [userAddress],
      enabled: !!marketAddress && !!userAddress,
    });
  };

  const getWinnings = (userAddress) => {
    return useReadContract({
      address: marketAddress,
      abi: MarketABI.abi,
      functionName: 'calculateWinnings',
      args: [userAddress],
      enabled: !!marketAddress && !!userAddress,
    });
  };

  const getOdds = () => {
    return useReadContract({
      address: marketAddress,
      abi: MarketABI.abi,
      functionName: 'getOdds',
      enabled: !!marketAddress,
    });
  };

  return {
    marketSummary,
    isLoading,
    refetch,
    stake,
    withdraw,
    getPosition,
    getWinnings,
    getOdds,
    isConfirming,
    isConfirmed,
    error
  };
}

export function useUSDC() {
  const { data: balance, refetch } = useReadContract({
    address: addresses.USDC,
    abi: MockERC20ABI.abi,
    functionName: 'balanceOf',
    args: ['0x0000000000000000000000000000000000000000'], // Will be overridden
  });

  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const approve = (spender, amount) => {
    const amountWei = parseUnits(amount.toString(), 6);
    writeContract({
      address: addresses.USDC,
      abi: MockERC20ABI.abi,
      functionName: 'approve',
      args: [spender, amountWei],
    });
  };

  const faucet = () => {
    writeContract({
      address: addresses.USDC,
      abi: MockERC20ABI.abi,
      functionName: 'faucet',
    });
  };

  const getBalance = (userAddress) => {
    return useReadContract({
      address: addresses.USDC,
      abi: MockERC20ABI.abi,
      functionName: 'balanceOf',
      args: [userAddress],
      enabled: !!userAddress,
    });
  };

  const getAllowance = (owner, spender) => {
    return useReadContract({
      address: addresses.USDC,
      abi: MockERC20ABI.abi,
      functionName: 'allowance',
      args: [owner, spender],
      enabled: !!owner && !!spender,
    });
  };

  return {
    approve,
    faucet,
    getBalance,
    getAllowance,
    isConfirming,
    isConfirmed,
    error
  };
}