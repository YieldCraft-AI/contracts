// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.9.0;

interface IHederaTokenService {
    /// Transfers cryptocurrency among two or more accounts by making the desired adjustments to their
    /// balances. Each transfer list can specify accounts to send from, accounts to send to, and the
    /// amount to send. All transfers must be in balance.
    /// @param tokenTransfers the list of transfers to do
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function cryptoTransfer(TokenTransferList[] memory tokenTransfers)
        external
        returns (int responseCode);

    /// Allows spender to withdraw from your account multiple times, up to the value amount. If this function
    /// is called again it overwrites the current allowance with value.
    /// @param token The hedera token address to approve
    /// @param spender the account address authorized to spend
    /// @param amount the amount of tokens authorized to spend.
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function approve(address token, address spender, uint256 amount)
        external
        returns (int responseCode);

    /// Associates the provided account with the provided token. Must be signed by the provided
    /// Account's key.
    /// @param account The account to be associated with the provided token
    /// @param token The token to be associated with the provided account
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function associateToken(address account, address token)
        external
        returns (int responseCode);

    /// Associates the provided account with the provided tokens. Must be signed by the provided
    /// Account's key.
    /// @param account The account to be associated with the provided tokens
    /// @param tokens The tokens to be associated with the provided account
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function associateTokens(address account, address[] memory tokens)
        external
        returns (int responseCode);

    /// Dissociates the provided account with the provided token. Must be signed by the provided
    /// Account's key.
    /// @param account The account to be dissociated from the provided token
    /// @param token The token to be dissociated from the provided account
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function dissociateToken(address account, address token)
        external
        returns (int responseCode);

    /// Dissociates the provided account with the provided tokens. Must be signed by the provided
    /// Account's key.
    /// @param account The account to be dissociated from the provided tokens
    /// @param tokens The tokens to be dissociated from the provided account
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function dissociateTokens(address account, address[] memory tokens)
        external
        returns (int responseCode);

    /// Transfers tokens among two or more accounts by making the desired adjustments to their
    /// balances. Each transfer list can specify accounts to send from, accounts to send to, and the
    /// amount to send.
    /// @param token The token to transfer to/from
    /// @param sender The account to send from
    /// @param receiver The account to send to
    /// @param amount The amount to transfer
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function transferToken(address token, address sender, address receiver, int64 amount)
        external
        returns (int responseCode);

    /// Transfers tokens among two or more accounts by making the desired adjustments to their
    /// balances. Each transfer list can specify accounts to send from, accounts to send to, and the
    /// amount to send.
    /// @param token The token to transfer to/from
    /// @param accountId The account ids to send from/to
    /// @param amount The amounts to transfer (positive to credit, negative to debit)
    /// @return responseCode The response code for the status of the request. SUCCESS is 22.
    function transferTokens(address token, address[] memory accountId, int64[] memory amount)
        external
        returns (int responseCode);

    struct TokenTransferList {
        address token;
        AccountAmount[] transfers;
        NftTransfer[] nftTransfers;
    }

    struct AccountAmount {
        address accountID;
        int64 amount;
    }

    struct NftTransfer {
        address senderAccountID;
        address receiverAccountID;
        int64 serialNumber;
    }
}