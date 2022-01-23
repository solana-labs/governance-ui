import { Cluster } from '@blockworks-foundation/mango-client'
import { EndpointTypes } from '@models/types'
import { Program, Provider } from '@project-serum/anchor'
import Wallet from '@project-serum/sol-wallet-adapter'
import { Connection, PublicKey } from '@solana/web3.js'
import {
  Controller,
  createAndInitializeMango,
  findAddrSync,
  MangoDepository,
  UXD,
  UXDHelpers,
} from '@uxdprotocol/uxd-client'

export const DEPOSITORY_MINTS = {
  devnet: {
    BTC: {
      address: '3UNBZ6o52WTWwjac2kPUb4FyodhU1vFkRJheu1Sh2TvU',
      decimals: 6,
    },
    SOL: {
      address: 'So11111111111111111111111111111111111111112',
      decimals: 9,
    },
  },
  mainnet: {
    BTC: {
      address: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
      decimals: 6,
    },
    SOL: {
      address: 'So11111111111111111111111111111111111111112',
      decimals: 9,
    },
    MSOL: {
      address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      decimals: 6,
    },
  },
}

export const INSURANCE_MINTS = {
  devnet: {
    USDC: {
      address: '8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN',
      decimals: 6,
    },
  },
  mainnet: {
    USDC: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
    },
  },
}

export const GOVERNANCE_MINTS = {
  mainnet: {
    USDC: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
    },
    UXP: {
      address: 'UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M',
      decimals: 9,
    },
  },
}

export const getDepositoryMintSymbols = (cluster: Cluster): string[] => [
  ...Object.keys(DEPOSITORY_MINTS[cluster]),
]
export const getDepositoryMintKey = (
  cluster: Cluster,
  symbol: string
): PublicKey => new PublicKey(DEPOSITORY_MINTS[cluster][symbol].address)

export const getDepositoryToken = (cluster: Cluster, symbol: string) =>
  DEPOSITORY_MINTS[cluster][symbol]

export const getInsuranceMintSymbols = (cluster: Cluster): string[] => [
  ...Object.keys(INSURANCE_MINTS[cluster]),
]
export const getInsuranceMintKey = (
  cluster: Cluster,
  symbol: string
): PublicKey => new PublicKey(INSURANCE_MINTS[cluster][symbol].address)

export const getGovernanceMintSymbols = (cluster: Cluster): string[] => [
  ...Object.keys(GOVERNANCE_MINTS[cluster]),
]
export const getGovernanceMintKey = (
  cluster: Cluster,
  symbol: string
): PublicKey => new PublicKey(GOVERNANCE_MINTS[cluster][symbol].address)

export const getGovernanceToken = (cluster: Cluster, symbol: string) =>
  GOVERNANCE_MINTS[cluster][symbol]

export const isDepositoryRegistered = async (
  connection: Connection,
  cluster: Cluster,
  uxdProgram: Program,
  collateralName: string,
  insuranceName: string,
  wallet: Wallet
): Promise<boolean> => {
  const uxdHelper = new UXDHelpers()
  try {
    await uxdHelper.getMangoDepositoryAccount(
      new Provider(connection, wallet, Provider.defaultOptions()),
      instantiateMangoDepository(
        uxdProgram.programId,
        getDepositoryMintKey(cluster, collateralName),
        getInsuranceMintKey(cluster, insuranceName)
      ),
      Provider.defaultOptions()
    )

    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const uxdClient = (programId: PublicKey): UXD => {
  return new UXD(programId)
}

export const initializeMango = async (
  connection: Connection,
  cluster: EndpointTypes
) => {
  return createAndInitializeMango(connection, cluster)
}

export const getControllerPda = (uxdProgramId: PublicKey): PublicKey => {
  return findAddrSync([Buffer.from('CONTROLLER')], uxdProgramId)[0]
}

export const instantiateController = (
  uxdProgramId: PublicKey,
  mintDecimals = 6,
  mintSymbol = 'UXD'
) => {
  return new Controller(mintSymbol, mintDecimals, uxdProgramId)
}

// We do not need the decimals and names for both depository and insurance
// in order to register a new mango depository
// we just set placeholder values
export const instantiateMangoDepository = (
  uxdProgramId: PublicKey,
  depositoryMint: PublicKey,
  insuranceMint: PublicKey,
  depositoryName = 'collateral',
  depositoryDecimals = 6,
  insuranceName = 'insurance',
  insuranceDecimals = 6
): MangoDepository => {
  return new MangoDepository(
    depositoryMint,
    depositoryName,
    depositoryDecimals,
    insuranceMint,
    insuranceName,
    insuranceDecimals,
    uxdProgramId
  )
}
