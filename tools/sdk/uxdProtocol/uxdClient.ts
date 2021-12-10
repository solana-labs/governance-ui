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
  connection: Connection,
  programId: PublicKey
): { client: UXD; controller: Controller } => {
  const wallet = new Wallet(DEFAULT_WALLET_PROVIDER)
  const provider = new Provider(connection, wallet, Provider.defaultOptions())
  return {
    client: new UXD(new Program(uxdIdl, programId, provider)),
    controller: new Controller('UXD', 6, programId),
  }
}

export const initializeMango = async (connection: Connection) => {
  const wallet = new Wallet(DEFAULT_WALLET_PROVIDER)
  const provider = new Provider(connection, wallet, Provider.defaultOptions())
  return createAndInitializeMango(provider, CLUSTER)
}
