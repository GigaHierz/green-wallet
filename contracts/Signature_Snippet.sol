/*//////////////////////////////////////////////////////////////
                                VALIDATION
    //////////////////////////////////////////////////////////////*/

    /// @notice receives signature for validation and sends to appropriate function for validation
    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view virtual returns (bytes4 valid) {
        if (paused) revert LENDING_PAUSED();

        (bytes memory offer, int256 idx) = validateHash(hash, signature);

        address denomination;
        uint principal;
        uint repaymentWithFee;
        address collection;
        uint nft_id;
        address referrer;
        uint32 duration;
        uint16 adminFee_bps;

        // Need to clean this up
        if (msg.sender == nftfi_loan) {
            assembly {
                denomination := mload(add(offer, 20))
                principal := mload(add(offer, 52))
                repaymentWithFee := mload(add(offer, 84))
                collection := mload(add(offer, 104))
                nft_id := mload(add(offer, 136))
                referrer := mload(add(offer, 156))
                duration := mload(add(offer, 160))
                adminFee_bps := mload(add(offer, 162))
            }
        }
        if (msg.sender == x2y2_loan) {
            assembly {
                denomination := mload(add(offer, 20))
                principal := mload(add(offer, 52))
                repaymentWithFee := mload(add(offer, 84))
                collection := mload(add(offer, 104))
                duration := mload(add(offer, 108))
                let timest := mload(add(offer, 140))
                let extra := mload(add(offer, 177))
            }
        }

        uint repayment;
        repayment =
            repaymentWithFee -
            (repaymentWithFee - principal).mulDivDown(adminFee_bps, 10000);

        uint price = getNFTFloor(collection);

        if (idx >= 0) {
            _validateStaticRule(
                Loan({
                    principal: principal,
                    repayment: repayment,
                    interest: repayment - principal,
                    ltv: 0,
                    apr: 0,
                    denomination: denomination,
                    collection: collection,
                    duration: duration,
                    index: uint(idx)
                }),
                price
            );
            return this.isValidSignature.selector;
        }
        // We assume everything is prices in weth
        else if (idx == -1) {
            if (denomination == weth) {
                _validateVolEvalRule(
                    VolLoan({
                        principal: principal,
                        repayment: repayment,
                        ltv: 0,
                        collection: collection,
                        duration: duration,
                        price: price
                    })
                );
                return this.isValidSignature.selector;
            }
        } else revert INVALID_OFER();
    }

    function _validateStaticRule(Loan memory loan, uint price) internal view {
        //Price everything in WETH
        if (loan.denomination != weth) {
            if (loan.denomination == dai) {
                price = prices[dai].getERC20Ratio() * 1e18;
            } else if (loan.denomination == usdc) {
                price = price.mulDivDown(1e6, prices[usdc].getERC20Ratio());
            } else revert ASSET_UNSUPPORTED();
        }

        // in bps
        loan.ltv = loan.principal.mulDivDown(10000, price);

        loan.apr = loan.interest.mulDivDown(
            1e22,
            (loan.principal * uint256(loan.duration).mulDivDown(1e18, 356 days))
        );

        // scale principal to 18 decimals
        if (loan.denomination == usdc) loan.principal = loan.principal * 1e12;

        uint8 targetInterestRate;
        uint16 min_apr;
        uint16 max_ltv;
        uint16 expectedVol;
        uint96 max_principalETH;
        uint104 max_principalStable;

        //If we dont find a rule in our index we revert
        bytes memory rule = abi.encodePacked(
            rules[loan.collection][loan.duration][loan.index]
        );

        assembly {
            targetInterestRate := mload(add(rule, 1))
            min_apr := mload(add(rule, 3))
            max_ltv := mload(add(rule, 5))
            expectedVol := mload(add(rule, 7))
            max_principalETH := mload(add(rule, 19))
            max_principalStable := mload(add(rule, 32))
        }

        if (loan.denomination == weth) {
            if (loan.principal > max_principalETH) revert PRINCIPAL_TOO_HIGH();
        } else {
            if (loan.principal > max_principalStable)
                revert PRINCIPAL_TOO_HIGH();
        }

        if (loan.ltv > max_ltv) revert LTV_TOO_HIGH();

        if (loan.apr < min_apr) revert APR_TOO_LOW();
    }

    function _validateVolEvalRule(VolLoan memory loan) internal view {
        // in bps
        loan.ltv = loan.principal.mulDivDown(10000, loan.price);

        int128[7] memory rule = volEvalRules[loan.collection];
        if (int96(loan.duration) > rule[5] || int96(loan.duration) < rule[6]) {
            assembly {
                revert(0, 0)
            }
        }
        if (int256(loan.ltv) > rule[3]) {
            assembly {
                revert(0, 0)
            }
        }
        if (int256(loan.principal) > rule[4]) {
            assembly {
                revert(0, 0)
            }
        }

        GoblinLoanEvaluation.calculateNpvLoan(
            GoblinFixedPointMathLib.fromUInt_1e18(loan.price),
            rule[0],
            rule[1],
            int128(int96(loan.duration)),
            GoblinFixedPointMathLib.fromUInt_1e18(loan.principal),
            GoblinFixedPointMathLib.fromUInt_1e18(loan.repayment),
            rule[2]
        );
    }

function validateHash(
        bytes32 hash,
        bytes memory signature
    ) internal view returns (bytes memory, int256) {
        if (msg.sender == nftfi_loan) {
            (
                bytes memory offer,
                bytes memory sig_struct,
                address loan_contract,
                uint block_id,
                int256 idx
            ) = abi.decode(signature, (bytes, bytes, address, uint256, int256));

            // assert hash == hashed signature
            if (
                hash !=
                keccak256(
                    abi.encodePacked(offer, sig_struct, loan_contract, block_id)
                ).toEthSignedMessageHash()
            ) revert INVALID_SIGNATURE();

            return (offer, idx);
        }

        if (msg.sender == x2y2_loan) {
            (
                bytes memory offer,
                uint nftid,
                bytes memory sig_struct,
                address loan_contract,
                uint block_id,
                int256 idx
            ) = abi.decode(
                    signature,
                    (bytes, uint, bytes, address, uint256, int256)
                );
            // assert hash == hashed signature
            if (
                hash !=
                keccak256(
                    abi.encodePacked(
                        offer,
                        nftid,
                        sig_struct,
                        loan_contract,
                        block_id
                    )
                ).toEthSignedMessageHash()
            ) revert INVALID_SIGNATURE();

            return (offer, idx);
        }
        revert("INVALID_SENDER");
    }