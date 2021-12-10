import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey, Connection } from '@solana/web3.js'
import { MangoDepository } from '@uxdprotocol/uxd-client'
import { uxdClient, initializeMango } from './uxdClient'

const createDepositInsuranceToMangoDepositoryInstruction = async (
  connection: Connection,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  depositoryMint: PublicKey,
  insuranceMint: PublicKey,
  insuranceDepositedAmount: number
): Promise<TransactionInstruction> => {
  const { client, controller } = uxdClient(connection, uxdProgramId)

  const mango = await initializeMango(connection)
  const depository = new MangoDepository(
    depositoryMint,
    'collateralName',
    6,
    insuranceMint,
    'USDC',
    6,
    uxdProgramId
  )

  return client.createDepositInsuranceToMangoDepositoryInstruction(
    insuranceDepositedAmount,
    controller,
    depository,
    mango,
    authority,
    Provider.defaultOptions()
  )
}

export default createDepositInsuranceToMangoDepositoryInstruction
