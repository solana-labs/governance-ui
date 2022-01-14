import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { Controller } from '@uxdprotocol/uxd-client'
import type { ConnectionContext } from 'utils/connection'
import {
  uxdClient,
  initializeMango,
  instantiateMangoDepository,
  getControllerPda,
  getDepositoryMintKey,
  getInsuranceMintKey,
} from './uxdClient'

const createWithdrawInsuranceFromMangoDepositoryInstruction = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  depositoryMintName: string,
  insuranceMintName: string,
  insuranceWithdrawnAmount: number
): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId)
  console.log(depositoryMintName, insuranceMintName)
  const mango = await initializeMango(connection.current, connection.cluster)

  const depository = instantiateMangoDepository(
    uxdProgramId,
    getDepositoryMintKey(connection.cluster, depositoryMintName),
    getInsuranceMintKey(connection.cluster, insuranceMintName)
  )

  return client.createWithdrawInsuranceFromMangoDepositoryInstruction(
    insuranceWithdrawnAmount,
    { pda: getControllerPda(uxdProgramId) } as Controller,
    depository,
    mango,
    authority,
    Provider.defaultOptions()
  )
}

export default createWithdrawInsuranceFromMangoDepositoryInstruction
