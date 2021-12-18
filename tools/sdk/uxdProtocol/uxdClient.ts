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
} from '@uxdprotocol/uxd-client'
import uxdIdl from './uxdIdl'

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
