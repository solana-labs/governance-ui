import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  UXDClient,
  MercurialVaultDepository,
  Controller,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client'
import { ConnectionContext } from '@utils/connection'
import {
  DEPOSITORY_TYPES,
  getCredixLpDepository,
  getDepositoryMintInfo,
  uxdClient,
} from './uxdClient'

export type UXDEditDepositoryParams = {
  authority: PublicKey
  mintingFeeInBps?: number
  redeemingFeeInBps?: number
  redeemableAmountUnderManagementCap?: number
  depositoryMintName: string
}

const editMercurialDepositoryIx = async ({
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
  const {
    address: collateralMint,
    decimals: collateralDecimals,
  } = getDepositoryMintInfo(connection.cluster, params.depositoryMintName)
  const depository = await MercurialVaultDepository.initialize({
    connection: connection.current,
    collateralMint: {
      mint: collateralMint,
      name: params.depositoryMintName,
      symbol: params.depositoryMintName,
      decimals: collateralDecimals,
    },
    uxdProgramId,
  })

  return client.createEditMercurialVaultDepositoryInstruction(
    controller,
    depository,
    params.authority,
    {
      redeemableAmountUnderManagementCap:
        params.redeemableAmountUnderManagementCap,
      mintingFeeInBps: params.mintingFeeInBps,
      redeemingFeeInBps: params.redeemingFeeInBps,
    },
    { preflightCommitment: 'processed', commitment: 'processed' }
  )
}

const editCredixDepository = async ({
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
    case DEPOSITORY_TYPES.MERCURIAL:
      return editMercurialDepositoryIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    case DEPOSITORY_TYPES.CREDIX:
    default:
      return editCredixDepository({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
  }
}
