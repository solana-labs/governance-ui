import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  UXDClient,
  Controller,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client'
import { ConnectionContext } from '@utils/connection'
import {
  DEPOSITORY_TYPES,
  getCredixLpDepository,
  getMercurialVaultDepository,
  getAlloyxVaultDepository,
  uxdClient,
} from './uxdClient'

export type UXDEditDepositoryParams = {
  authority: PublicKey
  mintingFeeInBps?: number
  redeemingFeeInBps?: number
  redeemableAmountUnderManagementCap?: number
  profitsBeneficiaryCollateral?: PublicKey
  depositoryMintName: string
  mintingDisabled: boolean
}

const editMercurialVaultDepositoryIx = async ({
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
  params: UXDEditDepositoryParams
}): Promise<TransactionInstruction> => {
  const depository = await getMercurialVaultDepository(
    connection,
    uxdProgramId,
    params.depositoryMintName
  )

  return client.createEditMercurialVaultDepositoryInstruction(
    controller,
    depository,
    params.authority,
    {
      redeemableAmountUnderManagementCap:
        params.redeemableAmountUnderManagementCap,
      mintingFeeInBps: params.mintingFeeInBps,
      redeemingFeeInBps: params.redeemingFeeInBps,
      profitsBeneficiaryCollateral: params.profitsBeneficiaryCollateral,
      mintingDisabled: params.mintingDisabled,
    },
    { preflightCommitment: 'processed', commitment: 'processed' }
  )
}

const editCredixLpDepository = async ({
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
  params: UXDEditDepositoryParams
}): Promise<TransactionInstruction> => {
  const depository = await getCredixLpDepository(
    connection,
    uxdProgramId,
    params.depositoryMintName
  )

  return client.createEditCredixLpDepositoryInstruction(
    controller,
    depository,
    params.authority,
    {
      redeemableAmountUnderManagementCap:
        params.redeemableAmountUnderManagementCap,
      mintingFeeInBps: params.mintingFeeInBps,
      redeemingFeeInBps: params.redeemingFeeInBps,
      profitsBeneficiaryCollateral: params.profitsBeneficiaryCollateral,
      mintingDisabled: params.mintingDisabled,
    },
    { preflightCommitment: 'processed', commitment: 'processed' }
  )
}

const editAlloyxVaultDepository = async ({
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
  params: UXDEditDepositoryParams
}): Promise<TransactionInstruction> => {
  const depository = await getAlloyxVaultDepository(
    connection,
    uxdProgramId,
    params.depositoryMintName
  )

  return client.createEditAlloyxVaultDepositoryInstruction(
    controller,
    depository,
    params.authority,
    {
      redeemableAmountUnderManagementCap:
        params.redeemableAmountUnderManagementCap,
      mintingFeeInBps: params.mintingFeeInBps,
      redeemingFeeInBps: params.redeemingFeeInBps,
      profitsBeneficiaryCollateral: params.profitsBeneficiaryCollateral,
      mintingDisabled: params.mintingDisabled,
    },
    { preflightCommitment: 'processed', commitment: 'processed' }
  )
}

export const editUXDDepositoryIx = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  depositoryType: DEPOSITORY_TYPES,
  params: UXDEditDepositoryParams
) => {
  const client = uxdClient(uxdProgramId)
  const controller = new Controller('UXD', UXD_DECIMALS, uxdProgramId)
  switch (depositoryType) {
    case DEPOSITORY_TYPES.MERCURIAL_VAULT:
      return editMercurialVaultDepositoryIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    case DEPOSITORY_TYPES.CREDIX_LP:
      return editCredixLpDepository({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    case DEPOSITORY_TYPES.ALLOYX_VAULT:
      return editAlloyxVaultDepository({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    default:
      throw new Error("Unsupported edit depository type:" + depositoryType)
  }
}
