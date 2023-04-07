import { PaymentStreaming } from '@mean-dao/payment-streaming'
import { PublicKey } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'

const STREAM_V2_PROGRAM_ADDRESS_DEVNET =
  'MSPdQo5ZdrPh6rU1LsvUv5nRhAnj1mj6YQEqBUq8YwZ'
const STREAM_V2_PROGRAM_ADDRESS_MAINNET =
  'MSPCUMbLfy2MeT6geLMMzrUkv1Tx88XRApaVRdyxTuu'

export default function (connection: ConnectionContext) {
  const streamV2ProgramAddressString =
    connection.cluster === 'mainnet'
      ? STREAM_V2_PROGRAM_ADDRESS_MAINNET
      : STREAM_V2_PROGRAM_ADDRESS_DEVNET

  const streamV2ProgramAddress = new PublicKey(streamV2ProgramAddressString)

  return new PaymentStreaming(
    connection.current,
    streamV2ProgramAddress,
    'confirmed'
  )
}
