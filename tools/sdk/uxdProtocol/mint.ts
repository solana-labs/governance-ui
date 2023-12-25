import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  UXD_DECIMALS,
  Controller,
  UXDClient,
} from '@uxd-protocol/uxd-client'
import { ConnectionContext } from '@utils/connection'
import {
  DEPOSITORY_TYPES,
  getCredixLpDepository,
  getMercurialVaultDepository,
  uxdClient,
} from './uxdClient'

export type UXDMintParams = {
  authority: PublicKey
  payer: PublicKey
  collateralName: string
  collateralAmount: number
  user: PublicKey
}

const mintWithMercurialVaultDepositoryIx = async ({
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
  const depository = await getMercurialVaultDepository(
    connection,
    uxdProgramId,
    params.collateralName
  )

  return client.createMintWithMercurialVaultDepositoryInstruction(
    controller,
    depository,
    params.authority,
    params.user,
    params.collateralAmount,
    { preflightCommitment: 'processed', commitment: 'processed' },
    params.payer
  )
}

const mintWithCredixLpDepositoryIx = async ({
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
    params.user,
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
    case DEPOSITORY_TYPES.MERCURIAL_VAULT:
      return mintWithMercurialVaultDepositoryIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    case DEPOSITORY_TYPES.CREDIX_LP:
      return mintWithCredixLpDepositoryIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    default:
      throw new Error("Invalid mint depository type: " + depositoryType)
  }
}
