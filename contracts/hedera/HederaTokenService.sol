// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.9.0;

import "./IHederaTokenService.sol";

abstract contract HederaTokenService {
    address constant HTS_PRECOMPILED_CONTRACT_ADDRESS = address(0x167);

    /// Associates the provided account with the provided token. Must be signed by the provided
    /// Account's key.
    /// @param account The account to be associated with the provided token
    /// @param token The token to be associated with the provided account.
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function associateToken(address account, address token) internal returns (int responseCode) {
        (bool success, bytes memory result) = HTS_PRECOMPILED_CONTRACT_ADDRESS.call(
            abi.encodeWithSelector(IHederaTokenService.associateToken.selector, account, token)
        );
        responseCode = success ? abi.decode(result, (int32)) : HederaResponseCodes.UNKNOWN;
    }

    /// Associates the provided account with the provided tokens. Must be signed by the provided
    /// Account's key.
    /// @param account The account to be associated with the provided tokens
    /// @param tokens The tokens to be associated with the provided account.
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function associateTokens(address account, address[] memory tokens) internal returns (int responseCode) {
        (bool success, bytes memory result) = HTS_PRECOMPILED_CONTRACT_ADDRESS.call(
            abi.encodeWithSelector(IHederaTokenService.associateTokens.selector, account, tokens)
        );
        responseCode = success ? abi.decode(result, (int32)) : HederaResponseCodes.UNKNOWN;
    }

    /// Dissociates the provided account with the provided token. Must be signed by the provided
    /// Account's key.
    /// @param account The account to be dissociated from the provided token
    /// @param token The token to be dissociated from the provided account
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function dissociateToken(address account, address token) internal returns (int responseCode) {
        (bool success, bytes memory result) = HTS_PRECOMPILED_CONTRACT_ADDRESS.call(
            abi.encodeWithSelector(IHederaTokenService.dissociateToken.selector, account, token)
        );
        responseCode = success ? abi.decode(result, (int32)) : HederaResponseCodes.UNKNOWN;
    }

    /// Dissociates the provided account with the provided tokens. Must be signed by the provided
    /// Account's key.
    /// @param account The account to be dissociated from the provided tokens
    /// @param tokens The tokens to be dissociated from the provided account
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function dissociateTokens(address account, address[] memory tokens) internal returns (int responseCode) {
        (bool success, bytes memory result) = HTS_PRECOMPILED_CONTRACT_ADDRESS.call(
            abi.encodeWithSelector(IHederaTokenService.dissociateTokens.selector, account, tokens)
        );
        responseCode = success ? abi.decode(result, (int32)) : HederaResponseCodes.UNKNOWN;
    }

    /// Transfers cryptocurrency among two or more accounts by making the desired adjustments to their
    /// balances. Each transfer list can specify accounts to send from, accounts to send to, and the
    /// amount to send. All transfers must be in balance.
    /// @param tokenTransfers the list of transfers to do
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function cryptoTransfer(IHederaTokenService.TokenTransferList[] memory tokenTransfers)
        internal
        returns (int responseCode)
    {
        (bool success, bytes memory result) = HTS_PRECOMPILED_CONTRACT_ADDRESS.call(
            abi.encodeWithSelector(IHederaTokenService.cryptoTransfer.selector, tokenTransfers)
        );
        responseCode = success ? abi.decode(result, (int32)) : HederaResponseCodes.UNKNOWN;
    }

    /// Transfers tokens among two or more accounts by making the desired adjustments to their
    /// balances. Each transfer list can specify accounts to send from, accounts to send to, and the
    /// amount to send.
    /// @param token The token to transfer to/from
    /// @param sender The account to send from
    /// @param receiver The account to send to
    /// @param amount The amount to transfer
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function transferToken(address token, address sender, address receiver, int64 amount)
        internal
        returns (int responseCode)
    {
        (bool success, bytes memory result) = HTS_PRECOMPILED_CONTRACT_ADDRESS.call(
            abi.encodeWithSelector(IHederaTokenService.transferToken.selector, token, sender, receiver, amount)
        );
        responseCode = success ? abi.decode(result, (int32)) : HederaResponseCodes.UNKNOWN;
    }
}

library HederaResponseCodes {
    int32 internal constant SUCCESS = 22;
    int32 internal constant UNKNOWN = -1;
    int32 internal constant INVALID_ACCOUNT_ID = 7;
    int32 internal constant INSUFFICIENT_ACCOUNT_BALANCE = 10;
    int32 internal constant INVALID_TOKEN_ID = 70;
    int32 internal constant TOKEN_NOT_ASSOCIATED_TO_ACCOUNT = 93;
    int32 internal constant INSUFFICIENT_TOKEN_BALANCE = 94;
    int32 internal constant TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT = 95;
}