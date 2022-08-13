export type USyrupIDL = {
  version: '0.1.0';
  name: 'syrup';
  instructions: [
    {
      name: 'globalsInitialize';
      accounts: [
        {
          name: 'governor';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalAdmin';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'nonce';
          type: {
            defined: 'Nonce';
          };
        },
        {
          name: 'treasuryDrawdownFee';
          type: 'u64';
        },
      ];
    },
    {
      name: 'globalsSetProtocolPause';
      accounts: [
        {
          name: 'globalAdmin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globals';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'pause';
          type: 'bool';
        },
      ];
    },
    {
      name: 'globalsSetPendingGovernor';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globals';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'pendingGovernor';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'globalsAcceptGovernor';
      accounts: [
        {
          name: 'governorNominee';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globals';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'globalsSetGlobalAdmin';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'newAdmin';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globals';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'globalsSetTreasuryDrawdownFee';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globals';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'treasuryDrawdownFee';
          type: 'u64';
        },
      ];
    },
    {
      name: 'globalsInitTreasury';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governor';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'treasuryLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'baseMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'globalsClaimTreasuryFees';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governorLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'treasuryLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'claimAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'globalsSetDelegate';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globals';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'delegate';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'globalsRemoveDelegate';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globals';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'delegate';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'globalsSetBaseMint';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globals';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseMint';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'globalsRemoveBaseMint';
      accounts: [
        {
          name: 'governor';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globals';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseMint';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'poolInitialize';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'delegate';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'delegateClaimable';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'baseMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'poolLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'sharesMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'nonce';
          type: {
            defined: 'Nonce';
          };
        },
        {
          name: 'config';
          type: {
            defined: 'PoolConfig';
          };
        },
      ];
    },
    {
      name: 'poolSetConfig';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'delegate';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'config';
          type: {
            defined: 'PoolConfig';
          };
        },
      ];
    },
    {
      name: 'poolClaimDelegateFees';
      accounts: [
        {
          name: 'delegate';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'delegateLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'delegateClaimable';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'claimAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'poolSetPendingDelegate';
      accounts: [
        {
          name: 'delegate';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'pendingDelegate';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'poolAcceptDelegate';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'delegateNominee';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'lenderInitialize';
      accounts: [
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'sharesMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lender';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lockedShares';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderShares';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'lenderSetAllowlisted';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'delegate';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lender';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'allowlist';
          type: 'bool';
        },
      ];
    },
    {
      name: 'lenderDeposit';
      accounts: [
        {
          name: 'lender';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderUser';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'poolLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'sharesMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lockedShares';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderShares';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'depositAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'lenderUnlockDeposit';
      accounts: [
        {
          name: 'lender';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderUser';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lockedShares';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderShares';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'withdrawalRequestInitialize';
      accounts: [
        {
          name: 'lender';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderOwner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'sharesMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderShareAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'withdrawalRequest';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'withdrawalRequestLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'nonce';
          type: {
            defined: 'Nonce';
          };
        },
        {
          name: 'shares';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdrawalRequestExecute';
      accounts: [
        {
          name: 'withdrawalRequest';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderOwner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'lender';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'baseMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'poolLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'sharesMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'withdrawalRequestLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'withdrawalRequestClose';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'withdrawalRequest';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderOwner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lender';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lenderShareAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'withdrawalRequestLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'loanInitialize';
      accounts: [
        {
          name: 'borrower';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'loanLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'baseMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'nonce';
          type: {
            defined: 'Nonce';
          };
        },
        {
          name: 'config';
          type: {
            defined: 'LoanConfig';
          };
        },
      ];
    },
    {
      name: 'loanFund';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'loanLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'delegate';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'delegateClaimable';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'treasuryLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'baseMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'poolLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'loanDrawdown';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'borrower';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'borrowerLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'loan';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'loanLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'loanEarlyClose';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'borrower';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'baseMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'borrowerLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'treasuryLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'delegateClaimable';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'poolLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'loanMakePayment';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'borrower';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'baseMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'borrowerLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'treasuryLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'delegateClaimable';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'poolLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'loanDefault';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'delegate';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'poolLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'loanLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'loanClose';
      accounts: [
        {
          name: 'globals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'loanLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'borrower';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'borrowerLocker';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'Globals';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'governor';
            type: 'publicKey';
          },
          {
            name: 'pendingGovernor';
            type: 'publicKey';
          },
          {
            name: 'globalAdmin';
            type: 'publicKey';
          },
          {
            name: 'delegates';
            type: {
              array: ['publicKey', 16];
            };
          },
          {
            name: 'baseMints';
            type: {
              array: ['publicKey', 16];
            };
          },
          {
            name: 'treasuryDrawdownFee';
            type: 'u64';
          },
          {
            name: 'protocolPaused';
            type: 'bool';
          },
          {
            name: 'nonce';
            type: {
              defined: 'Nonce';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'padding0';
            type: 'u128';
          },
          {
            name: 'padding1';
            type: 'u128';
          },
          {
            name: 'padding2';
            type: 'u128';
          },
          {
            name: 'padding3';
            type: 'u128';
          },
          {
            name: 'padding4';
            type: 'u128';
          },
        ];
      };
    },
    {
      name: 'Lender';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pool';
            type: 'publicKey';
          },
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'allowlisted';
            type: 'bool';
          },
          {
            name: 'depositTs';
            type: 'u64';
          },
          {
            name: 'lockedSharesAmount';
            type: 'u64';
          },
          {
            name: 'lockedShares';
            type: 'publicKey';
          },
          {
            name: 'lenderShares';
            type: 'publicKey';
          },
          {
            name: 'lenderBump';
            type: 'u8';
          },
          {
            name: 'lockedSharesBump';
            type: 'u8';
          },
          {
            name: 'padding0';
            type: 'u128';
          },
          {
            name: 'padding1';
            type: 'u128';
          },
          {
            name: 'padding2';
            type: 'u128';
          },
          {
            name: 'padding3';
            type: 'u128';
          },
          {
            name: 'padding4';
            type: 'u128';
          },
        ];
      };
    },
    {
      name: 'Loan';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'globals';
            type: 'publicKey';
          },
          {
            name: 'borrower';
            type: 'publicKey';
          },
          {
            name: 'pool';
            type: 'publicKey';
          },
          {
            name: 'baseMint';
            type: 'publicKey';
          },
          {
            name: 'locker';
            type: 'publicKey';
          },
          {
            name: 'config';
            type: {
              defined: 'LoanConfig';
            };
          },
          {
            name: 'state';
            type: {
              defined: 'LoanState';
            };
          },
          {
            name: 'createdTs';
            type: 'u64';
          },
          {
            name: 'fundedTs';
            type: 'u64';
          },
          {
            name: 'nextPaymentTs';
            type: 'u64';
          },
          {
            name: 'payments';
            type: 'u64';
          },
          {
            name: 'principal';
            type: 'u64';
          },
          {
            name: 'nonce';
            type: {
              defined: 'Nonce';
            };
          },
          {
            name: 'loanBump';
            type: 'u8';
          },
          {
            name: 'lockerBump';
            type: 'u8';
          },
          {
            name: 'padding0';
            type: 'u128';
          },
          {
            name: 'padding1';
            type: 'u128';
          },
          {
            name: 'padding2';
            type: 'u128';
          },
          {
            name: 'padding3';
            type: 'u128';
          },
          {
            name: 'padding4';
            type: 'u128';
          },
        ];
      };
    },
    {
      name: 'Pool';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'globals';
            type: 'publicKey';
          },
          {
            name: 'delegate';
            type: 'publicKey';
          },
          {
            name: 'pendingDelegate';
            type: 'publicKey';
          },
          {
            name: 'delegateClaimable';
            type: 'publicKey';
          },
          {
            name: 'config';
            type: {
              defined: 'PoolConfig';
            };
          },
          {
            name: 'baseMint';
            type: 'publicKey';
          },
          {
            name: 'locker';
            type: 'publicKey';
          },
          {
            name: 'totalValue';
            type: 'u64';
          },
          {
            name: 'sharesMint';
            type: 'publicKey';
          },
          {
            name: 'sharesOutstanding';
            type: 'u64';
          },
          {
            name: 'nonce';
            type: {
              defined: 'Nonce';
            };
          },
          {
            name: 'poolBump';
            type: 'u8';
          },
          {
            name: 'lockerBump';
            type: 'u8';
          },
          {
            name: 'sharesMintBump';
            type: 'u8';
          },
          {
            name: 'delegateClaimableBump';
            type: 'u8';
          },
          {
            name: 'padding0';
            type: 'u128';
          },
          {
            name: 'padding1';
            type: 'u128';
          },
          {
            name: 'padding2';
            type: 'u128';
          },
          {
            name: 'padding3';
            type: 'u128';
          },
          {
            name: 'padding4';
            type: 'u128';
          },
        ];
      };
    },
    {
      name: 'WithdrawalRequest';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pool';
            type: 'publicKey';
          },
          {
            name: 'lender';
            type: 'publicKey';
          },
          {
            name: 'createTs';
            type: 'u64';
          },
          {
            name: 'shares';
            type: 'u64';
          },
          {
            name: 'locker';
            type: 'publicKey';
          },
          {
            name: 'nonce';
            type: {
              defined: 'Nonce';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'lockerBump';
            type: 'u8';
          },
          {
            name: 'padding0';
            type: 'u128';
          },
          {
            name: 'padding1';
            type: 'u128';
          },
          {
            name: 'padding2';
            type: 'u128';
          },
          {
            name: 'padding3';
            type: 'u128';
          },
          {
            name: 'padding4';
            type: 'u128';
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'LoanConfig';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'gracePeriod';
            type: 'u64';
          },
          {
            name: 'paymentInterval';
            type: 'u64';
          },
          {
            name: 'paymentsRequested';
            type: 'u64';
          },
          {
            name: 'interestRate';
            type: 'u64';
          },
          {
            name: 'earlyFeeRate';
            type: 'u64';
          },
          {
            name: 'lateFeeRate';
            type: 'u64';
          },
          {
            name: 'lateInterestPremium';
            type: 'u64';
          },
          {
            name: 'principalRequested';
            type: 'u64';
          },
          {
            name: 'endingPrincipal';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'Nonce';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'value';
            type: {
              array: ['u8', 8];
            };
          },
        ];
      };
    },
    {
      name: 'PoolConfig';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'openToPublic';
            type: 'bool';
          },
          {
            name: 'lockupPeriod';
            type: 'u64';
          },
          {
            name: 'cooldownPeriod';
            type: 'u64';
          },
          {
            name: 'withdrawValidityWindow';
            type: 'u64';
          },
          {
            name: 'liquidityCap';
            type: 'u64';
          },
          {
            name: 'delegateDrawdownFee';
            type: 'u64';
          },
          {
            name: 'delegateRepaymentFee';
            type: 'u64';
          },
          {
            name: 'treasuryRepaymentFee';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'LoanState';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Pending';
          },
          {
            name: 'Active';
          },
          {
            name: 'Closed';
          },
        ];
      };
    },
  ];
  events: [
    {
      name: 'GlobalsInitializeEvent';
      fields: [
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'governor';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'globalAdmin';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'treasuryDrawdownFee';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'GlobalsSetProtocolPauseEvent';
      fields: [
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'pause';
          type: 'bool';
          index: false;
        },
      ];
    },
    {
      name: 'GlobalsSetPendingGovernorEvent';
      fields: [
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'pendingGovernor';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'GlobalsAcceptGovernorEvent';
      fields: [
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'governor';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'GlobalsSetGlobalAdminEvent';
      fields: [
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'globalAdmin';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'GlobalsSetTreasuryDrawdownFeeEvent';
      fields: [
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'treasuryDrawdownFee';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'GlobalsClaimTreasuryFeesEvent';
      fields: [
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'claimAmount';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'GlobalsSetDelegateEvent';
      fields: [
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'delegate';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'GlobalsRemoveDelegateEvent';
      fields: [
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'delegate';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'GlobalsSetBaseMintEvent';
      fields: [
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'baseMint';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'GlobalsRemoveBaseMintEvent';
      fields: [
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'baseMint';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'PoolInitializeEvent';
      fields: [
        {
          name: 'pool';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'delegate';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'config';
          type: {
            defined: 'PoolConfig';
          };
          index: false;
        },
      ];
    },
    {
      name: 'PoolSetConfigEvent';
      fields: [
        {
          name: 'pool';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'config';
          type: {
            defined: 'PoolConfig';
          };
          index: false;
        },
      ];
    },
    {
      name: 'PoolClaimDelegateFeesEvent';
      fields: [
        {
          name: 'pool';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'claimAmount';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'PoolSetPendingDelegateEvent';
      fields: [
        {
          name: 'pool';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'pendingDelegate';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'PoolAcceptDelegateEvent';
      fields: [
        {
          name: 'pool';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'delegate';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'LenderInitializeEvent';
      fields: [
        {
          name: 'lender';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'pool';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'owner';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'LenderSetAllowlistedEvent';
      fields: [
        {
          name: 'lender';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'allowlisted';
          type: 'bool';
          index: false;
        },
      ];
    },
    {
      name: 'LenderDepositEvent';
      fields: [
        {
          name: 'lender';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'depositAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'sharesIssued';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'LenderUnlockDepositEvent';
      fields: [
        {
          name: 'lender';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'fundsUnlocked';
          type: 'bool';
          index: false;
        },
      ];
    },
    {
      name: 'WithdrawalRequestInitializeEvent';
      fields: [
        {
          name: 'withdrawalRequest';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'lender';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'pool';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'shares';
          type: 'u64';
          index: false;
        },
        {
          name: 'createTs';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'WithdrawalRequestExecuteEvent';
      fields: [
        {
          name: 'withdrawalRequest';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'assetWithdrawnAmount';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'WithdrawalRequestCloseEvent';
      fields: [
        {
          name: 'withdrawalRequest';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'LoanInitializeEvent';
      fields: [
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'pool';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'borrower';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'globals';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'config';
          type: {
            defined: 'LoanConfig';
          };
          index: false;
        },
      ];
    },
    {
      name: 'LoanFundEvent';
      fields: [
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'treasuryFee';
          type: 'u64';
          index: false;
        },
        {
          name: 'delegateFee';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'LoanDrawdownEvent';
      fields: [
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'LoanEarlyCloseEvent';
      fields: [
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'principal';
          type: 'u64';
          index: false;
        },
        {
          name: 'interest';
          type: 'u64';
          index: false;
        },
        {
          name: 'netInterest';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'LoanMakePaymentEvent';
      fields: [
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'principal';
          type: 'u64';
          index: false;
        },
        {
          name: 'interest';
          type: 'u64';
          index: false;
        },
        {
          name: 'netInterest';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'LoanDefaultEvent';
      fields: [
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
        {
          name: 'recovered';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'LoanCloseEvent';
      fields: [
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'InvariantError';
      msg: 'One of the program invariants was violated';
    },
    {
      code: 6001;
      name: 'CalculationError';
      msg: 'A checked calculation yielded an error';
    },
    {
      code: 6002;
      name: 'NoSharesUnlocked';
      msg: 'No shares were unlocked';
    },
    {
      code: 6003;
      name: 'InvalidState';
      msg: 'Invalid State';
    },
    {
      code: 6004;
      name: 'InvalidDelegate';
      msg: 'Invalid delegate';
    },
    {
      code: 6005;
      name: 'ProtocolPaused';
      msg: 'Protocol is paused';
    },
    {
      code: 6006;
      name: 'InsufficientFunds';
      msg: 'Insufficient funds';
    },
    {
      code: 6007;
      name: 'WithdrawalWindowNotOpen';
      msg: 'Withdrawal window is not open yet';
    },
    {
      code: 6008;
      name: 'WithdrawalWindowPassed';
      msg: 'Withdrawal request has expired';
    },
    {
      code: 6009;
      name: 'LatePayment';
      msg: 'Payment is late';
    },
    {
      code: 6010;
      name: 'LiquidityCapReached';
      msg: 'Liquidity cap of the pool is reached';
    },
    {
      code: 6011;
      name: 'PoolLocked';
      msg: 'Pool is locked from this action';
    },
    {
      code: 6012;
      name: 'NeedToClaim';
      msg: 'Unclaimed funds need to be claimed first';
    },
    {
      code: 6013;
      name: 'KeyNotFound';
      msg: 'Matching key could not be found';
    },
    {
      code: 6014;
      name: 'DelegateNotFound';
      msg: 'Matching delegate could not be found';
    },
    {
      code: 6015;
      name: 'Unauthorized';
      msg: 'This user is not authorized for this action';
    },
    {
      code: 6016;
      name: 'NotAdmin';
      msg: 'This user is not an admin';
    },
    {
      code: 6017;
      name: 'MaxFee';
      msg: 'Maximum fee rate possible exceeded';
    },
  ];
  metadata: {
    address: '5D9yi4BKrxF8h65NkVE1raCCWFKUs5ngub2ECxhvfaZe';
  };
};

export const USyrupJSON: USyrupIDL = {
  version: '0.1.0',
  name: 'syrup',
  instructions: [
    {
      name: 'globalsInitialize',
      accounts: [
        {
          name: 'governor',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalAdmin',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'nonce',
          type: {
            defined: 'Nonce',
          },
        },
        {
          name: 'treasuryDrawdownFee',
          type: 'u64',
        },
      ],
    },
    {
      name: 'globalsSetProtocolPause',
      accounts: [
        {
          name: 'globalAdmin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globals',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'pause',
          type: 'bool',
        },
      ],
    },
    {
      name: 'globalsSetPendingGovernor',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globals',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'pendingGovernor',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'globalsAcceptGovernor',
      accounts: [
        {
          name: 'governorNominee',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globals',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'globalsSetGlobalAdmin',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'newAdmin',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globals',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'globalsSetTreasuryDrawdownFee',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globals',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'treasuryDrawdownFee',
          type: 'u64',
        },
      ],
    },
    {
      name: 'globalsInitTreasury',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governor',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'treasuryLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'baseMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'globalsClaimTreasuryFees',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governorLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'treasuryLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'claimAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'globalsSetDelegate',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globals',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'delegate',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'globalsRemoveDelegate',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globals',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'delegate',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'globalsSetBaseMint',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globals',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseMint',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'globalsRemoveBaseMint',
      accounts: [
        {
          name: 'governor',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globals',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseMint',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'poolInitialize',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'delegate',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'delegateClaimable',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'baseMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'poolLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'sharesMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'nonce',
          type: {
            defined: 'Nonce',
          },
        },
        {
          name: 'config',
          type: {
            defined: 'PoolConfig',
          },
        },
      ],
    },
    {
      name: 'poolSetConfig',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'delegate',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'config',
          type: {
            defined: 'PoolConfig',
          },
        },
      ],
    },
    {
      name: 'poolClaimDelegateFees',
      accounts: [
        {
          name: 'delegate',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'delegateLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'delegateClaimable',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'claimAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'poolSetPendingDelegate',
      accounts: [
        {
          name: 'delegate',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'pendingDelegate',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'poolAcceptDelegate',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'delegateNominee',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'lenderInitialize',
      accounts: [
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'sharesMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lender',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lockedShares',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lenderShares',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'lenderSetAllowlisted',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'delegate',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lender',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'allowlist',
          type: 'bool',
        },
      ],
    },
    {
      name: 'lenderDeposit',
      accounts: [
        {
          name: 'lender',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lenderUser',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'poolLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'sharesMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lockedShares',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lenderShares',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lenderLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'depositAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'lenderUnlockDeposit',
      accounts: [
        {
          name: 'lender',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lenderUser',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lockedShares',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lenderShares',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'withdrawalRequestInitialize',
      accounts: [
        {
          name: 'lender',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lenderOwner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'sharesMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lenderShareAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'withdrawalRequest',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'withdrawalRequestLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'nonce',
          type: {
            defined: 'Nonce',
          },
        },
        {
          name: 'shares',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawalRequestExecute',
      accounts: [
        {
          name: 'withdrawalRequest',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lenderOwner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'lender',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'baseMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'poolLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'sharesMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'withdrawalRequestLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lenderLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'withdrawalRequestClose',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'withdrawalRequest',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lenderOwner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lender',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lenderShareAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'withdrawalRequestLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'loanInitialize',
      accounts: [
        {
          name: 'borrower',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'loanLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'baseMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'nonce',
          type: {
            defined: 'Nonce',
          },
        },
        {
          name: 'config',
          type: {
            defined: 'LoanConfig',
          },
        },
      ],
    },
    {
      name: 'loanFund',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'loanLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'delegate',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'delegateClaimable',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'treasuryLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'baseMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'poolLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'loanDrawdown',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'borrower',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'borrowerLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'loan',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'loanLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'loanEarlyClose',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'borrower',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'baseMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'borrowerLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'treasuryLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'delegateClaimable',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'loanMakePayment',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'borrower',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'baseMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'borrowerLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'treasuryLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'delegateClaimable',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'loanDefault',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'delegate',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'loanLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'loanClose',
      accounts: [
        {
          name: 'globals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'loanLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'borrower',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'borrowerLocker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'Globals',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'governor',
            type: 'publicKey',
          },
          {
            name: 'pendingGovernor',
            type: 'publicKey',
          },
          {
            name: 'globalAdmin',
            type: 'publicKey',
          },
          {
            name: 'delegates',
            type: {
              array: ['publicKey', 16],
            },
          },
          {
            name: 'baseMints',
            type: {
              array: ['publicKey', 16],
            },
          },
          {
            name: 'treasuryDrawdownFee',
            type: 'u64',
          },
          {
            name: 'protocolPaused',
            type: 'bool',
          },
          {
            name: 'nonce',
            type: {
              defined: 'Nonce',
            },
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'padding0',
            type: 'u128',
          },
          {
            name: 'padding1',
            type: 'u128',
          },
          {
            name: 'padding2',
            type: 'u128',
          },
          {
            name: 'padding3',
            type: 'u128',
          },
          {
            name: 'padding4',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'Lender',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pool',
            type: 'publicKey',
          },
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'allowlisted',
            type: 'bool',
          },
          {
            name: 'depositTs',
            type: 'u64',
          },
          {
            name: 'lockedSharesAmount',
            type: 'u64',
          },
          {
            name: 'lockedShares',
            type: 'publicKey',
          },
          {
            name: 'lenderShares',
            type: 'publicKey',
          },
          {
            name: 'lenderBump',
            type: 'u8',
          },
          {
            name: 'lockedSharesBump',
            type: 'u8',
          },
          {
            name: 'padding0',
            type: 'u128',
          },
          {
            name: 'padding1',
            type: 'u128',
          },
          {
            name: 'padding2',
            type: 'u128',
          },
          {
            name: 'padding3',
            type: 'u128',
          },
          {
            name: 'padding4',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'Loan',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'globals',
            type: 'publicKey',
          },
          {
            name: 'borrower',
            type: 'publicKey',
          },
          {
            name: 'pool',
            type: 'publicKey',
          },
          {
            name: 'baseMint',
            type: 'publicKey',
          },
          {
            name: 'locker',
            type: 'publicKey',
          },
          {
            name: 'config',
            type: {
              defined: 'LoanConfig',
            },
          },
          {
            name: 'state',
            type: {
              defined: 'LoanState',
            },
          },
          {
            name: 'createdTs',
            type: 'u64',
          },
          {
            name: 'fundedTs',
            type: 'u64',
          },
          {
            name: 'nextPaymentTs',
            type: 'u64',
          },
          {
            name: 'payments',
            type: 'u64',
          },
          {
            name: 'principal',
            type: 'u64',
          },
          {
            name: 'nonce',
            type: {
              defined: 'Nonce',
            },
          },
          {
            name: 'loanBump',
            type: 'u8',
          },
          {
            name: 'lockerBump',
            type: 'u8',
          },
          {
            name: 'padding0',
            type: 'u128',
          },
          {
            name: 'padding1',
            type: 'u128',
          },
          {
            name: 'padding2',
            type: 'u128',
          },
          {
            name: 'padding3',
            type: 'u128',
          },
          {
            name: 'padding4',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'Pool',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'globals',
            type: 'publicKey',
          },
          {
            name: 'delegate',
            type: 'publicKey',
          },
          {
            name: 'pendingDelegate',
            type: 'publicKey',
          },
          {
            name: 'delegateClaimable',
            type: 'publicKey',
          },
          {
            name: 'config',
            type: {
              defined: 'PoolConfig',
            },
          },
          {
            name: 'baseMint',
            type: 'publicKey',
          },
          {
            name: 'locker',
            type: 'publicKey',
          },
          {
            name: 'totalValue',
            type: 'u64',
          },
          {
            name: 'sharesMint',
            type: 'publicKey',
          },
          {
            name: 'sharesOutstanding',
            type: 'u64',
          },
          {
            name: 'nonce',
            type: {
              defined: 'Nonce',
            },
          },
          {
            name: 'poolBump',
            type: 'u8',
          },
          {
            name: 'lockerBump',
            type: 'u8',
          },
          {
            name: 'sharesMintBump',
            type: 'u8',
          },
          {
            name: 'delegateClaimableBump',
            type: 'u8',
          },
          {
            name: 'padding0',
            type: 'u128',
          },
          {
            name: 'padding1',
            type: 'u128',
          },
          {
            name: 'padding2',
            type: 'u128',
          },
          {
            name: 'padding3',
            type: 'u128',
          },
          {
            name: 'padding4',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'WithdrawalRequest',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pool',
            type: 'publicKey',
          },
          {
            name: 'lender',
            type: 'publicKey',
          },
          {
            name: 'createTs',
            type: 'u64',
          },
          {
            name: 'shares',
            type: 'u64',
          },
          {
            name: 'locker',
            type: 'publicKey',
          },
          {
            name: 'nonce',
            type: {
              defined: 'Nonce',
            },
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'lockerBump',
            type: 'u8',
          },
          {
            name: 'padding0',
            type: 'u128',
          },
          {
            name: 'padding1',
            type: 'u128',
          },
          {
            name: 'padding2',
            type: 'u128',
          },
          {
            name: 'padding3',
            type: 'u128',
          },
          {
            name: 'padding4',
            type: 'u128',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'LoanConfig',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'gracePeriod',
            type: 'u64',
          },
          {
            name: 'paymentInterval',
            type: 'u64',
          },
          {
            name: 'paymentsRequested',
            type: 'u64',
          },
          {
            name: 'interestRate',
            type: 'u64',
          },
          {
            name: 'earlyFeeRate',
            type: 'u64',
          },
          {
            name: 'lateFeeRate',
            type: 'u64',
          },
          {
            name: 'lateInterestPremium',
            type: 'u64',
          },
          {
            name: 'principalRequested',
            type: 'u64',
          },
          {
            name: 'endingPrincipal',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'Nonce',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'value',
            type: {
              array: ['u8', 8],
            },
          },
        ],
      },
    },
    {
      name: 'PoolConfig',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'openToPublic',
            type: 'bool',
          },
          {
            name: 'lockupPeriod',
            type: 'u64',
          },
          {
            name: 'cooldownPeriod',
            type: 'u64',
          },
          {
            name: 'withdrawValidityWindow',
            type: 'u64',
          },
          {
            name: 'liquidityCap',
            type: 'u64',
          },
          {
            name: 'delegateDrawdownFee',
            type: 'u64',
          },
          {
            name: 'delegateRepaymentFee',
            type: 'u64',
          },
          {
            name: 'treasuryRepaymentFee',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'LoanState',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Pending',
          },
          {
            name: 'Active',
          },
          {
            name: 'Closed',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'GlobalsInitializeEvent',
      fields: [
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'governor',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'globalAdmin',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'treasuryDrawdownFee',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'GlobalsSetProtocolPauseEvent',
      fields: [
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'pause',
          type: 'bool',
          index: false,
        },
      ],
    },
    {
      name: 'GlobalsSetPendingGovernorEvent',
      fields: [
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'pendingGovernor',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'GlobalsAcceptGovernorEvent',
      fields: [
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'governor',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'GlobalsSetGlobalAdminEvent',
      fields: [
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'globalAdmin',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'GlobalsSetTreasuryDrawdownFeeEvent',
      fields: [
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'treasuryDrawdownFee',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'GlobalsClaimTreasuryFeesEvent',
      fields: [
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'claimAmount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'GlobalsSetDelegateEvent',
      fields: [
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'delegate',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'GlobalsRemoveDelegateEvent',
      fields: [
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'delegate',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'GlobalsSetBaseMintEvent',
      fields: [
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'baseMint',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'GlobalsRemoveBaseMintEvent',
      fields: [
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'baseMint',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'PoolInitializeEvent',
      fields: [
        {
          name: 'pool',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'delegate',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'config',
          type: {
            defined: 'PoolConfig',
          },
          index: false,
        },
      ],
    },
    {
      name: 'PoolSetConfigEvent',
      fields: [
        {
          name: 'pool',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'config',
          type: {
            defined: 'PoolConfig',
          },
          index: false,
        },
      ],
    },
    {
      name: 'PoolClaimDelegateFeesEvent',
      fields: [
        {
          name: 'pool',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'claimAmount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'PoolSetPendingDelegateEvent',
      fields: [
        {
          name: 'pool',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'pendingDelegate',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'PoolAcceptDelegateEvent',
      fields: [
        {
          name: 'pool',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'delegate',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'LenderInitializeEvent',
      fields: [
        {
          name: 'lender',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'pool',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'owner',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'LenderSetAllowlistedEvent',
      fields: [
        {
          name: 'lender',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'allowlisted',
          type: 'bool',
          index: false,
        },
      ],
    },
    {
      name: 'LenderDepositEvent',
      fields: [
        {
          name: 'lender',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'depositAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'sharesIssued',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'LenderUnlockDepositEvent',
      fields: [
        {
          name: 'lender',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'fundsUnlocked',
          type: 'bool',
          index: false,
        },
      ],
    },
    {
      name: 'WithdrawalRequestInitializeEvent',
      fields: [
        {
          name: 'withdrawalRequest',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'lender',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'pool',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'shares',
          type: 'u64',
          index: false,
        },
        {
          name: 'createTs',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'WithdrawalRequestExecuteEvent',
      fields: [
        {
          name: 'withdrawalRequest',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'assetWithdrawnAmount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'WithdrawalRequestCloseEvent',
      fields: [
        {
          name: 'withdrawalRequest',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'LoanInitializeEvent',
      fields: [
        {
          name: 'loan',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'pool',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'borrower',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'globals',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'config',
          type: {
            defined: 'LoanConfig',
          },
          index: false,
        },
      ],
    },
    {
      name: 'LoanFundEvent',
      fields: [
        {
          name: 'loan',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'treasuryFee',
          type: 'u64',
          index: false,
        },
        {
          name: 'delegateFee',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'LoanDrawdownEvent',
      fields: [
        {
          name: 'loan',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'LoanEarlyCloseEvent',
      fields: [
        {
          name: 'loan',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'principal',
          type: 'u64',
          index: false,
        },
        {
          name: 'interest',
          type: 'u64',
          index: false,
        },
        {
          name: 'netInterest',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'LoanMakePaymentEvent',
      fields: [
        {
          name: 'loan',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'principal',
          type: 'u64',
          index: false,
        },
        {
          name: 'interest',
          type: 'u64',
          index: false,
        },
        {
          name: 'netInterest',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'LoanDefaultEvent',
      fields: [
        {
          name: 'loan',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'recovered',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'LoanCloseEvent',
      fields: [
        {
          name: 'loan',
          type: 'publicKey',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'InvariantError',
      msg: 'One of the program invariants was violated',
    },
    {
      code: 6001,
      name: 'CalculationError',
      msg: 'A checked calculation yielded an error',
    },
    {
      code: 6002,
      name: 'NoSharesUnlocked',
      msg: 'No shares were unlocked',
    },
    {
      code: 6003,
      name: 'InvalidState',
      msg: 'Invalid State',
    },
    {
      code: 6004,
      name: 'InvalidDelegate',
      msg: 'Invalid delegate',
    },
    {
      code: 6005,
      name: 'ProtocolPaused',
      msg: 'Protocol is paused',
    },
    {
      code: 6006,
      name: 'InsufficientFunds',
      msg: 'Insufficient funds',
    },
    {
      code: 6007,
      name: 'WithdrawalWindowNotOpen',
      msg: 'Withdrawal window is not open yet',
    },
    {
      code: 6008,
      name: 'WithdrawalWindowPassed',
      msg: 'Withdrawal request has expired',
    },
    {
      code: 6009,
      name: 'LatePayment',
      msg: 'Payment is late',
    },
    {
      code: 6010,
      name: 'LiquidityCapReached',
      msg: 'Liquidity cap of the pool is reached',
    },
    {
      code: 6011,
      name: 'PoolLocked',
      msg: 'Pool is locked from this action',
    },
    {
      code: 6012,
      name: 'NeedToClaim',
      msg: 'Unclaimed funds need to be claimed first',
    },
    {
      code: 6013,
      name: 'KeyNotFound',
      msg: 'Matching key could not be found',
    },
    {
      code: 6014,
      name: 'DelegateNotFound',
      msg: 'Matching delegate could not be found',
    },
    {
      code: 6015,
      name: 'Unauthorized',
      msg: 'This user is not authorized for this action',
    },
    {
      code: 6016,
      name: 'NotAdmin',
      msg: 'This user is not an admin',
    },
    {
      code: 6017,
      name: 'MaxFee',
      msg: 'Maximum fee rate possible exceeded',
    },
  ],
  metadata: {
    address: '5D9yi4BKrxF8h65NkVE1raCCWFKUs5ngub2ECxhvfaZe',
  },
};
