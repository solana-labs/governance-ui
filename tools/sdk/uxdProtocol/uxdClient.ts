import { EndpointTypes } from '@models/types'
import { Program, Provider } from '@project-serum/anchor'
import Wallet from '@project-serum/sol-wallet-adapter'
import { Connection, PublicKey } from '@solana/web3.js'
import { createAndInitializeMango, UXD } from '@uxdprotocol/uxd-client'
import uxdIdl from './uxdIdl'

const DEFAULT_WALLET_PROVIDER = 'https://sollet.io'

export const uxdClient = (
  connection: Connection,
  programId: PublicKey
): UXD => {
  const wallet = new Wallet(DEFAULT_WALLET_PROVIDER)

  const provider = new Provider(connection, wallet, Provider.defaultOptions())
  return new UXD(new Program(uxdIdl, programId, provider))
}

export const initializeMango = async (
  connection: Connection,
  cluster: EndpointTypes
) => {
  const wallet = new Wallet(DEFAULT_WALLET_PROVIDER)
  const provider = new Provider(connection, wallet, Provider.defaultOptions())
  return createAndInitializeMango(provider, cluster)
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
