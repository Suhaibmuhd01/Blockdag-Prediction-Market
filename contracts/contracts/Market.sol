// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IMarketFactory {
    function updateTotalStake(uint256 marketId, uint256 totalStake) external;
}

/**
 * @title Market
 * @dev Individual prediction market contract
 */
contract Market is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable stakingToken;
    string public question;
    uint256 public endTime;
    address public creator;
    address public factory;
    
    enum Outcome { UNRESOLVED, YES, NO }
    Outcome public outcome = Outcome.UNRESOLVED;
    
    struct Position {
        uint256 yesStake;
        uint256 noStake;
    }
    
    mapping(address => Position) public positions;
    uint256 public totalYesStake;
    uint256 public totalNoStake;
    uint256 public marketId;
    
    bool public resolved = false;
    
    event Staked(
        address indexed user,
        bool prediction,
        uint256 amount,
        uint256 totalYesStake,
        uint256 totalNoStake
    );
    
    event Resolved(Outcome outcome);
    
    event Withdrawn(address indexed user, uint256 amount);
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call");
        _;
    }
    
    modifier marketEnded() {
        require(block.timestamp >= endTime, "Market not ended");
        _;
    }
    
    modifier marketNotEnded() {
        require(block.timestamp < endTime, "Market ended");
        _;
    }
    
    modifier marketResolved() {
        require(resolved, "Market not resolved");
        _;
    }
    
    constructor(
        address _stakingToken,
        string memory _question,
        uint256 _endTime,
        address _creator,
        address _factory
    ) {
        stakingToken = IERC20(_stakingToken);
        question = _question;
        endTime = _endTime;
        creator = _creator;
        factory = _factory;
    }
    
    /**
     * @dev Stake tokens on a prediction
     * @param prediction True for Yes, False for No
     * @param amount Amount to stake
     */
    function stake(bool prediction, uint256 amount) external nonReentrant marketNotEnded {
        require(amount > 0, "Amount must be positive");
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        if (prediction) {
            positions[msg.sender].yesStake += amount;
            totalYesStake += amount;
        } else {
            positions[msg.sender].noStake += amount;
            totalNoStake += amount;
        }
        
        // Update factory with total stake
        try IMarketFactory(factory).updateTotalStake(marketId, totalYesStake + totalNoStake) {
        } catch {
            // Ignore if factory update fails
        }
        
        emit Staked(msg.sender, prediction, amount, totalYesStake, totalNoStake);
    }
    
    /**
     * @dev Resolve the market
     * @param _outcome True for Yes, False for No
     */
    function resolve(bool _outcome) external onlyFactory marketEnded {
        require(!resolved, "Already resolved");
        
        outcome = _outcome ? Outcome.YES : Outcome.NO;
        resolved = true;
        
        emit Resolved(outcome);
    }
    
    /**
     * @dev Withdraw winnings
     */
    function withdraw() external nonReentrant marketResolved {
        Position memory position = positions[msg.sender];
        require(position.yesStake > 0 || position.noStake > 0, "No stake to withdraw");
        
        uint256 winnings = calculateWinnings(msg.sender);
        require(winnings > 0, "No winnings to withdraw");
        
        // Clear user position
        delete positions[msg.sender];
        
        stakingToken.safeTransfer(msg.sender, winnings);
        
        emit Withdrawn(msg.sender, winnings);
    }
    
    /**
     * @dev Calculate winnings for a user
     * @param user The user address
     */
    function calculateWinnings(address user) public view returns (uint256) {
        if (!resolved) return 0;
        
        Position memory position = positions[user];
        
        if (outcome == Outcome.YES && position.yesStake > 0) {
            if (totalYesStake == 0) return 0;
            // Winner gets their stake + proportional share of losing stakes
            return position.yesStake + (position.yesStake * totalNoStake) / totalYesStake;
        } else if (outcome == Outcome.NO && position.noStake > 0) {
            if (totalNoStake == 0) return 0;
            // Winner gets their stake + proportional share of losing stakes
            return position.noStake + (position.noStake * totalYesStake) / totalNoStake;
        }
        
        return 0;
    }
    
    /**
     * @dev Get current market odds (Yes percentage)
     */
    function getOdds() external view returns (uint256) {
        uint256 total = totalYesStake + totalNoStake;
        if (total == 0) return 50; // 50% when no stakes
        return (totalYesStake * 100) / total;
    }
    
    /**
     * @dev Get user position
     * @param user The user address
     */
    function getPosition(address user) external view returns (uint256 yesStake, uint256 noStake) {
        Position memory position = positions[user];
        return (position.yesStake, position.noStake);
    }
    
    /**
     * @dev Get market summary
     */
    function getMarketSummary() external view returns (
        string memory _question,
        uint256 _endTime,
        uint256 _totalYesStake,
        uint256 _totalNoStake,
        bool _resolved,
        Outcome _outcome
    ) {
        return (question, endTime, totalYesStake, totalNoStake, resolved, outcome);
    }
}