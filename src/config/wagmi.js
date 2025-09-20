import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, sepolia } from 'wagmi/chains';

const projectId = 'prediction-market-dapp';

// Define custom hardhat chain for local development
const hardhatLocal = {
  ...hardhat,
  rpcUrls: {
    default: { 
      http: ['http://127.0.0.1:8545'],
      webSocket: ['ws://127.0.0.1:8545']
    },
    public: { 
      http: ['http://127.0.0.1:8545'],
      webSocket: ['ws://127.0.0.1:8545']
    },
  },
};

export const config = getDefaultConfig({
  appName: 'Prediction Market dApp',
  projectId,
  chains: [hardhatLocal, sepolia],
  ssr: false,
});

export const SUPPORTED_CHAINS = {
  1337: 'localhost',
  11155111: 'sepolia'
};