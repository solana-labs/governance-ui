import { Provider } from '@project-serum/anchor'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { Controller } from '@uxdprotocol/uxd-client'
import { ConnectionContext } from 'stores/useWalletStore'
import {
  uxdClient,
  initializeMango,
  instantiateMangoDepository,
  getControllerPda,
} from './uxdClient'

const createWithdrawInsuranceFromMangoDepositoryInstruction = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  depositoryMint: PublicKey,
  insuranceMint: PublicKey,
  insuranceWithdrawnAmount: number,
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
    depositoryMint,
    insuranceMint
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
