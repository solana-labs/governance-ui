import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import {
  UXDClient,
  MercurialVaultDepository,
  UXD_DECIMALS,
  Controller,
} from '@uxd-protocol/uxd-client'
import {
  getCredixLpDepository,
  getDepositoryMintInfo,
  DEPOSITORY_TYPES,
  uxdClient,
} from './uxdClient'

export type UXDRegisterDepositoryParams = {
  authority: PublicKey
  payer: PublicKey
  depositoryMintName: string
  mintingFeeInBps: number
  redeemingFeeInBps: number
  redeemableDepositorySupplyCap: number
}

const registerNewCredixDepositoryIx = async ({
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

const registerNewMercurialDepositoryIx = async ({
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

export const registerUXDDepositoryIx = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  depositoryType: DEPOSITORY_TYPES,
  params: UXDRegisterDepositoryParams
): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId)
  const controller = new Controller('UXD', UXD_DECIMALS, uxdProgramId)

  switch (depositoryType) {
    case DEPOSITORY_TYPES.MERCURIAL:
      return registerNewMercurialDepositoryIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    case DEPOSITORY_TYPES.CREDIX:
    default:
      return registerNewCredixDepositoryIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
  }
}
