// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";
import "./interfaces/IV3SwapRouter.sol";
import "./interfaces/Uniswap.sol";

contract UniswapV2toV3Arbitrage {

    using SafeERC20 for IERC20;

    address public constant FDAI = 0x6EBF65eD1B4b546D436F656F164b3C79e0Fd60b8;
    address public constant FETH = 0x8c31113d8447Ab98D7F5B3c5d8726060886909F7;
    address public constant FDAI_FETH_POOL_V2 = 0x8Ad337c3bA80E0812f6C6E5FBC556517cFC921F0;
    address public constant FDAI_FETH_POOL_V3 = 0xb14b166D4D911C6921939FFA50bd5ae55C97639a;
    address public constant UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public constant UNISWAP_V3_ROUTER = 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;

    address private constant UNISWAP_V2_FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    IUniswapV2Factory private constant factory = IUniswapV2Factory(UNISWAP_V2_FACTORY);

    IV3SwapRouter private immutable swapRouter02 = IV3SwapRouter(UNISWAP_V3_ROUTER);

    //pool fee 0.3%.
    uint24 public constant poolFee = 3000;

    IERC20 private constant feth = IERC20(FETH);
    IERC20 private constant fdai = IERC20(FDAI);

    IUniswapV2Pair private immutable pair;

    uint private amountToRepay;

    event Log(string message, uint val);
    event SentProfit(address recipient, uint256 profit);
    
    constructor() {
        pair = IUniswapV2Pair(factory.getPair(FDAI, FETH)); 
    }

    function swapExactInputSingle02(uint256 amountIn)
        internal
        returns (uint256 amountOut)
    {
        // approving the router to move FDAI on behalf of my contract
        TransferHelper.safeApprove(FDAI, UNISWAP_V3_ROUTER, amountIn);

        // UniV3 router swapping FDAI for FETH. Sends the FETH recieved to this contract
        IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter
            .ExactInputSingleParams({
                tokenIn: FDAI,
                tokenOut: FETH,
                fee: 3000,
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        amountOut = swapRouter02.exactInputSingle(params);
    }

    function flashSwapArb(uint fdaiLoanAmount) external{

        address[] memory path;
        path = new address[](2);
        path[0] = FETH; // This will be the token value that is output in amountRequired.
        path[1] = FDAI; //  This is the AmountOut token

        // find out how much feth needed to put in to get 1 FDAI out. To repay my 1 FDAI loan.
        // getAmountsIn(amountOut, path[])
        uint amountRequired = IUniswapV2Router(UNISWAP_V2_ROUTER).getAmountsIn(fdaiLoanAmount, path)[0];

        emit Log("amountRequired of FETH needed to get 1 FDAI Out", amountRequired);

        bytes memory data = abi.encode(FDAI, msg.sender, amountRequired);

        // This swap has data which causes it to initiate a flashloan.
        pair.swap(fdaiLoanAmount, 0,  address(this), data);
        
    }
    
    // This starts after the tokens are borrowed
    function uniswapV2Call(
        address sender,
        uint amount0,
        uint amount1,
        bytes calldata data
    ) external {
        
        require(msg.sender == address(pair), "not pair");
        require(sender == address(this), "not sender");

        (address tokenBorrow, address caller, uint paybackAmount) = abi.decode(data, (address, address, uint));
        // caller = address of msg.sender

        require(tokenBorrow == FDAI, "token borrow != FDAI");
        
        // This is the V3 swap function
        swapExactInputSingle02(amount0);

        // about 0.3% fee, +1 to round up
        uint fee = (paybackAmount * 3) / 997 + 1;
        amountToRepay = paybackAmount + fee;

        // Logs
        emit Log("paybackAmount", paybackAmount);
        emit Log("amount0", amount0);
        emit Log("fee", fee);
        emit Log("amount to repay", amountToRepay);
    
        // Repay.  Tranferring FETH to repay the FDAI loan.
        feth.transfer(address(pair), amountToRepay);
 
        // checks if there are any remaining tokens(profit)
        uint256 remained = feth.balanceOf(address(this));

        // transfer the profit to msg.sender
        feth.transfer(caller, remained);
        emit SentProfit(caller, remained);
    }

    receive() external payable {}
    fallback() external payable {}
}

interface IWETH is IERC20 {
    function deposit() external payable;

    function withdraw(uint amount) external;
}