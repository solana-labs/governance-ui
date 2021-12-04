import { Connection } from '@solana/web3.js'
import { struct, u8 } from 'buffer-layout'
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

export const UXD_INSTRUCTIONS = {
  ...UXD_INIT_CONTROLLER_INSTRUCTION,
}
