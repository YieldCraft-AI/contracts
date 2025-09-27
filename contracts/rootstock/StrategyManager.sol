// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract StratManager is Ownable, Pausable {
    struct CommonAddresses {
        address vault;
        address unirouter;
    }

    /// @notice The address of the vault
    address public vault;

    /// @notice The address of the unirouter
    address public unirouter;

    /// @notice The total amount of token0 locked in the vault
    uint256 public totalLocked0;

    /// @notice The total amount of token1 locked in the vault
    uint256 public totalLocked1;

    /// @notice The last time the strat harvested
    uint256 public lastHarvest;

    /// @notice The last time we adjusted the position
    uint256 public lastPositionAdjustment;

    /// @notice The duration of the locked rewards
    uint256 constant DURATION = 1 hours;

    /// @notice The divisor used to calculate the fee
    uint256 constant DIVISOR = 1 ether;

    // Events
    event SetUnirouter(address unirouter);

    // Errors
    error NotManager();
    error StrategyPaused();

    constructor(
        CommonAddresses memory _commonAddresses
    ) Ownable(msg.sender) Pausable() {
        vault = _commonAddresses.vault;
        unirouter = _commonAddresses.unirouter;
    }

    /**
     * @notice function that throws if the strategy is paused
     */
    function _whenStrategyNotPaused() internal view {
        if (paused()) revert StrategyPaused();
    }

    /**
     * @notice function that returns true if the strategy is paused
     */
    function _isPaused() internal view returns (bool) {
        return paused();
    }

    /**
     * @notice Modifier that throws if called by any account other than the manager or the owner
     */
    modifier onlyManager() {
        if (msg.sender != owner()) revert NotManager();
        _;
    }

    /**
     * @notice set the unirouter address
     * @param _unirouter The new unirouter address
     */
    function setUnirouter(address _unirouter) external virtual onlyOwner {
        unirouter = _unirouter;
        emit SetUnirouter(_unirouter);
    }

    /**
     * @notice The deposit fee variable will alwasy be 0. This is used by the UI.
     * @return uint256 The deposit fee
     */
    function depositFee() public view virtual returns (uint256) {
        return 0;
    }

    /**
     * @notice The withdraw fee variable will alwasy be 0. This is used by the UI.
     * @return uint256 The withdraw fee
     */
    function withdrawFee() public view virtual returns (uint256) {
        return 0;
    }

    /**
     * @notice The locked profit is the amount of token0 and token1 that is locked in the vault, this can be overriden by the strategy contract.
     * @return locked0 The amount of token0 locked
     * @return locked1 The amount of token1 locked
     */
    function lockedProfit()
        public
        view
        virtual
        returns (uint256 locked0, uint256 locked1)
    {
        uint256 elapsed = block.timestamp - lastHarvest;
        uint256 remaining = elapsed < DURATION ? DURATION - elapsed : 0;
        return (
            (totalLocked0 * remaining) / DURATION,
            (totalLocked1 * remaining) / DURATION
        );
    }
}
