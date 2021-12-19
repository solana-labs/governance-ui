import { Provider } from '@project-serum/anchor'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
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

const createDepositInsuranceToMangoDepositoryInstruction = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  depositoryMintName: string,
  insuranceMintName: string,
  insuranceDepositedAmount: number,
  wallet: SignerWalletAdapter
): Promise<TransactionInstruction> => {
  const client = uxdClient(connection.current, uxdProgramId, wallet)

  const mango = await initializeMango(
    connection.current,
    connection.cluster,
    wallet
  )

  const depository = instantiateMangoDepository(
    uxdProgramId,
    getDepositoryMintKey(connection.cluster, depositoryMintName),
    getInsuranceMintKey(connection.cluster, insuranceMintName)
  )

  return client.createDepositInsuranceToMangoDepositoryInstruction(
    insuranceDepositedAmount,
    { pda: getControllerPda(uxdProgramId) } as Controller,
    depository,
    mango,
    authority,
    Provider.defaultOptions()
  )
}

export default createDepositInsuranceToMangoDepositoryInstruction
