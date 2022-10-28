import CalibrateIcon from '@carbon/icons-react/lib/Calibrate';
import ChartCandlestickIcon from '@carbon/icons-react/lib/ChartCandlestick';
import CubeIcon from '@carbon/icons-react/lib/Cube';
import GameConsoleIcon from '@carbon/icons-react/lib/GameConsole';
import IdeaIcon from '@carbon/icons-react/lib/Idea';

import { NFT } from '@hub/components/icons/NFT';
import { RealmCategory } from '@hub/types/RealmCategory';

export function getCategoryIcon(category: RealmCategory) {
  switch (category) {
    case RealmCategory.DAOTools:
      return <CalibrateIcon />;
    case RealmCategory.Defi:
      return <ChartCandlestickIcon />;
    case RealmCategory.Gaming:
      return <GameConsoleIcon />;
    case RealmCategory.Nft:
      return <NFT />;
    case RealmCategory.Web3:
      return <CubeIcon />;
    default:
      return <IdeaIcon />;
  }
}

export function getCategoryName(category: RealmCategory) {
  switch (category) {
    case RealmCategory.DAOTools:
      return 'DAO Tooling';
    case RealmCategory.Defi:
      return 'DeFi';
    case RealmCategory.Gaming:
      return 'Gaming';
    case RealmCategory.Nft:
      return 'NFT Collection';
    case RealmCategory.Web3:
      return 'Web3';
    case RealmCategory.Other:
      return 'Other';
  }
}
