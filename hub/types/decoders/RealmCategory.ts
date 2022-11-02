import * as IT from 'io-ts';

import { RealmCategory as _RealmCategory } from '../RealmCategory';

export const RealmCategoryDAOTools = IT.literal(_RealmCategory.DAOTools);
export const RealmCategoryDefi = IT.literal(_RealmCategory.Defi);
export const RealmCategoryGaming = IT.literal(_RealmCategory.Gaming);
export const RealmCategoryNft = IT.literal(_RealmCategory.Nft);
export const RealmCategoryWeb3 = IT.literal(_RealmCategory.Web3);
export const RealmCategoryOther = IT.literal(_RealmCategory.Other);

export const RealmCategory = IT.union([
  RealmCategoryDAOTools,
  RealmCategoryDefi,
  RealmCategoryGaming,
  RealmCategoryNft,
  RealmCategoryWeb3,
  RealmCategoryOther,
]);
