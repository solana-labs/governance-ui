import type { AnchorTypes } from '@saberhq/anchor-contrib';

import type { DeltafiDexV2 } from '../idl/deltafi';
export * from '../idl/deltafi';

export type DeltafiTypes = AnchorTypes<
  DeltafiDexV2,
  {
    liquidityProvider: LiquidityProviderData;
    deltafiUser: DeltafiUserData;
    farmInfo: FarmInfoData;
    farmUser: FarmUserData;
    marketConfig: MarketConfigData;
    swapInfo: SwapInfoData;
  },
  {
    swapType: SwapType;
  }
>;

type Accounts = DeltafiTypes['Accounts'];
type Defined = DeltafiTypes['Defined'];

export type LiquidityProviderData = Accounts['LiquidityProvider'];
type DeltafiUserData = Accounts['DeltafiUser'];
type FarmInfoData = Accounts['FarmInfo'];
type FarmUserData = Accounts['FarmUser'];
type MarketConfigData = Accounts['MarketConfig'];
type SwapInfoData = Accounts['SwapInfo'];

export type SwapType = Defined['SwapType'];

export type DeltafiProgram = DeltafiTypes['Program'];
