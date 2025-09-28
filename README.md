# YieldCraft AI 🤖💰

**Cross-Chain DeFi Yield Aggregator/Optimizer powered by AI Agents **

*Built for EthGlobal Delhi 2025 Hackathon*

---

## 🚀 Overview

YieldCraft AI is an intelligent cross-chain DeFi yield optimization platform that leverages AI agents to automatically discover, analyze, and execute the best yield strategies across Hedera and Rootstock networks. Our AI agent continuously monitors market conditions, calculates real-time APY, and automatically swaps and lends user assets to the highest-yielding protocols.

## 🎯 Problem Statement

### The Challenge: Navigating Crypto Yields is Complex

- **Crypto Yield Volatility**: Makes it difficult for even experienced investors to find the best opportunities
- **Constantly Emerging Opportunities**: Requires continuous monitoring and research across multiple protocols
- **Risk Understanding**: Complex risks like impermanent loss in liquidity provision
- **Personalization Needed**: Each investor has unique risk tolerance and investment goals  
- **DeFi Complexity**: Decentralized nature makes fair comparison and evaluation challenging

### The Gap
Traditional yield farming requires:
- Manual monitoring of multiple protocols
- Complex risk assessment calculations
- Time-consuming research and analysis
- Deep technical knowledge of DeFi mechanics
- Constant portfolio rebalancing

## 💡 Our Solution

YieldCraft AI transforms yield optimization through:

### 🤖 Intelligent AI Agent
- **Automated Analysis**: Continuous monitoring of SaucerSwap, Bonzo Finance, AutoSwapLimit (Hedera) and SushiSwap (Rootstock)
- **Personalized Recommendations**: Suggestions based on user's risk profile and objectives
- **Conversational Interface**: Natural interaction via WebSocket for real-time queries
- **Real-time Decision Making**: AI analyzes market volume, TVL, and liquidity to calculate optimal APY

### 🔗 Cross-Chain Infrastructure
- **LayerZero Integration**: Seamless cross-chain token bridging between Hedera and Rootstock
- **Chain Agnostic**: Protocol works across multiple blockchain networks
- **Automated Asset Management**: Smart routing of assets to highest-yielding opportunities

### 📊 Advanced Analytics
- **Market Data Analysis**: Real-time processing of volume, TVL, and liquidity metrics
- **Risk Assessment**: Intelligent evaluation of protocol risks and opportunities
- **Performance Tracking**: Continuous monitoring and reporting of portfolio performance

## 🛠 Technology Stack

### Frontend & Integration
- **JavaScript/TypeScript**: Frontend integration and Web3 connectivity
- **WebSocket**: Real-time communication with AI agent
- **Web3.js/Ethers.js**: Blockchain interaction libraries

### AI & Agent Infrastructure
- **Hedera Agent Kit**: Core AI agent framework
- **Model Context Protocol (MCP)**: Agent communication protocol
- **LLM Engine**: Natural language processing for conversational interface

### Blockchain Networks
- **Hedera Hashgraph**: Primary network for yield optimization
- **Rootstock**: Bitcoin-based smart contract platform
- **LayerZero**: Cross-chain bridge protocol

### Smart Contract Development
- **Solidity**: Smart contract development language
- **Anchor Framework**: Development framework (where applicable)
- **Move Language**: Smart contract programming (future expansion)

### DeFi Protocols
- **SaucerSwap**: Hedera DEX integration
- **Bonzo Finance**: Hedera lending protocol
- **SushiSwap**: Rootstock DEX integration
- **AutoSwapLimit**: Hedera automated trading

## 🏗 Architecture Flow

### 1. User Interaction Layer
```
User Interface → WebSocket Client → AI Agent
```

### 2. AI Decision Engine
```
Market Data Ingestion → Analysis → Strategy Generation → Execution Commands
```

### 3. Cross-Chain Execution
```
Strategy Decision → LayerZero Bridge → Multi-Chain Deployment
```

### 4. Automated Management
```
6-Hour Rebalancing Cycle → Position Optimization → Reward Harvesting
```

