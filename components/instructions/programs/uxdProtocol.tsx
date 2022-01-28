import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { struct, u8, u48 } from 'buffer-layout'
import {
  AccountMetaData,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { Wallet } from '@project-serum/sol-wallet-adapter'
import { Program, Provider } from '@project-serum/anchor'
import { uxdIdl } from '@uxdprotocol/uxd-client'
import { u128 } from '@project-serum/borsh'

export const UXD_PROGRAM_INSTRUCTIONS = {
  UXD8m9cvwk4RcSxnX2HZ9VudQCEeDH6fRnB4CAP57Dr: {
    1: {
      name: 'UXD - Initialize Controller',
      accounts: [
        'authority',
        'payer',
        'controller',
        'redeemableMint',
        'systemProgram',
        'tokenProgram',
        'rent',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([
          u8('bump'),
          u8('redeemableBump'),
          u8('redeemableMintDecimals'),
        ])

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.log('args', args)
        return (
          <>
            <p>{args}</p>
          </>
        )
      },
    },
    45: {
      name: 'UXD - Set Redeemable Global Supply Cap',
      accounts: ['authority', 'controller'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
        programId: PublicKey
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          u128('redeemableGlobalSupplyCap'),
        ])

        const itx = new TransactionInstruction({
          programId,
          keys: _accounts,
          data: Buffer.from(data),
        })
        const program = new Program(
          uxdIdl,
          programId,
          new Provider(
            _connection,
            (null as unknown) as Wallet,
            Provider.defaultOptions()
          )
        )
        console.debug(
          'itx',
          program.coder.instruction.decode(
            program.coder.instruction.encode(
              'SetRedeemableGlobalSupplyCap',
              serializeInstructionToBase64(itx)
            )
          )?.data['redeemableGlobalSupplyCap']
        )

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.debug('args', args)
        return (
          <>
            <p>test</p>
          </>
        )
      },
    },
    3: {
      name: 'UXD - Set Mango Depositories Redeemable Supply Soft Cap',
      accounts: ['authority', 'controller'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([u48('redeemable_global_supply_cap')])

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.log('args', args)
        return (
          <>
            <p>{args}</p>
          </>
        )
      },
    },
    4: {
      name: 'UXD - Register Mango Depository',
      accounts: [
        'authority',
        'payer',
        'controller',
        'depository',
        'collateralMint', // BTC/ WSOL.....
        'insuranceMint', // USDC
        'depositoryCollateralPassthroughAccount',
        'depositoryInsurancePassthroughAccount',
        'depositoryMangoAccount',
        'mangoGroup',
        'rent',
        'systemProgram',
        'tokenProgram',
        'mangoProgram',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([u48('redeemable_global_supply_cap')])

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.log('args', args)
        return (
          <>
            <p>{args}</p>
          </>
        )
      },
    },
    5: {
      name: 'UXD - Deposit Insurance To Mango Depository',
      accounts: [
        'authority',
        'controller',
        'depository',
        'insuranceMint',
        'authorityInsurance',
        'depositoryInsurancePassthroughAccount',
        'depositoryMangoAccount',
        // mango accounts for CPI
        'mangoGroup',
        'mangoCache',
        'mangoRootBank',
        'mangoNodeBank',
        'mangoVault',
        //
        'tokenProgram',
        'mangoProgram',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([u48('redeemable_global_supply_cap')])

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.log('args', args)
        return (
          <>
            <p>{args}</p>
          </>
        )
      },
    },
    6: {
      name: 'UXD - Withdraw Insurance From Mango Depository',
      accounts: [
        'authority',
        'controller',
        'depository',
        'insuranceMint',
        'authorityInsurance',
        'depositoryInsurancePassthroughAccount',
        'depositoryMangoAccount',
        // mango accounts for CPI
        'mangoGroup',
        'mangoCache',
        'mangoSigner',
        'mangoRootBank',
        'mangoNodeBank',
        'mangoVault',
        //
        'tokenProgram',
        'mangoProgram',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([u48('redeemable_global_supply_cap')])

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.log('args', args)
        return (
          <>
            <p>{args}</p>
          </>
        )
      },
    },
  },
  CBSkoqgGtB4772H7FqeE6wz56rLbsxxbVjxEG6JmHzwG: {
    1: {
      name: 'UXD - Initialize Controller',
      accounts: [
        'authority',
        'payer',
        'controller',
        'redeemableMint',
        'systemProgram',
        'tokenProgram',
        'rent',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([
          u8('bump'),
          u8('redeemableBump'),
          u8('redeemableMintDecimals'),
        ])

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.log('args', args)
        return (
          <>
            <p>{args}</p>
          </>
        )
      },
    },
    2: {
      name: 'UXD - Set Redeemable Global Supply Cap',
      accounts: ['authority', 'controller'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([u48('redeemable_global_supply_cap')])

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.log('args', args)
        return (
          <>
            <p>{args}</p>
          </>
        )
      },
    },
    3: {
      name: 'UXD - Set Mango Depositories Redeemable Supply Soft Cap',
      accounts: ['authority', 'controller'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([u48('redeemable_global_supply_cap')])

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.log('args', args)
        return (
          <>
            <p>{args}</p>
          </>
        )
      },
    },
    4: {
      name: 'UXD - Register Mango Depository',
      accounts: [
        'authority',
        'payer',
        'controller',
        'depository',
        'collateralMint', // BTC/ WSOL.....
        'insuranceMint', // USDC
        'depositoryCollateralPassthroughAccount',
        'depositoryInsurancePassthroughAccount',
        'depositoryMangoAccount',
        'mangoGroup',
        'rent',
        'systemProgram',
        'tokenProgram',
        'mangoProgram',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([u48('redeemable_global_supply_cap')])

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.log('args', args)
        return (
          <>
            <p>{args}</p>
          </>
        )
      },
    },
    5: {
      name: 'UXD - Deposit Insurance To Mango Depository',
      accounts: [
        'authority',
        'controller',
        'depository',
        'insuranceMint',
        'authorityInsurance',
        'depositoryInsurancePassthroughAccount',
        'depositoryMangoAccount',
        // mango accounts for CPI
        'mangoGroup',
        'mangoCache',
        'mangoSigner',
        'mangoRootBank',
        'mangoNodeBank',
        'mangoVault',
        //
        'tokenProgram',
        'mangoProgram',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([u48('redeemable_global_supply_cap')])

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.log('args', args)
        return (
          <>
            <p>{args}</p>
          </>
        )
      },
    },
    6: {
      name: 'UXD - Withdraw Insurance From Mango Depository',
      accounts: [
        'authority',
        'controller',
        'depository',
        'insuranceMint',
        'authorityInsurance',
        'depositoryInsurancePassthroughAccount',
        'depositoryMangoAccount',
        // mango accounts for CPI
        'mangoGroup',
        'mangoCache',
        'mangoRootBank',
        'mangoNodeBank',
        'mangoVault',
        //
        'tokenProgram',
        'mangoProgram',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([u48('redeemable_global_supply_cap')])

        const args = dataLayout.decode(Buffer.from(data)) as any
        console.log('args', args)
        return (
          <>
            <p>{args}</p>
          </>
        )
      },
    },
  },
}
