import {
  AccountInfo,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { programIds } from '../utils/ids'
import { deserializeBorsh } from './../utils/borsh'
import { serialize } from 'borsh'
import BN from 'bn.js'
import { AccountParser, cache } from '../contexts'

export const AUCTION_PREFIX = 'auction'
export const METADATA = 'metadata'

export enum AuctionState {
  Created = 0,
  Started,
  Ended,
}

export enum BidStateType {
  EnglishAuction = 0,
  OpenEdition = 1,
}

export class Bid {
  key: PublicKey
  amount: BN
  constructor(args: { key: PublicKey; amount: BN }) {
    this.key = args.key
    this.amount = args.amount
  }
}

export class BidState {
  type: BidStateType
  bids: Bid[]
  max: BN

  public getWinnerIndex(bidder: PublicKey): number | null {
    if (!this.bids) return null
    console.log(
      'bids',
      this.bids.map((b) => b.key.toBase58()),
      bidder.toBase58()
    )
    const index = this.bids.findIndex(
      (b) => b.key.toBase58() == bidder.toBase58()
    )
    if (index != -1) return index
    else return null
  }

  constructor(args: { type: BidStateType; bids: Bid[]; max: BN }) {
    this.type = args.type
    this.bids = args.bids
    this.max = args.max
  }
}

export const AuctionParser: AccountParser = (
  pubkey: PublicKey,
  account: AccountInfo<Buffer>
) => ({
  pubkey,
  account,
  info: decodeAuction(account.data),
})

export const decodeAuction = (buffer: Buffer) => {
  return deserializeBorsh(AUCTION_SCHEMA, AuctionData, buffer) as AuctionData
}

export const BidderPotParser: AccountParser = (
  pubkey: PublicKey,
  account: AccountInfo<Buffer>
) => ({
  pubkey,
  account,
  info: decodeBidderPot(account.data),
})

export const decodeBidderPot = (buffer: Buffer) => {
  return deserializeBorsh(AUCTION_SCHEMA, BidderPot, buffer) as BidderPot
}

export const BidderMetadataParser: AccountParser = (
  pubkey: PublicKey,
  account: AccountInfo<Buffer>
) => ({
  pubkey,
  account,
  info: decodeBidderMetadata(account.data),
})

export const decodeBidderMetadata = (buffer: Buffer) => {
  return deserializeBorsh(
    AUCTION_SCHEMA,
    BidderMetadata,
    buffer
  ) as BidderMetadata
}

export const BASE_AUCTION_DATA_SIZE = 32 + 32 + 32 + 8 + 8 + 1 + 9 + 9 + 9 + 9

export class AuctionData {
  /// Pubkey of the authority with permission to modify this auction.
  authority: PublicKey
  /// Pubkey of the resource being bid on.
  resource: PublicKey
  /// Token mint for the SPL token being used to bid
  tokenMint: PublicKey
  /// The time the last bid was placed, used to keep track of auction timing.
  lastBid: BN | null
  /// Slot time the auction was officially ended by.
  endedAt: BN | null
  /// End time is the cut-off point that the auction is forced to end by.
  endAuctionAt: BN | null
  /// Gap time is the amount of time in slots after the previous bid at which the auction ends.
  auctionGap: BN | null
  /// The state the auction is in, whether it has started or ended.
  state: AuctionState
  /// Auction Bids, each user may have one bid open at a time.
  bidState: BidState

  /// Used for precalculation on the front end, not a backend key
  auctionManagerKey?: PublicKey
  /// Used for precalculation on the front end, not a backend key
  bidRedemptionKey?: PublicKey

  constructor(args: {
    authority: PublicKey
    resource: PublicKey
    tokenMint: PublicKey
    lastBid: BN | null
    endedAt: BN | null
    endAuctionAt: BN | null
    auctionGap: BN | null
    state: AuctionState
    bidState: BidState
  }) {
    this.authority = args.authority
    this.resource = args.resource
    this.tokenMint = args.tokenMint
    this.lastBid = args.lastBid
    this.endedAt = args.endedAt
    this.endAuctionAt = args.endAuctionAt
    this.auctionGap = args.auctionGap
    this.state = args.state
    this.bidState = args.bidState
  }
}

export const BIDDER_METADATA_LEN = 32 + 32 + 8 + 8 + 1
export class BidderMetadata {
  // Relationship with the bidder who's metadata this covers.
  bidderPubkey: PublicKey
  // Relationship with the auction this bid was placed on.
  auctionPubkey: PublicKey
  // Amount that the user bid.
  lastBid: BN
  // Tracks the last time this user bid.
  lastBidTimestamp: BN
  // Whether the last bid the user made was cancelled. This should also be enough to know if the
  // user is a winner, as if cancelled it implies previous bids were also cancelled.
  cancelled: boolean
  constructor(args: {
    bidderPubkey: PublicKey
    auctionPubkey: PublicKey
    lastBid: BN
    lastBidTimestamp: BN
    cancelled: boolean
  }) {
    this.bidderPubkey = args.bidderPubkey
    this.auctionPubkey = args.auctionPubkey
    this.lastBid = args.lastBid
    this.lastBidTimestamp = args.lastBidTimestamp
    this.cancelled = args.cancelled
  }
}

export const BIDDER_POT_LEN = 32 + 32 + 32
export class BidderPot {
  /// Points at actual pot that is a token account
  bidderPot: PublicKey
  bidderAct: PublicKey
  auctionAct: PublicKey
  constructor(args: {
    bidderPot: PublicKey
    bidderAct: PublicKey
    auctionAct: PublicKey
  }) {
    this.bidderPot = args.bidderPot
    this.bidderAct = args.bidderAct
    this.auctionAct = args.auctionAct
  }
}

export enum WinnerLimitType {
  Unlimited = 0,
  Capped = 1,
}

export class WinnerLimit {
  type: WinnerLimitType
  usize: BN
  constructor(args: { type: WinnerLimitType; usize: BN }) {
    this.type = args.type
    this.usize = args.usize
  }
}

class CreateAuctionArgs {
  instruction: number = 0
  /// How many winners are allowed for this auction. See AuctionData.
  winners: WinnerLimit
  /// End time is the cut-off point that the auction is forced to end by. See AuctionData.
  endAuctionAt: BN | null
  /// Gap time is how much time after the previous bid where the auction ends. See AuctionData.
  auctionGap: BN | null
  /// Token mint for the SPL token used for bidding.
  tokenMint: PublicKey
  /// Authority
  authority: PublicKey
  /// The resource being auctioned. See AuctionData.
  resource: PublicKey

  constructor(args: {
    winners: WinnerLimit
    endAuctionAt: BN | null
    auctionGap: BN | null
    tokenMint: PublicKey
    authority: PublicKey
    resource: PublicKey
  }) {
    this.winners = args.winners
    this.endAuctionAt = args.endAuctionAt
    this.auctionGap = args.auctionGap
    this.tokenMint = args.tokenMint
    this.authority = args.authority
    this.resource = args.resource
  }
}

class StartAuctionArgs {
  instruction: number = 1
  resource: PublicKey

  constructor(args: { resource: PublicKey }) {
    this.resource = args.resource
  }
}

class PlaceBidArgs {
  instruction: number = 2
  resource: PublicKey
  amount: BN

  constructor(args: { resource: PublicKey; amount: BN }) {
    this.resource = args.resource
    this.amount = args.amount
  }
}

export const AUCTION_SCHEMA = new Map<any, any>([
  [
    CreateAuctionArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['winners', WinnerLimit],
        ['endAuctionAt', { kind: 'option', type: 'u64' }],
        ['auctionGap', { kind: 'option', type: 'u64' }],
        ['tokenMint', 'pubkey'],
        ['authority', 'pubkey'],
        ['resource', 'pubkey'],
      ],
    },
  ],
  [
    WinnerLimit,
    {
      kind: 'struct',
      fields: [
        ['type', 'u8'],
        ['usize', 'u64'],
      ],
    },
  ],
  [
    StartAuctionArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['resource', 'pubkey'],
      ],
    },
  ],
  [
    PlaceBidArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['amount', 'u64'],
        ['resource', 'pubkey'],
      ],
    },
  ],
  [
    AuctionData,
    {
      kind: 'struct',
      fields: [
        ['authority', 'pubkey'],
        ['resource', 'pubkey'],
        ['tokenMint', 'pubkey'],
        ['lastBid', { kind: 'option', type: 'u64' }],
        ['endedAt', { kind: 'option', type: 'u64' }],
        ['endAuctionAt', { kind: 'option', type: 'u64' }],
        ['auctionGap', { kind: 'option', type: 'u64' }],
        ['state', 'u8'],
        ['bidState', BidState],
      ],
    },
  ],
  [
    BidState,
    {
      kind: 'struct',
      fields: [
        ['type', 'u8'],
        ['bids', [Bid]],
        ['max', 'u64'],
      ],
    },
  ],
  [
    Bid,
    {
      kind: 'struct',
      fields: [
        ['key', 'pubkey'],
        ['amount', 'u64'],
      ],
    },
  ],
  [
    BidderMetadata,
    {
      kind: 'struct',
      fields: [
        ['bidderPubkey', 'pubkey'],
        ['auctionPubkey', 'pubkey'],
        ['lastBid', 'u64'],
        ['lastBidTimestamp', 'u64'],
        ['cancelled', 'u8'],
      ],
    },
  ],
  [
    BidderPot,
    {
      kind: 'struct',
      fields: [
        ['bidderPot', 'pubkey'],
        ['bidderAct', 'pubkey'],
        ['auctionAct', 'pubkey'],
      ],
    },
  ],
])