## 📈 Vault Strategy (SushiSwap Integration)

### Deposits & Withdrawals
- **Deposit Process**: Users deposit assets (WRBTC, RUSDT, RIF) and receive vault shares
- **Withdrawal Process**: Users redeem shares for proportional asset amounts
- **Share-based System**: Transparent representation of user's vault portion

### Dynamic Liquidity Rebalancing
- **6-Hour Cycles**: Automated rebalancing every 6 hours via `moveticks` function
- **Automated Positioning**: Smart contract identifies optimal price ranges
- **Impermanent Loss Management**: Single-sided positions as limit orders

### Automated Rewards Management
- **Fee Collection**: Automatic claiming of accrued fees from liquidity ranges
- **Compound Reinvestment**: Fees redeposited into main and alternate positions
- **Continuous Growth**: Ensures ongoing compound interest generation



## 🚀 Deployed Contracts

### Rootstock Network
**Vault Contract**: `0xe83dcC76a4017DAb56a2E9BE93fbFDD0F86730Ba`
- **Explorer**: [View on Rootstock Testnet](https://rootstock-testnet.blockscout.com/address/0xe83dcC76a4017DAb56a2E9BE93fbFDD0F86730Ba)
- **Function**: Main vault contract managing SushiSwap liquidity strategies

### Hedera Network  
**AutoSwapLimitSafe**: `0x5823a1300b8591edf830226f0aea7a6a660933c2`
- **Explorer**: [View on HashScan](https://hashscan.io/testnet/contract/0x5823A1300b8591eDF830226F0aEa7a6A660933C2)
- **Function**: Automated swap and limit order management

## 🔄 How It Works

### Step 1: Market Analysis
The AI agent continuously monitors:
- Real-time APY calculations across protocols
- TVL (Total Value Locked) metrics
- Market volume and liquidity depth
- Risk factors and protocol health

### Step 2: Strategy Generation
Based on analysis, the AI:
- Identifies optimal yield opportunities
- Calculates risk-adjusted returns
- Generates personalized recommendations
- Plans cross-chain asset allocation

### Step 3: Automated Execution
The system:
- Routes assets through LayerZero bridge
- Deploys capital to selected protocols
- Manages liquidity positions dynamically
- Harvests and compounds rewards

### Step 4: Continuous Optimization
- 6-hour rebalancing cycles
- Real-time performance monitoring
- Automated risk management
- User notifications and reporting

## 🎯 Key Features

### For Users
- **Zero Manual Monitoring**: AI handles all optimization decisions
- **Cross-Chain Access**: Single interface for multi-chain opportunities  
- **Risk Management**: Intelligent risk assessment and mitigation
- **Transparent Reporting**: Real-time portfolio performance updates

### For DeFi Ecosystem
- **Liquidity Provision**: Enhanced liquidity across integrated protocols
- **Yield Optimization**: More efficient capital allocation
- **Cross-Chain Bridging**: Increased interoperability between networks

## 🔮 Future Roadmap

### Phase 1 (Current)
- ✅ Hedera and Rootstock integration
- ✅ Basic AI yield optimization
- ✅ Cross-chain bridging via LayerZero

### Phase 2 (Next Quarter)
- 🔄 Additional chain integrations
- 🔄 Advanced risk modeling
- 🔄 Social trading features


## 🛡 Security Features

- **Smart Contract Auditing**: Comprehensive security reviews
- **Risk Management**: Multi-layered risk assessment protocols
- **Emergency Stops**: Circuit breakers for unusual market conditions
- **Decentralized Architecture**: No single point of failure

## 📊 Performance Metrics

- **Current Yield Range**: 15-25% APR across supported protocols
- **Rebalancing Frequency**: Every 6 hours
- **Cross-Chain Bridge Time**: 2-10 minutes average
- **Gas Optimization**: Up to 40% savings through intelligent routing

## 🤝 Contributing

We welcome contributions from the community! Please see our contributing guidelines for more information.

## 📜 License

This project is licensed under the MIT License .



