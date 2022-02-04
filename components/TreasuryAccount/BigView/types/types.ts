import { BN } from '@project-serum/anchor'

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
  //async function that will trigger proposal creation
  // if promise is successfully resolved it will automatically refresh strategies items from store
  handleDeposit: HandleDepositFcn
}

export type HandleDepositFcn = (handledMint, amount) => void

export interface NameVal {
  name: string
  val: string | null
}