export const decodeAuctionData = (buffer: Buffer) => {
  return deserializeBorsh(AUCTION_SCHEMA, AuctionData, buffer) as AuctionData
}

export async function createAuction(
  winners: WinnerLimit,
  resource: PublicKey,
  endAuctionAt: BN | null,
  auctionGap: BN | null,
  tokenMint: PublicKey,
  authority: PublicKey,
  creator: PublicKey,
  instructions: TransactionInstruction[]
) {
  const auctionProgramId = programIds().auction

  const data = Buffer.from(
    serialize(
      AUCTION_SCHEMA,
      new CreateAuctionArgs({
        winners,
        resource,
        endAuctionAt,
        auctionGap,
        tokenMint,
        authority,
      })
    )
  )

  const auctionKey: PublicKey = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from(AUCTION_PREFIX),
        auctionProgramId.toBuffer(),
        resource.toBuffer(),
      ],
      auctionProgramId
    )
  )[0]

  const keys = [
    {
      pubkey: creator,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: auctionKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
  ]
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: auctionProgramId,
      data: data,
    })
  )
}

export async function startAuction(
  resource: PublicKey,
  creator: PublicKey,
  instructions: TransactionInstruction[]
) {
  const auctionProgramId = programIds().auction

  const data = Buffer.from(
    serialize(
      AUCTION_SCHEMA,
      new StartAuctionArgs({
        resource,
      })
    )
  )

  const auctionKey: PublicKey = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from(AUCTION_PREFIX),
        auctionProgramId.toBuffer(),
        resource.toBuffer(),
      ],
      auctionProgramId
    )
  )[0]

  const keys = [
    {
      pubkey: creator,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: auctionKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ]
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: auctionProgramId,
      data: data,
    })
  )
}

