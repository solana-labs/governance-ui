import { Cluster } from '@blockworks-foundation/mango-client'
import { utils } from '@project-serum/anchor'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import {
  Controller,
  MercurialVaultDepository,
  UXDClient,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client'
import { CredixLpDepository } from '@uxd-protocol/uxd-client'

export const DEPOSITORY_MINTS = {
  devnet: {
    BTC: {
      address: new PublicKey('3UNBZ6o52WTWwjac2kPUb4FyodhU1vFkRJheu1Sh2TvU'),
      decimals: 6,
    },
    SOL: {
      address: new PublicKey('So11111111111111111111111111111111111111112'),
      decimals: 9,
    },
    MERCURIAL_USDC: {
      address: new PublicKey('6L9fgyYtbz34JvwvYyL6YzJDAywz9PKGttuZuWyuoqje'),
      decimals: 6,
    },
    CREDIX_USDC: {
      address: new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'),
      decimals: 6,
    },
  },
  mainnet: {
    BTC: {
      address: new PublicKey('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'),
      decimals: 6,
    },
    SOL: {
      address: new PublicKey('So11111111111111111111111111111111111111112'),
      decimals: 9,
    },
    MSOL: {
      address: new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'),
      decimals: 6,
    },
    ETH: {
      address: new PublicKey('2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk'),
      decimals: 6,
    },
    USDC: {
      address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
      decimals: 6,
    },
  },
}

export const GOVERNANCE_MINTS = {
  mainnet: {
    USDC: {
      address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
      decimals: 6,
    },
    UXP: {
      address: new PublicKey('UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M'),
      decimals: 9,
    },
  },
}

export enum DEPOSITORY_TYPES {
  IDENTITY = 'Identity',
  MERCURIAL = 'Mercurial',
  CREDIX = 'Credix',
}

export const getDepositoryTypes = (isUxpDAO: boolean): DEPOSITORY_TYPES[] => {
  const types = [DEPOSITORY_TYPES.CREDIX, DEPOSITORY_TYPES.MERCURIAL]
  if (isUxpDAO) {
    types.push(DEPOSITORY_TYPES.IDENTITY)
  }

  return types
}

export const getDepositoryMintSymbols = (cluster: Cluster): string[] => [
  ...Object.keys(DEPOSITORY_MINTS[cluster]),
]
export const getDepositoryMintInfo = (
  cluster: Cluster,
  symbol: string
): {
  address: PublicKey
  decimals: number
} => DEPOSITORY_MINTS[cluster][symbol]

export const getDepositoryMintKey = (
  cluster: Cluster,
  symbol: string
): PublicKey => DEPOSITORY_MINTS[cluster][symbol].address

export const getDepositoryToken = (cluster: Cluster, symbol: string) =>
  DEPOSITORY_MINTS[cluster][symbol]

export const uxdClient = (programId: PublicKey): UXDClient => {
  return new UXDClient(programId)
}

export const getControllerPda = (uxdProgramId: PublicKey): PublicKey => {
  return utils.publicKey.findProgramAddressSync(
    [Buffer.from('CONTROLLER')],
    uxdProgramId
  )[0]
}

export const getCredixLpDepository = (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  depositoryMintName: string
) => {
  const collateralMintAddress = getDepositoryMintInfo(
    connection.cluster,
    depositoryMintName
  ).address
  const credixProgramId =
    connection.cluster == 'devnet'
      ? new PublicKey('CRdXwuY984Au227VnMJ2qvT7gPd83HwARYXcbHfseFKC')
      : new PublicKey('CRDx2YkdtYtGZXGHZ59wNv1EwKHQndnRc1gT4p8i2vPX')
  return CredixLpDepository.initialize({
    connection: connection.current,
    collateralMint: collateralMintAddress,
    collateralSymbol: depositoryMintName,
    uxdProgramId,
    credixProgramId: credixProgramId,
  })
}

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
