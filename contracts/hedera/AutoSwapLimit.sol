// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./HederaTokenService.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";

// Interface for SaucerSwap Router V1 (0.0.19264)
interface ISaucerSwapRouter {
    function WHBAR() external view returns (address);
    function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external view returns (uint256[] memory amounts);
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);
}

/**
 * @title AutoSwapLimit - Safe Version
 * @dev Simplified constructor to avoid deployment issues
 */
contract AutoSwapLimitSafe is Ownable, ReentrancyGuard, HederaTokenService {
    struct SwapOrder {
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 triggerPrice;
        address owner;
        bool isActive;
        uint256 expirationTime;
        bool isExecuted;
    }

    // Pyth integration
    IPyth public immutable pyth;
    bytes32 public immutable hbarUsdPriceId;
    bytes32 public immutable usdtUsdPriceId;
    uint256 public constant PRICE_MAX_AGE = 60;

    // SaucerSwap Router
    ISaucerSwapRouter public immutable saucerSwapRouter;
    uint256 public constant ROUTER_THRESHOLD = 18000000000; // 180 HBAR

    // WHBAR address - set after deployment
    address public WETH;

    // Token addresses
    address public constant WHBAR_FOR_PATH =
        0x0000000000000000000000000000000000003aD2;
    address public constant USDC = 0x00000000000000000000000000000000000014F5;
    address public constant SAUCE = 0x0000000000000000000000000000000000120f46;

    // Contract state
    mapping(uint256 => SwapOrder) public swapOrders;
    mapping(address => uint256[]) public userOrders;
    mapping(address => bool) public authorizedExecutors;
    address[] public executorList;
    address[] public supportedTokens;
    mapping(address => bool) public isSupportedToken;

    uint256 public nextOrderId = 1;
    uint256 public executionFee = 10000000; // 0.1 HBAR
    uint256 public constant MIN_ORDER_AMOUNT = 1000000; // 0.01 HBAR
    bool public publicExecutionEnabled = true;
    address public backendExecutor;

    // Events
    event OrderCreated(
        uint256 indexed orderId,
        address indexed user,
        address tokenOut,
        uint256 amountIn,
        uint256 triggerPrice
    );
    event OrderExecuted(
        uint256 indexed orderId,
        address indexed executor,
        uint256 amountOut,
        uint256 executionPrice
    );
    event OrderCancelled(uint256 indexed orderId, address indexed user);
    event PriceFetched(
        bytes32 indexed priceId,
        int64 price,
        uint64 publishTime,
        string symbol
    );

    constructor(
        address _saucerSwapRouter,
        address _backendExecutor,
        address _pyth,
        bytes32 _hbarUsdPriceId,
        bytes32 _usdtUsdPriceId
    ) Ownable(msg.sender) {
        require(
            _saucerSwapRouter != address(0),
            "Router address cannot be zero"
        );
        require(
            _backendExecutor != address(0),
            "Backend executor cannot be zero"
        );
        require(_pyth != address(0), "Pyth address cannot be zero");

        saucerSwapRouter = ISaucerSwapRouter(_saucerSwapRouter);
        backendExecutor = _backendExecutor;

        // Initialize Pyth
        pyth = IPyth(_pyth);
        hbarUsdPriceId = _hbarUsdPriceId;
        usdtUsdPriceId = _usdtUsdPriceId;

        // Add backend executor to authorized list
        authorizedExecutors[_backendExecutor] = true;
        executorList.push(_backendExecutor);

        // Initialize supported tokens
        supportedTokens.push(USDC);
        supportedTokens.push(SAUCE);
        isSupportedToken[USDC] = true;
        isSupportedToken[SAUCE] = true;
    }

    /**
     * @dev Initialize WETH address after deployment (owner only)
     */
    function initializeWETH() external onlyOwner {
        require(WETH == address(0), "WETH already initialized");
        WETH = saucerSwapRouter.WHBAR();
        require(WETH != address(0), "Failed to get WHBAR address");
    }

    /**
     * @dev Associate tokens to contract after deployment (owner only)
     */
    function associateTokensToContract(
        address[] memory tokens
    ) external onlyOwner {
        require(tokens.length > 0, "Tokens array cannot be empty");
        int responseCode = associateTokens(address(this), tokens);
        require(
            responseCode == HederaResponseCodes.SUCCESS,
            "Token association failed"
        );
    }

    /**
     * @dev Update and fetch Pyth prices
     */
    function updateAndFetch(
        bytes[] calldata pythPriceUpdate
    ) external payable returns (uint256 hbarPrice, uint256 usdtPrice) {
        uint updateFee = pyth.getUpdateFee(pythPriceUpdate);
        require(msg.value >= updateFee, "Insufficient fee for price update");

        pyth.updatePriceFeeds{value: updateFee}(pythPriceUpdate);

        PythStructs.Price memory hbarPriceData = pyth.getPriceNoOlderThan(
            hbarUsdPriceId,
            PRICE_MAX_AGE
        );
        PythStructs.Price memory usdtPriceData = pyth.getPriceNoOlderThan(
            usdtUsdPriceId,
            PRICE_MAX_AGE
        );

        hbarPrice = _convertPythPrice(hbarPriceData);
        usdtPrice = _convertPythPrice(usdtPriceData);

        emit PriceFetched(
            hbarUsdPriceId,
            hbarPriceData.price,
            uint64(hbarPriceData.publishTime),
            "HBAR/USD"
        );
        emit PriceFetched(
            usdtUsdPriceId,
            usdtPriceData.price,
            uint64(usdtPriceData.publishTime),
            "USDT/USD"
        );

        if (msg.value > updateFee) {
            payable(msg.sender).transfer(msg.value - updateFee);
        }

        return (hbarPrice, usdtPrice);
    }

    /**
     * @dev Convert Pyth price to 18 decimals
     */
    function _convertPythPrice(
        PythStructs.Price memory price
    ) internal pure returns (uint256) {
        uint256 price18Decimals = (uint256(uint64(price.price)) * (10 ** 18)) /
            (10 ** uint8(uint32(-1 * price.expo)));
        return price18Decimals;
    }

    /**
     * @dev Create swap order
     */
    function createSwapOrder(
        address tokenOut,
        uint256 minAmountOut,
        uint256 triggerPrice,
        uint256 expirationTime
    ) external payable {
        require(msg.value > executionFee, "Insufficient HBAR");
        require(minAmountOut > 0, "Minimum amount must be greater than 0");
        require(triggerPrice > 0, "Trigger price must be greater than 0");
        require(
            expirationTime > block.timestamp,
            "Expiration time must be in the future"
        );
        require(tokenOut != address(0), "Invalid output token address");
        require(isSupportedToken[tokenOut], "Token not supported");

        uint256 hbarForSwap = msg.value - executionFee;
        require(hbarForSwap >= MIN_ORDER_AMOUNT, "Order amount too small");
        require(hbarForSwap <= ROUTER_THRESHOLD, "Order amount too large");

        swapOrders[nextOrderId] = SwapOrder({
            tokenOut: tokenOut,
            amountIn: hbarForSwap,
            minAmountOut: minAmountOut,
            triggerPrice: triggerPrice,
            owner: msg.sender,
            isActive: true,
            expirationTime: expirationTime,
            isExecuted: false
        });

        userOrders[msg.sender].push(nextOrderId);

        emit OrderCreated(
            nextOrderId,
            msg.sender,
            tokenOut,
            hbarForSwap,
            triggerPrice
        );
        nextOrderId++;
    }

    // Basic getters
    function getContractConfig()
        external
        view
        returns (
            uint256 currentExecutionFee,
            uint256 minOrderAmount,
            address currentBackendExecutor,
            uint256 currentNextOrderId,
            uint256 routerThreshold,
            address whbarAddress,
            address pythAddress,
            bytes32 hbarUsdId,
            bytes32 usdtUsdId
        )
    {
        return (
            executionFee,
            MIN_ORDER_AMOUNT,
            backendExecutor,
            nextOrderId,
            ROUTER_THRESHOLD,
            WETH,
            address(pyth),
            hbarUsdPriceId,
            usdtUsdPriceId
        );
    }

    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    receive() external payable {}
}
