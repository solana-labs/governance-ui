import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  UXD_DECIMALS,
  Controller,
  UXDClient,
  MercurialVaultDepository,
} from '@uxd-protocol/uxd-client'
import { ConnectionContext } from '@utils/connection'
import {
  DEPOSITORY_TYPES,
  getCredixLpDepository,
  getDepositoryMintInfo,
  uxdClient,
} from './uxdClient'

export type UXDRedeemParams = {
  authority: PublicKey
  payer: PublicKey
  collateralName: string
  redeemableAmount: number
}

const redeemWithMercurialIx = async ({
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
  params: UXDRedeemParams
}) => {
  const {
    address: collateralMint,
    decimals: collateralDecimals,
  } = getDepositoryMintInfo(connection.cluster, params.collateralName)

  const depository = await MercurialVaultDepository.initialize({
    connection: connection.current,
    collateralMint: {
      mint: collateralMint,
      name: params.collateralName,
      decimals: collateralDecimals,
      symbol: params.collateralName,
    },
    uxdProgramId,
  })

  return client.createRedeemFromMercurialVaultDepositoryInstruction(
    controller,
    depository,
    params.authority,
    params.redeemableAmount,
    { preflightCommitment: 'processed', commitment: 'processed' },
    params.payer
  )
}

const redeemWithCredixIx = async ({
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
  params: UXDRedeemParams
}) => {
  const depository = await getCredixLpDepository(
    connection,
    uxdProgramId,
    params.collateralName
  )

  return client.createRedeemFromCredixLpDepositoryInstruction(
    controller,
    depository,
    params.authority,
    params.redeemableAmount,
    { preflightCommitment: 'processed', commitment: 'processed' },
    params.payer
  )
}

export const redeemUXDIx = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  depositoryType: DEPOSITORY_TYPES,
  params: UXDRedeemParams
): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId)
  const controller = new Controller('UXD', UXD_DECIMALS, uxdProgramId)

  switch (depositoryType) {
    case DEPOSITORY_TYPES.MERCURIAL:
      return redeemWithMercurialIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    case DEPOSITORY_TYPES.CREDIX:
    default:
      return redeemWithCredixIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
  }
}
