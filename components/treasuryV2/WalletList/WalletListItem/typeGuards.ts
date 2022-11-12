import {
  Asset,
  AssetType,
  Token,
  Mint,
  NFTCollection,
  Programs,
  RealmAuthority,
  Sol,
  Domains,
  Unknown,
} from '@models/treasury/Asset'

export function isToken(asset: Asset): asset is Token {
  return asset.type === AssetType.Token
}

export function isMint(asset: Asset): asset is Mint {
  return asset.type === AssetType.Mint
}

export function isDomain(asset: Asset): asset is Domains {
  return asset.type === AssetType.Domain
}

export function isNFTCollection(asset: Asset): asset is NFTCollection {
  return asset.type === AssetType.NFTCollection
}

export function isPrograms(asset: Asset): asset is Programs {
  return asset.type === AssetType.Programs
}

export function isRealmAuthority(asset: Asset): asset is RealmAuthority {
  return asset.type === AssetType.RealmAuthority
}

export function isSol(asset: Asset): asset is Sol {
  return asset.type === AssetType.Sol
}

export function isUnknown(asset: Asset): asset is Unknown {
  return asset.type === AssetType.Unknown
}
