// SPDX-FileCopyrightText: 2022 Toucan Labs
//
// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "./OffsetHelperStorage.sol";
import "./interfaces/IToucanPoolToken.sol";
import "./interfaces/IToucanCarbonOffsets.sol";
import "./interfaces/IToucanContractRegistry.sol";
import "./interfaces/IRetirementCertificates.sol";

contract MyContract {
    uint256 private balanceOfNCT;
    uint256 private balanceOfUSDC;
    address private NCTPool = "0xD838290e877E0188a4A44700463419ED96c16107";  //poolToken
    address private address_USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    enum Quality { NORMAL, HIGH }

    function setVariable1(uint256 co2Amount) external {
        variable1 = newValue;
    }

    // Checking the type of quality 
    function mainOffset(
        address _depositedToken,
        uint256 _amountToOffset,
        Quality _quality
    ) external payable returns (address[] memory tco2s, uint256[] memory amounts) {

         if (_quality == Quality.NORMAL) {
            autoOffset(NCTPool,_amountToOffset);
        } else {    
            //TODO: HIGH QUALITY
            return false;
        }
    }

    // if quality = NORMAL
    function autoOffset(
        address _poolToken,
        uint256 _amountToOffset
    ) private view returns (uint256) {
        // redeem BCT / NCT for TCO2s
        (tco2s, amounts) = autoRedeem(_poolToken, _amountToOffset);

        // retire the TCO2s to achieve offset
        autoRetire(tco2s, amounts);
    }


    // if quality = HIGH
    function qualityOffset(
        address _depositedToken,
        address _poolToken,
        uint256 _amountToOffset
    ) private view returns (uint256) {
        return variable2;
    }


    function autoRedeem(address _fromToken, uint256 _amount)
        public
        onlyRedeemable(_fromToken)
        returns (address[] memory tco2s, uint256[] memory amounts)
    {
        require(
            balances[msg.sender][_fromToken] >= _amount,
            "Insufficient NCT/BCT balance"
        );

        // instantiate pool token (NCT or BCT)
        IToucanPoolToken PoolTokenImplementation = IToucanPoolToken(_fromToken);

        // auto redeem pool token for TCO2; will transfer automatically picked TCO2 to this contract
        (tco2s, amounts) = PoolTokenImplementation.redeemAuto2(_amount);

        // update balances
        balances[msg.sender][_fromToken] -= _amount;
        uint256 tco2sLen = tco2s.length;
        for (uint256 index = 0; index < tco2sLen; index++) {
            balances[msg.sender][tco2s[index]] += amounts[index];
        }

        emit Redeemed(msg.sender, _fromToken, tco2s, amounts);
    }

    /**
     * @notice Retire the specified TCO2 tokens.
     * @param _tco2s The addresses of the TCO2s to retire
     * @param _amounts The amounts to retire from each of the corresponding
     * TCO2 addresses
     */
    function autoRetire(address[] memory _tco2s, uint256[] memory _amounts)
        public
    {
        uint256 tco2sLen = _tco2s.length;
        require(tco2sLen != 0, "Array empty");

        require(tco2sLen == _amounts.length, "Arrays unequal");

        uint256 i = 0;
        while (i < tco2sLen) {
            if (_amounts[i] == 0) {
                unchecked {
                    i++;
                }
                continue;
            }
            require(
                balances[msg.sender][_tco2s[i]] >= _amounts[i],
                "Insufficient TCO2 balance"
            );

            balances[msg.sender][_tco2s[i]] -= _amounts[i];

            IToucanCarbonOffsets(_tco2s[i]).retireAndMintCertificate("green wallet",msg.sender,"EcoHero","Retirment in progress",_amounts[i]);

            unchecked {
                ++i;
            }
        }
    }

        /// @notice Redeems Pool tokens for multiple underlying TCO2s 1:1 minus fees
    /// @dev User specifies in front-end the addresses and amounts they want
    /// @param tco2s Array of TCO2 contract addresses
    /// @param amounts Array of amounts to redeem for each tco2s
    /// Pool token in user's wallet get burned
    function redeemMany(address[] memory tco2s, uint256[] memory amounts)
        external
        virtual
    {
        onlyUnpaused();
        uint256 tco2Length = tco2s.length;
        require(tco2Length == amounts.length, Errors.CP_LENGTH_MISMATCH);

        //slither-disable-next-line uninitialized-local
        uint256 totalFee;
        uint256 _feeRedeemPercentageInBase = feeRedeemPercentageInBase;
        bool isExempted = redeemFeeExemptedAddresses[msg.sender];
        //slither-disable-next-line uninitialized-local
        uint256 feeAmount;

        //slither-disable-next-line uninitialized-local
        for (uint256 i; i < tco2Length; ++i) {
            checkEligible(tco2s[i]);
            if (!isExempted) {
                feeAmount =
                    (amounts[i] * _feeRedeemPercentageInBase) /
                    feeRedeemDivider;
                totalFee += feeAmount;
            } else {
                feeAmount = 0;
            }
            redeemSingle(tco2s[i], amounts[i] - feeAmount);
        }
        if (totalFee != 0) {
            uint256 burnAmount = (totalFee * feeRedeemBurnPercentageInBase) /
                feeRedeemDivider;
            totalFee -= burnAmount;
            transfer(feeRedeemReceiver, totalFee);
            emit RedeemFeePaid(msg.sender, totalFee);
            if (burnAmount > 0) {
                transfer(feeRedeemBurnAddress, burnAmount);
                emit RedeemFeeBurnt(msg.sender, burnAmount);
            }
        }
    }
}