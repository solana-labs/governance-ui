import CubeIcon from '@carbon/icons-react/lib/Cube';

export enum Category {
  Defi,
  Gaming,
  Nft,
  Web3,
  Other,
}

export function getCategoryIcon(category: Category) {
  switch (category) {
    case Category.Web3:
      return <CubeIcon />;
    default:
      return <CubeIcon />;
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
