import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { Controller, MangoDepository } from '@uxdprotocol/uxd-client'
import { ConnectionContext } from 'stores/useWalletStore'
import { uxdClient, initializeMango } from './uxdClient'

const createDepositInsuranceToMangoDepositoryInstruction = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  depositoryMint: PublicKey,
  insuranceMint: PublicKey,
  insuranceDepositedAmount: number,
  controllerPda: PublicKey
): Promise<TransactionInstruction> => {
  const client = uxdClient(connection.current, uxdProgramId)

  const mango = await initializeMango(connection.current, connection.cluster)
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
    { pda: controllerPda } as Controller,
    depository,
    mango,
    authority,
    Provider.defaultOptions()
  )
}

export default createDepositInsuranceToMangoDepositoryInstruction
