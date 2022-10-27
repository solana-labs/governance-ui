import ChartCandlestickIcon from '@carbon/icons-react/lib/ChartCandlestick';
import CubeIcon from '@carbon/icons-react/lib/Cube';
import GameConsoleIcon from '@carbon/icons-react/lib/GameConsole';
import IdeaIcon from '@carbon/icons-react/lib/Idea';

import { NFT } from '@hub/components/icons/NFT';

export enum Category {
  Defi,
  Gaming,
  Nft,
  Web3,
  Other,
}

export function getCategoryIcon(category: Category) {
  switch (category) {
    case Category.Defi:
      return <ChartCandlestickIcon />;
    case Category.Gaming:
      return <GameConsoleIcon />;
    case Category.Nft:
      return <NFT />;
    case Category.Web3:
      return <CubeIcon />;
    default:
      return <IdeaIcon />;
  }
}

export function getCategoryName(category: Category) {
  switch (category) {
    case Category.Defi:
      return 'DeFi';
    case Category.Gaming:
      return 'Gaming';
    case Category.Nft:
      return 'NFT Collection';
    case Category.Web3:
      return 'Web3';
    case Category.Other:
      return 'Other';
  }
}
