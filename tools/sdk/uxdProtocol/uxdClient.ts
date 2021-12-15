import { Program, Provider } from '@project-serum/anchor'
import Wallet from '@project-serum/sol-wallet-adapter'
import { Connection, PublicKey } from '@solana/web3.js'
import {
  Controller,
  createAndInitializeMango,
  UXD,
} from '@uxdprotocol/uxd-client'
import uxdIdl from './uxdIdl'

const DEFAULT_WALLET_PROVIDER = 'https://sollet.io'
const CLUSTER = 'devnet'

export const uxdClient = (
  mintDecimals: number,
  connection: Connection,
  programId: PublicKey
): { client: UXD; controller: Controller } => {
  const wallet = new Wallet(DEFAULT_WALLET_PROVIDER)
  const provider = new Provider(connection, wallet, Provider.defaultOptions())
  return {
    client: new UXD(new Program(uxdIdl, programId, provider)),
    controller: new Controller('redeemable_ticker', mintDecimals, programId), // The redeemable ticker is just local, doesn't matter.
  }
}

export const initializeMango = async (connection: Connection) => {
  const wallet = new Wallet(DEFAULT_WALLET_PROVIDER)
  const provider = new Provider(connection, wallet, Provider.defaultOptions())
  return createAndInitializeMango(provider, CLUSTER)
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
//   const wallet = useWalletStore((s) => s.current)

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
