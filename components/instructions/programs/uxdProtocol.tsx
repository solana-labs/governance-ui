import { Connection } from '@solana/web3.js'
import { struct, u8, u48 } from 'buffer-layout'
import { AccountMetaData } from '../../../models/accounts'

const UXD_INIT_CONTROLLER_INSTRUCTION = {
  FXY9qRsCxg6ioEFLu9ECQ5v2YF2qjeE1Tcnin3DUBW76: {
    1: {
      name: 'UXD - Initialize Controller',
      accounts: [
        'authority',
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
  },
}

const UXD_SET_REDEEMABLE_GLOBAL_SUPPLY_CAP_INSTRUCTION = {
  1: {
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
}

const UXD_REGISTER_MANGO_DEPOSITORY_INSTRUCTION = {
  1: {
    name: 'UXD - Register Mango Depository',
    accounts: [
      'authority',
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
}

export const UXD_INSTRUCTIONS = {
  ...UXD_INIT_CONTROLLER_INSTRUCTION,
  ...UXD_SET_REDEEMABLE_GLOBAL_SUPPLY_CAP_INSTRUCTION,
  ...UXD_REGISTER_MANGO_DEPOSITORY_INSTRUCTION,
}
