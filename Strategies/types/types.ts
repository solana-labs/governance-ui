import { MangoAccount } from '@blockworks-foundation/mango-client'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { ProgramAccount, Realm, RpcContext } from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { GovernedTokenAccount } from '@utils/tokens'
import { MarketStore } from 'Strategies/store/marketStore'

export interface TreasuryStrategy {
  //liquidity in $
  liquidity: number
  protocolSymbol: string
  apy: string
  protocolName: string
  handledMint: string
  handledTokenSymbol: string
  handledTokenImgSrc: string
  protocolLogoSrc: string
  strategyName: string
  strategyDescription: string
  //if you want to use custom component set this to false and add your custom
  //item and modal to strategywrapper component based on generic components
  isGenericItem?: boolean
  //async function that pass all props needed to create proposal
  // if promise is successfully resolved it will automatically redirect to created proposal
  createProposalFcn: HandleCreateProposalWithStrategy
}

export type HandleCreateProposalWithStrategy = (
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  handledMint: string,
  form: MNGODepositForm,
  realm: ProgramAccount<Realm>,
  treasuaryAccount: GovernedTokenAccount,
  tokenOwnerRecord: PublicKey,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  prerequisiteInstructions: TransactionInstruction[],
  isDraft: boolean,
  market?: MarketStore,
  client?: VsrClient
) => Promise<PublicKey>

export interface NameVal {
  name: string
  val: string | null
}

export type MNGODepositForm = {
  mintAmount: number
  delegateDeposit: boolean
  delegateAddress: string
  mangoAccountPk: PublicKey | null
  mangoAccounts: MangoAccount[]
  title: string
  description: string
  proposalCount: number
}
