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
import uxdIdl from './uxdIdl'

export const DEPOSITORY_MINTS = {
  devnet: {
    BTC: '3UNBZ6o52WTWwjac2kPUb4FyodhU1vFkRJheu1Sh2TvU',
    SOL: 'So11111111111111111111111111111111111111112',
  },
  mainnet: {
    BTC: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    SOL: 'So11111111111111111111111111111111111111112',
    MSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  },
}

export const INSURANCE_MINTS = {
  devnet: {
    USDC: '8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN',
  },
  mainnet: {
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
}

export const getDepositoryMintSymbols = (cluster: Cluster): string[] => [
  ...Object.keys(DEPOSITORY_MINTS[cluster]),
]
export const getDepositoryMintKey = (
  cluster: Cluster,
  symbol: string
): PublicKey => new PublicKey(DEPOSITORY_MINTS[cluster][symbol])

export const getInsuranceMintSymbols = (cluster: Cluster): string[] => [
  ...Object.keys(INSURANCE_MINTS[cluster]),
]
export const getInsuranceMintKey = (
  cluster: Cluster,
  symbol: string
): PublicKey => new PublicKey(INSURANCE_MINTS[cluster][symbol])

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
      uxdProgram,
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

export const uxdClient = (
  connection: Connection,
  programId: PublicKey,
  wallet: Wallet
): UXD => {
  const provider = new Provider(connection, wallet, Provider.defaultOptions())
  return new UXD(new Program(uxdIdl, programId, provider))
}

export const initializeMango = async (
  connection: Connection,
  cluster: EndpointTypes,
  wallet: Wallet
) => {
  const provider = new Provider(connection, wallet, Provider.defaultOptions())
  return createAndInitializeMango(provider, cluster)
}

export const getControllerPda = (uxdProgramId: PublicKey): PublicKey => {
  return findAddrSync([Buffer.from('CONTROLLER')], uxdProgramId)[0]
}

// We do not need the mint symbol so it is just set with a placeholder value
export const instantiateController = (
  uxdProgramId: PublicKey,
  mintDecimals: number,
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

// import { Program, Provider } from '@project-serum/anchor'
// import Wallet from '@project-serum/sol-wallet-adapter'
// import { Connection } from '@solana/web3.js'
// import {
//   createAndInitializeMango,
//   UXD,
//   UXDHelpers,
// } from '@uxdprotocol/uxd-client'
// import useWalletStore from 'stores/useWalletStore'
// import uxdIdl, { UXD_PROGRAM_ID } from './uxdIdl'

// export const uxdHelpers = new UXDHelpers();

// export const uxdClient = (): UXD => {
//   const connection = useWalletStore((s) => s.connection)
//  const wallet = useWalletStore((s) => s.current)

//   // PROBABLY NOT OK to fix
//   const provider = new Provider(connection.current, wallet, Provider.defaultOptions());

//   const uxdProgram = new Program(uxdIdl, UXD_PROGRAM_ID, provider);
//   return new UXD(new Program(uxdIdl, UXD_PROGRAM_ID, provider));
// }

// export const initializeMango = async () => {
//   const connection = useWalletStore((s) => s.connection)
//   const wallet = useWalletStore((s) => s.current)
//   const provider = new Provider(connection.current, wallet, Provider.defaultOptions())
//   return createAndInitializeMango(provider, `mainnet`);
// }
