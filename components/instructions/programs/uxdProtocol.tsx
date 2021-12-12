import { Connection } from '@solana/web3.js'
import { struct, u8, u48 } from 'buffer-layout'
import { AccountMetaData } from '../../../models/accounts'

export const UXD_PROGRAM_INSTRUCTIONS = {
  '73yvDSPxhtXmi8Gaheobm32n3jMdbvQzCahXgqqE12My': {
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
