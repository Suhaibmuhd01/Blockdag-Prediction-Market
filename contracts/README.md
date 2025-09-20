# Prediction Market Smart Contracts

## Overview
This directory contains the smart contracts for the PredictMarket dApp - a decentralized prediction market platform.

## Contracts
- **MarketFactory.sol**: Factory contract for creating and managing prediction markets
- **Market.sol**: Individual market contract handling staking, resolution, and withdrawals
- **MockERC20.sol**: Mock USDC token for testing

## Security Features
- OpenZeppelin ReentrancyGuard and Ownable
- SafeERC20 for secure token transfers
- Access controls for market resolution
- Input validation and bounds checking

## Setup

### Prerequisites
- Node.js v18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in your environment variables:
   - SEPOLIA_RPC_URL: Your Sepolia RPC endpoint
   - PRIVATE_KEY: Your deployer private key
   - ETHERSCAN_API_KEY: For contract verification

## Testing
Run the complete test suite:
```bash
npm run test
```

Expected output shows all tests passing with gas usage reports.

## Deployment

### Local Development
1. Start local Hardhat node:
```bash
npm run node
```

2. Deploy contracts:
```bash
npm run deploy:local
```

### Sepolia Testnet
```bash
npm run deploy:sepolia
```

## Demo Script
Run the demo to test contract functionality:
```bash
node scripts/demo.js
```

## Security Checklist
✅ ReentrancyGuard on all state-changing functions
✅ SafeERC20 for token transfers
✅ Access controls for resolution (creator or owner only)
✅ Input validation (duration bounds, non-empty questions)
✅ Proper event emissions for transparency
✅ No direct ETH handling (ERC20 only)

## Known Limitations
- Manual market resolution (production should use Chainlink oracles)
- No dispute mechanism
- Simple binary outcomes only
- Creator resolution privilege (could be improved with DAO governance)

## Gas Optimization
- Efficient storage layout
- Batch operations where possible
- Optimized loops and state access