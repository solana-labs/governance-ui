import { PublicKey } from '@solana/web3.js'
import {
  CreateSolendStrategyParams,
  SolendSubStrategy,
} from 'Strategies/protocols/solend'
import { VaultInfo } from 'Strategies/protocols/psyfi/types'

export interface TreasuryStrategy {
  //liquidity in $
  liquidity: number
  protocolSymbol: string
  apy: string
  apyHeader?: string
  protocolName: string
  strategySubtext?: string
  handledMint: string
  handledTokenSymbol: string
  handledTokenImgSrc: string
  protocolLogoSrc: string
  strategyName: string
  strategyDescription: string
  //if you want to use custom component set this to false and add your custom
  //item and modal to strategywrapper component based on generic components
  isGenericItem?: boolean
  createProposalFcn: any
  /** When true, does not display protocol or name */
  noProtocol?: boolean
}
/* 
export type MangoStrategy = TreasuryStrategy & {
  //async function that pass all props needed to create proposal
  // if promise is successfully resolved it will automatically redirect to created proposal
  createProposalFcn: HandleCreateProposalWithStrategy
} */

export type SolendStrategy = TreasuryStrategy & {
  reserves: Array<SolendSubStrategy>
  createProposalFcn: CreateSolendStrategyParams
}

export type PsyFiStrategy = TreasuryStrategy & {
  vaultAccounts: {
    pubkey: PublicKey
    lpTokenMint: PublicKey
    collateralAccountKey: PublicKey
  }
  vaultInfo: VaultInfo
  otherStrategies: Array<PsyFiStrategy>
}

/* 
type HandleCreateProposalWithStrategy = (
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  handledMint: string,
  form: MNGODepositForm,
  realm: ProgramAccount<Realm>,
  treasuaryAccount: AssetAccount,
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  prerequisiteInstructions: TransactionInstruction[],
  isDraft: boolean,
  client?: VotingClient
) => Promise<PublicKey> */
/* 
type MNGODepositForm = {
  mintAmount: number
  delegateDeposit: boolean
  delegateAddress: string
  mangoAccountPk: PublicKey | null
  title: string
  description: string
  proposalCount: number
}
 */
