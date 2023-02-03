// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

interface IERC20 {
     function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract Faucet {
    address payable public owner;
    IERC20 public token;
    uint256 public withdrawalAmount = 50 * ( 10 **18 );

    uint256 public lockTime = 1 minutes;

    event Withdraw(address indexed to, uint256 indexed amount);
    event Deposit(address indexed from, uint256 indexed amount);

    mapping(address => uint256) nextAccessTime;

    constructor(address tokenAddress) payable {
        token = IERC20(tokenAddress);
        owner = payable(msg.sender);
    }

    function requestTokens() public {
        require(msg.sender != address(0), "Request Must not be originated from zero account");
        require(token.balanceOf(address(this)) >= withdrawalAmount, "Insufficiant balance in faucet for withdraw request");
        require(block.timestamp >= nextAccessTime[msg.sender], "Insufficiant time elapsed since last withdraw - try letter");

        nextAccessTime[msg.sender] = block.timestamp + lockTime;

        token.transfer(msg.sender, withdrawalAmount);
    }

    receive() external payable{
        emit Deposit(msg.sender, msg.value);
    }

    function getBalance() external view returns(uint256) {
        return token.balanceOf(address(this));
    }

    function setWithdrawAmount(uint256 amount) public OnlyOwner {
        withdrawalAmount = amount * (10 ** 18);
    }

    function setLockTime(uint256 time) public OnlyOwner {
        lockTime = time * 1 minutes;
    }

    function withDreaw() external OnlyOwner {
        emit Withdraw(msg.sender, token.balanceOf(address(this)));
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

     modifier OnlyOwner {
        require(msg.sender == owner, "Only The owner can call this function");
        _;
    }
}
