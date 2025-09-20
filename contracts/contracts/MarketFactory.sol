// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Market.sol";

/**
 * @title MarketFactory
 * @dev Factory contract to create and manage prediction markets
 */
contract MarketFactory is Ownable, ReentrancyGuard {
    IERC20 public immutable stakingToken;
    
    struct MarketInfo {
        address marketAddress;
        string question;
        uint256 endTime;
        address creator;
        bool resolved;
        uint256 totalStake;
    }
    
    mapping(uint256 => MarketInfo) public markets;
    uint256 public marketCount;
    uint256 public constant MINIMUM_DURATION = 1 hours;
    uint256 public constant MAXIMUM_DURATION = 365 days;
    
    event MarketCreated(
        uint256 indexed marketId,
        address indexed marketAddress,
        string question,
        uint256 endTime,
        address indexed creator
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        address indexed marketAddress,
        bool outcome
    );
    
    constructor(address _stakingToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid token address");
        stakingToken = IERC20(_stakingToken);
    }
    
    /**
     * @dev Create a new prediction market
     * @param question The market question
     * @param duration Duration in seconds from now
     */
    function createMarket(
        string calldata question,
        uint256 duration
    ) external nonReentrant returns (uint256 marketId) {
        require(bytes(question).length > 0, "Empty question");
        require(
            duration >= MINIMUM_DURATION && duration <= MAXIMUM_DURATION,
            "Invalid duration"
        );
        
        marketId = marketCount++;
        uint256 endTime = block.timestamp + duration;
        
        Market market = new Market(
            address(stakingToken),
            question,
            endTime,
            msg.sender,
            address(this)
        );
        
        markets[marketId] = MarketInfo({
            marketAddress: address(market),
            question: question,
            endTime: endTime,
            creator: msg.sender,
            resolved: false,
            totalStake: 0
        });
        
        emit MarketCreated(marketId, address(market), question, endTime, msg.sender);
    }
    
    /**
     * @dev Resolve a market (only market creator or owner)
     * @param marketId The market ID to resolve
     * @param outcome The outcome (true for Yes, false for No)
     */
    function resolveMarket(uint256 marketId, bool outcome) external nonReentrant {
        require(marketId < marketCount, "Market does not exist");
        MarketInfo storage marketInfo = markets[marketId];
        require(!marketInfo.resolved, "Market already resolved");
        require(
            msg.sender == marketInfo.creator || msg.sender == owner(),
            "Only creator or owner can resolve"
        );
        
        Market market = Market(marketInfo.marketAddress);
        require(block.timestamp >= marketInfo.endTime, "Market not ended");
        
        market.resolve(outcome);
        marketInfo.resolved = true;
        
        emit MarketResolved(marketId, marketInfo.marketAddress, outcome);
    }
    
    /**
     * @dev Get market information
     * @param marketId The market ID
     */
    function getMarket(uint256 marketId) external view returns (MarketInfo memory) {
        require(marketId < marketCount, "Market does not exist");
        return markets[marketId];
    }
    
    /**
     * @dev Get all markets (for frontend)
     */
    function getAllMarkets() external view returns (MarketInfo[] memory) {
        MarketInfo[] memory allMarkets = new MarketInfo[](marketCount);
        for (uint256 i = 0; i < marketCount; i++) {
            allMarkets[i] = markets[i];
        }
        return allMarkets;
    }
    
    /**
     * @dev Update total stake for a market (called by Market contract)
     * @param marketId The market ID
     * @param totalStake The new total stake
     */
    function updateTotalStake(uint256 marketId, uint256 totalStake) external {
        require(marketId < marketCount, "Market does not exist");
        require(msg.sender == markets[marketId].marketAddress, "Only market contract");
        markets[marketId].totalStake = totalStake;
    }
}