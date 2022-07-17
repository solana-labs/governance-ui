import {
  AnchorProvider,
  BorshInstructionCoder,
  Program,
} from '@project-serum/anchor'
import { Connection, Keypair } from '@solana/web3.js'
import { MORTAR_PROGRAM_ID } from 'pages/dao/[symbol]/proposal/components/instructions/Solana/SagaPhone/mortar'
import {
  IDL,
  Mortar,
} from 'pages/dao/[symbol]/proposal/components/instructions/Solana/SagaPhone/schema'

export const SAGA_PHONE = {
  [MORTAR_PROGRAM_ID.toBase58()]: {
    194: {
      name: 'Purchase',
      accounts: [
        'Issuer',
        'Purchaser',
        'Payer',
        'Receipt',
        'Receipt Tokens',
        'Purchaser Tokens',
      ],
      getDataUI: async (connection: Connection, data: Uint8Array) => {
        try {
          return <div></div>
        } catch (e) {
          console.log(e)
          return <div>{JSON.stringify(data)}</div>
        }
      },
    },
    102: {
      name: 'Update Quantity',
      accounts: [
        'Issuer',
        'Purchaser',
        'Receipt',
        'Receipt Tokens',
        'Purchaser Tokens',
      ],
      getDataUI: async (connection: Connection, data: Uint8Array) => {
        try {
          const program = new Program<Mortar>(
            IDL,
            MORTAR_PROGRAM_ID,
            new AnchorProvider(null as any, Keypair.generate() as any, {})
          )
          const decodedInstructionData = new BorshInstructionCoder(
            program.idl
          ).decode(Buffer.from(data))?.data as any
          return (
            <div>quantity: {decodedInstructionData.newQuantity.toNumber()}</div>
          )
        } catch (e) {
          console.log(e)
          return <div>{JSON.stringify(data)}</div>
        }
      },
    },
  },
}
