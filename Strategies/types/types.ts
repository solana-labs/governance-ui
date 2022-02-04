import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { BN } from '@project-serum/anchor'
import {
  Governance,
  ProgramAccount,
  Realm,
  RpcContext,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

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
  currentPosition: BN
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
  mintAmount: number,
  realm: ProgramAccount<Realm>,
  governance: ProgramAccount<Governance>,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  isDraft: boolean,
  client?: VsrClient
) => Promise<PublicKey>

export interface NameVal {
  name: string
  val: string | null
}
