import type { AnchorTypes } from '@saberhq/anchor-contrib';

import type { DescendingAuctionProgram as DescendingAuction } from '@soceanfi/descending-auction/dist/idl/idl';
import { IDL } from '@soceanfi/descending-auction/dist/idl/idl';

export type DescendingAuctionTypes = AnchorTypes<
  DescendingAuction,
  {
    auction: Auction;
  }
>;

export const DescendingAuctionJSON = IDL;

type Accounts = DescendingAuctionTypes['Accounts'];

export declare type Auction = Accounts['auction'];

export declare type AuctionState = 'Pending' | 'InProgress' | 'Ended';
export declare type CurveType = 'LinearDecay';

export type DescendingAuctionProgram = DescendingAuctionTypes['Program'];
