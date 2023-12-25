import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  UXDClient,
  UXD_DECIMALS,
  Controller,
} from '@uxd-protocol/uxd-client'
import { ConnectionContext } from '@utils/connection'
import {
  getCredixLpDepository,
  DEPOSITORY_TYPES,
  uxdClient,
  getMercurialVaultDepository,
  getAlloyxVaultDepository,
} from './uxdClient'

export type UXDRegisterDepositoryParams = {
  authority: PublicKey
  payer: PublicKey
  depositoryMintName: string
  mintingFeeInBps: number
  redeemingFeeInBps: number
  redeemableDepositorySupplyCap: number
}
const registerMercurialVaultDepositoryIx = async ({
  connection,
  uxdProgramId,
  client,
  controller,
  params,
}: {
  connection: ConnectionContext
  uxdProgramId: PublicKey
  client: UXDClient
  controller: Controller
  params: UXDRegisterDepositoryParams
}): Promise<TransactionInstruction> => {
  const depository = await getMercurialVaultDepository(
    connection,
    uxdProgramId,
    params.depositoryMintName
  )

  return client.createRegisterMercurialVaultDepositoryInstruction(
    controller,
    depository,
    params.authority,
    params.mintingFeeInBps,
    params.redeemingFeeInBps,
    params.redeemableDepositorySupplyCap,
    { preflightCommitment: 'processed', commitment: 'processed' },
    params.payer
  )
}

const registerCredixLpDepositoryIx = async ({
  connection,
  uxdProgramId,
  client,
  controller,
  params,
}: {
  connection: ConnectionContext
  uxdProgramId: PublicKey
  client: UXDClient
  controller: Controller
  params: UXDRegisterDepositoryParams
}) => {
  const depository = await getCredixLpDepository(
    connection,
    uxdProgramId,
    params.depositoryMintName
  )

  return client.createRegisterCredixLpDepositoryInstruction(
    controller,
    depository,
    params.authority,
    params.mintingFeeInBps,
    params.redeemingFeeInBps,
    params.redeemableDepositorySupplyCap,
    { preflightCommitment: 'processed', commitment: 'processed' },
    params.payer
  )
}

const registerAlloyxVaultDepositoryIx = async ({
  connection,
  uxdProgramId,
  client,
  controller,
  params,
}: {
  connection: ConnectionContext
  uxdProgramId: PublicKey
  client: UXDClient
  controller: Controller
  params: UXDRegisterDepositoryParams
}) => {
  const depository = await getAlloyxVaultDepository(
    connection,
    uxdProgramId,
    params.depositoryMintName
  )

  return client.createRegisterAlloyxVaultDepositoryInstruction(
    controller,
    depository,
    params.authority,
    params.mintingFeeInBps,
    params.redeemingFeeInBps,
    params.redeemableDepositorySupplyCap,
    { preflightCommitment: 'processed', commitment: 'processed' },
    params.payer
  )
}


export const registerUXDDepositoryIx = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  depositoryType: DEPOSITORY_TYPES,
  params: UXDRegisterDepositoryParams
): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId)
  const controller = new Controller('UXD', UXD_DECIMALS, uxdProgramId)

  switch (depositoryType) {
    case DEPOSITORY_TYPES.MERCURIAL_VAULT:
      return registerMercurialVaultDepositoryIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    case DEPOSITORY_TYPES.CREDIX_LP:
      return registerCredixLpDepositoryIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    case DEPOSITORY_TYPES.ALLOYX_VAULT:
      return registerAlloyxVaultDepositoryIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    default:
      throw new Error('Depository type not handled')
  }
}
