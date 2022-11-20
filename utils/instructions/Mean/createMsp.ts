import { MSP } from '@mean-dao/msp'
import { ConnectionContext } from '@utils/connection'

const STREAM_V2_PROGRAM_ADDRESS_DEVNET =
  'MSPdQo5ZdrPh6rU1LsvUv5nRhAnj1mj6YQEqBUq8YwZ'
const STREAM_V2_PROGRAM_ADDRESS_MAINNET =
  'MSPCUMbLfy2MeT6geLMMzrUkv1Tx88XRApaVRdyxTuu'

export default function (connection: ConnectionContext) {
  const streamV2ProgramAddress =
    connection.cluster === 'mainnet'
      ? STREAM_V2_PROGRAM_ADDRESS_MAINNET
      : STREAM_V2_PROGRAM_ADDRESS_DEVNET
  const msp = new MSP(connection.endpoint, streamV2ProgramAddress, 'confirmed')
  return msp
}