export async function placeBid(
  bidderPubkey: PublicKey,
  bidderPotTokenPubkey: PublicKey,
  tokenMintPubkey: PublicKey,
  transferAuthority: PublicKey,
  payer: PublicKey,
  resource: PublicKey,
  amount: BN,
  instructions: TransactionInstruction[]
) {
  const auctionProgramId = programIds().auction

  const data = Buffer.from(
    serialize(
      AUCTION_SCHEMA,
      new PlaceBidArgs({
        resource,
        amount,
      })
    )
  )

  const auctionKey: PublicKey = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from(AUCTION_PREFIX),
        auctionProgramId.toBuffer(),
        resource.toBuffer(),
      ],
      auctionProgramId
    )
  )[0]

  const bidderPotKey: PublicKey = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from(AUCTION_PREFIX),
        auctionProgramId.toBuffer(),
        auctionKey.toBuffer(),
        bidderPubkey.toBuffer(),
      ],
      auctionProgramId
    )
  )[0]
  const bidderMetaKey: PublicKey = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from(AUCTION_PREFIX),
        auctionProgramId.toBuffer(),
        auctionKey.toBuffer(),
        bidderPubkey.toBuffer(),
        Buffer.from('metadata'),
      ],
      auctionProgramId
    )
  )[0]

  const keys = [
    {
      pubkey: bidderPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: bidderPotKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: bidderPotTokenPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: bidderMetaKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: auctionKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: tokenMintPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: transferAuthority,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: payer,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: programIds().token,
      isSigner: false,
      isWritable: false,
    },
  ]
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: auctionProgramId,
      data: data,
    })
  )
}
