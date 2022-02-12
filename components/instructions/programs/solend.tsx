import { AccountMetaData } from '@solana/spl-governance'
import { Connection } from '@solana/web3.js'
import { LendingInstruction } from '@solendprotocol/solend-sdk/dist/instructions/instruction'
import SolendConfiguration from '@tools/sdk/solend/configuration'

import { nu64, struct, u8 } from 'buffer-layout'

export const SOLEND_PROGRAM_INSTRUCTIONS = {
  [SolendConfiguration.programID.toBase58()]: {
    [LendingInstruction.InitObligation]: {
      name: 'Solend - Init Obligation',
      accounts: [
        'Obligation',
        'Lending Market Account',
        'Obligation Owner',
        'Sysvar: Clock',
        'Rent Program',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const mint = accounts[2].pubkey.toString()

        return (
          <div className="flex flex-col">
            <div className="flex justify-between">
              <span>Init obligation for:</span>
              <span>{mint}</span>
            </div>
          </div>
        )
      },
    },

    [LendingInstruction.RefreshObligation]: {
      name: 'Solend - Refresh Obligation',
      accounts: [
        'Obligation',
        'Sysvar: Clock',
        '... Deposit Reserve',
        '... Borrow Reserve',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        // All accounts starting at index 2 are reserve accounts
        const reserveAccounts = accounts.slice(2)

        const reserveNames = reserveAccounts.map(
          (reserveAcc) =>
            SolendConfiguration.getTokenNameByReservePublicKey(
              reserveAcc.pubkey
            ) ?? 'unknown'
        )

        return (
          <div className="flex flex-col">
            {reserveNames.map((reserveName, reserveNameIdx) => (
              <div key={reserveName} className="flex justify-between">
                <span>Reserve #{reserveNameIdx + 1}</span>
                <span>{reserveName}</span>
              </div>
            ))}
          </div>
        )
      },
    },

    [LendingInstruction.RefreshReserve]: {
      name: 'Solend - Refresh Reserve',
      accounts: ['Reserve'],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const reserve = accounts[0]

        const tokenName =
          SolendConfiguration.getTokenNameByReservePublicKey(reserve.pubkey) ??
          'unknown'

        return (
          <div className="flex justify-between">
            <span>Reserve</span>
            <span>{tokenName}</span>
          </div>
        )
      },
    },

    [LendingInstruction.DepositReserveLiquidityAndObligationCollateral]: {
      name: 'Solend - Deposit Reserve Liquidity And Obligation Collateral',
      accounts: [
        'Source Liquidity',
        'Source Collateral',
        'Reserve',
        'Reserve Liquidity Supply',
        'Reserve Collateral Mint',
        'Lending Market',
        'Destination Collateral',
        'Obligation',
        'Obligation Owner',
        'Pyth Oracle',
        'Switchboard Feed Address',
        'Transfer Authority',
        'Sysvar: Clock',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([u8('instruction'), nu64('liquidityAmount')])

        const { liquidityAmount } = dataLayout.decode(Buffer.from(data)) as any

        const reserve = accounts[2]

        const tokenName =
          SolendConfiguration.getTokenNameByReservePublicKey(reserve.pubkey) ??
          'unknown'

        return (
          <div className="flex flex-col">
            <div className="flex justify-between">
              <span>Token</span>
              <span>{tokenName}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount</span>
              <span>{liquidityAmount}</span>
            </div>
          </div>
        )
      },
    },

    [LendingInstruction.WithdrawObligationCollateralAndRedeemReserveLiquidity]: {
      name:
        'Solend - Withdraw Obligation Collateral And Redeem Reserve Liquidity',
      accounts: [
        'Source Collateral',
        'Destination Collateral',
        'Withdraw Reserve',
        'Obligation',
        'Lending Market',
        'Lending Market Authority',
        'Destination Liquidity',
        'Reserve Collateral Mint',
        'Reserve Liquidity Supply',
        'Obligation Owner',
        'Transfer Authority',
        'Sysvar: Clock',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([u8('instruction'), nu64('collateralAmount')])

        const { collateralAmount } = dataLayout.decode(Buffer.from(data)) as any

        const reserve = accounts[2]

        const tokenName =
          SolendConfiguration.getTokenNameByReservePublicKey(reserve.pubkey) ??
          'unknown'

        return (
          <div className="flex flex-col">
            <div className="flex justify-between">
              <span>Token</span>
              <span>{tokenName}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount</span>
              <span>{collateralAmount}</span>
            </div>
          </div>
        )
      },
    },
  },
}
