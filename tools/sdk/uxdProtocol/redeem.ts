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

export type UXDRedeemParams = {
  authority: PublicKey
  payer: PublicKey
  collateralName: string
  redeemableAmount: number
  user: PublicKey
}

const redeemFromMercurialVaultDepositoryIx = async ({
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
  const depository = await getMercurialVaultDepository(
    connection,
    uxdProgramId,
    params.collateralName
  )

  return client.createRedeemFromMercurialVaultDepositoryInstruction(
    controller,
    depository,
    params.authority,
    params.user,
    params.redeemableAmount,
    { preflightCommitment: 'processed', commitment: 'processed' },
    params.payer
  )
}

const redeemFromCredixLpDepositoryIx = async ({
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
    case DEPOSITORY_TYPES.MERCURIAL_VAULT:
      return redeemFromMercurialVaultDepositoryIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    case DEPOSITORY_TYPES.CREDIX_LP:
      return redeemFromCredixLpDepositoryIx({
        connection,
        uxdProgramId,
        client,
        controller,
        params,
      })
    default:
      throw new Error("Invalid redeem depository type: " + depositoryType)
  }
}
