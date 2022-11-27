import { nu64, struct, u8 } from 'buffer-layout'
import { AccountMetaData } from '@solana/spl-governance'
import { Connection } from '@solana/web3.js'
import { SyrupClient, SYRUP_ADDRESSES } from '@maplelabs/syrup-sdk'
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers'
import { nativeToUi } from '@blockworks-foundation/mango-client'
import { tryGetMint, tryGetTokenMint } from '@utils/tokens'
import { SolanaProvider } from '@saberhq/solana-contrib'
import {
  DataUIAmount,
  DataUIRow,
  DataUILabel,
  InstructionDataUI,
  DataUIAddress,
  DataUIDateUTC,
  DataUIWarning,
} from '@components/InstructionDataUI'

export const IGNORE_NONCE_ACCOUNT_LAYOUT = Array.from(new Array(7)).map(u8)

export const MAPLE_FINANCE_PROGRAM_INSTRUCTIONS = {
  [SYRUP_ADDRESSES.Syrup.toBase58()]: {
    248: {
      name: 'Maple Finance - Lender Initialize',
      accounts: [
        { name: 'Payer' },
        { name: 'Owner' },
        { name: 'Pool' },
        { name: 'Shares Mint' },
        { name: 'Lender' },
        { name: 'Locked Shares' },
        { name: 'Lender Shares' },
        { name: 'System Program' },
        { name: 'Token Program' },
        { name: 'Associated Token Program' },
        { name: 'Rent' },
      ],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        return <></>
      },
    },

    151: {
      name: 'Maple Finance - Lender Deposit',
      accounts: [
        { name: 'Lender' },
        { name: 'Lender User' },
        { name: 'Pool' },
        { name: 'Globals' },
        { name: 'Pool Locker' },
        { name: 'Shares Mint' },
        { name: 'Locked Shares' },
        { name: 'Lender Shares' },
        { name: 'Lender Locker' },
        { name: 'System Program' },
        { name: 'Token Program' },
        { name: 'Rent' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('depositAmount'),
        ])

        const { depositAmount } = dataLayout.decode(Buffer.from(data)) as any

        const lenderLocker = accounts[8].pubkey

        const poolMintInfo = await tryGetTokenMint(connection, lenderLocker)
        if (!poolMintInfo) throw new Error('Cannot load mint pool info')

        const uiAmount = nativeToUi(
          depositAmount,
          poolMintInfo.account.decimals
        )

        return (
          <InstructionDataUI>
            <DataUIRow>
              <DataUILabel label="Ui amount to deposit" />
              <DataUIAmount amount={uiAmount} symbol="" />
            </DataUIRow>
          </InstructionDataUI>
        )
      },
    },

    17: {
      name: 'Maple Finance - Lender Unlock Deposit',
      accounts: [
        { name: 'Lender' },
        { name: 'Lender User' },
        { name: 'Pool' },
        { name: 'Globals' },
        { name: 'Locked Shares' },
        { name: 'Lender Shares' },
        { name: 'Token Program' },
      ],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        return <></>
      },
    },

    121: {
      name: 'Maple Finance - Withdrawal Request Initialize',
      accounts: [
        { name: 'Lender' },
        { name: 'Lender Owner' },
        { name: 'Pool' },
        { name: 'Globals' },
        { name: 'Shares Mint' },
        { name: 'Lender Share Account' },
        { name: 'Withdrawal Request' },
        { name: 'Withdrawal Request Locker' },
        { name: 'System Program' },
        { name: 'Token Program' },
        { name: 'Rent' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          ...IGNORE_NONCE_ACCOUNT_LAYOUT,
          nu64('withdrawAmount'),
        ])

        const { withdrawAmount } = dataLayout.decode(Buffer.from(data)) as any

        const syrupClient = SyrupClient.load({
          // SolanaProvider is enough for syrup client to work
          provider: SolanaProvider.init({
            connection: connection,
            wallet: null as any,
          }) as any,
        })

        const pool = accounts[2].pubkey

        const poolData = await syrupClient.program.account.pool.fetch(pool)

        const baseMintInfo = await tryGetMint(connection, poolData.baseMint)
        if (!baseMintInfo) {
          throw new Error(
            `Cannot load maple pool base mint info for ${poolData.baseMint.toBase58()}`
          )
        }

        const cooldownPeriodDate = new Date()

        cooldownPeriodDate.setTime(
          new Date().getTime() +
            // Transform seconds to milliseconds for timestamp
            // Cast to any because the type is not correct
            (poolData.config as any).cooldownPeriod.toNumber() * 1_000
        )

        const uiAmount = nativeToUi(
          withdrawAmount,
          baseMintInfo.account.decimals
        )

        return (
          <InstructionDataUI>
            <DataUIRow>
              <DataUILabel label="Ui amount to withdraw" />
              <DataUIAmount amount={uiAmount} symbol="" />
            </DataUIRow>
            <DataUIRow>
              <DataUILabel label="Withdrawal Request Address" />
              <DataUIAddress address={accounts[6].pubkey} />
            </DataUIRow>
            <DataUIRow>
              <DataUIWarning message="Withdrawal request is subject to cool down before being executable" />
            </DataUIRow>
            <DataUIRow>
              <DataUILabel label="Withdrawal request cool off date" />
              <DataUIDateUTC date={cooldownPeriodDate} />
            </DataUIRow>
          </InstructionDataUI>
        )
      },
    },

    90: {
      name: 'Maple Finance - Withdrawal Request Execute',
      accounts: [
        { name: 'Withdrawal Request' },
        { name: 'Lender Owner' },
        { name: 'Lender' },
        { name: 'Pool' },
        { name: 'Globals' },
        { name: 'Base Mint' },
        { name: 'Pool Locker' },
        { name: 'Shares Mint' },
        { name: 'Withdrawal Request Locker' },
        { name: 'Lender Locker' },
        { name: 'System Program' },
        { name: 'Token Program' },
      ],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        return (
          <InstructionDataUI>
            <DataUIRow>
              <DataUILabel label="Withdrawal Request Address" />
              <DataUIAddress address={accounts[0].pubkey} />
            </DataUIRow>
          </InstructionDataUI>
        )
      },
    },

    204: {
      name: 'Maple Finance - Withdrawal Request Close',
      accounts: [
        { name: 'Globals' },
        { name: 'Withdrawal Request' },
        { name: 'Lender Owner' },
        { name: 'Pool' },
        { name: 'Lender' },
        { name: 'Lender Share Account' },
        { name: 'Withdrawal Request Locker' },
        { name: 'System Program' },
        { name: 'Token Program' },
      ],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        return (
          <InstructionDataUI>
            <DataUIRow>
              <DataUILabel label="Withdrawal Request Address" />
              <DataUIAddress address={accounts[1].pubkey} />
            </DataUIRow>
          </InstructionDataUI>
        )
      },
    },
  },
}
