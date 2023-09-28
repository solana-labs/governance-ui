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

export type UXDMintParams = {
  authority: PublicKey
  payer: PublicKey
  collateralName: string
  collateralAmount: number
}

const mintWithMercurialIx = async ({
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
  params: UXDMintParams
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

  return client.createMintWithMercurialVaultDepositoryInstruction(
    controller,
    depository,
    params.authority,
    params.collateralAmount,
    { preflightCommitment: 'processed', commitment: 'processed' },
    params.payer
  )
}

const mintWithCredixIx = async ({
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
  params: UXDMintParams
}) => {
  const depository = await getCredixLpDepository(
    connection,
    uxdProgramId,
    params.collateralName
  )

  return client.createMintWithCredixLpDepositoryInstruction(
    controller,
    depository,
    params.authority,
    params.collateralAmount,
    { preflightCommitment: 'processed', commitment: 'processed' },
    params.payer
  )
}

export const mintUXDIx = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  depositoryType: DEPOSITORY_TYPES,
  params: UXDMintParams
): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId)
  const controller = new Controller('UXD', UXD_DECIMALS, uxdProgramId)

  switch (depositoryType) {
    case DEPOSITORY_TYPES.MERCURIAL:
      return mintWithMercurialIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    case DEPOSITORY_TYPES.CREDIX:
    default:
      return mintWithCredixIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
  }
}
