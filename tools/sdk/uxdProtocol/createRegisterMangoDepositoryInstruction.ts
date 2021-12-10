import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey, Connection } from '@solana/web3.js'
import { MangoDepository } from '@uxdprotocol/uxd-client'
import { initializeMango, uxdClient } from './uxdClient'

const createRegisterMangoDepositoryInstruction = async (
  connection: Connection,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  payer: PublicKey,
  collateralMint: PublicKey,
  insuranceMint: PublicKey
): Promise<TransactionInstruction> => {
  const mango = await initializeMango(connection)
  const depository = new MangoDepository(
    collateralMint,
    'collateralName',
    6,
    insuranceMint,
    'USDC',
    6,
    uxdProgramId
  )

  const { client, controller } = uxdClient(connection, uxdProgramId)
  return client.createRegisterMangoDepositoryInstruction(
    controller,
    depository,
    mango,
    authority,
    Provider.defaultOptions(),
    payer
  )
}

export default createRegisterMangoDepositoryInstruction
