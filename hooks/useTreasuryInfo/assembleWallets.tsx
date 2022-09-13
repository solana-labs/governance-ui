import { BigNumber } from 'bignumber.js'
import { MintInfo } from '@solana/spl-token'
import {
  getNativeTreasuryAddress,
  getProgramDataAccount,
  ProgramAccount,
  Realm,
  RealmConfigAccount,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { SparklesIcon } from '@heroicons/react/outline'

import { AssetAccount, AccountType } from '@utils/uiTypes/assets'
import { AssetType, Token, RealmAuthority } from '@models/treasury/Asset'
import { AuxiliaryWallet, Wallet } from '@models/treasury/Wallet'
import { getAccountName } from '@components/instructions/tools'
import { NFT } from '@models/treasury/NFT'
import { RealmInfo } from '@models/registry/api'

import { calculateTotalValue } from './calculateTotalValue'
import { convertAccountToAsset } from './convertAccountToAsset'
import { groupNftsByWallet } from './groupNftsByWallet'
import { groupNftsIntoCollections } from './groupNftsIntoCollections'
import {
  ProgramAssetAccount,
  groupProgramsByWallet,
} from './groupProgramsByWallet'
import { getRulesFromAccount } from './getRulesFromAccount'
import { abbreviateAddress } from '@utils/formatting'

function isNotNull<T>(x: T | null): x is T {
  return x !== null
}

export const assembleWallets = async (
  connection: Connection,
  accounts: AssetAccount[],
  nfts: NFT[],
  programId: PublicKey,
  councilMintAddress?: string,
  communityMintAddress?: string,
  councilMint?: MintInfo,
  communityMint?: MintInfo,
  realm?: ProgramAccount<Realm>,
  realmConfig?: ProgramAccount<RealmConfigAccount>,
  realmInfo?: RealmInfo
) => {
  const walletMap: { [address: string]: Wallet } = {}
  const nftsGroupedByWallet = groupNftsByWallet(nfts)
  const programs = accounts.filter(
    (account) => account.type === AccountType.PROGRAM
  ) as ProgramAssetAccount[]
  const programsGroupedByWallet = await groupProgramsByWallet(
    programId,
    programs
  )
  const ungovernedAssets: AssetAccount[] = []
  const governanceToWallet: { [address: string]: string } = {}

  for (const account of accounts) {
    let walletAddress = ''

    if (account.isSol && account.extensions.transferAddress) {
      walletAddress = account.extensions.transferAddress.toBase58()
    } else if (account.governance.pubkey) {
      walletAddress = (
        await getNativeTreasuryAddress(programId, account.governance.pubkey)
      ).toBase58()
    }

    if (!walletAddress) {
      ungovernedAssets.push(account)
      continue
    }

    const governanceAddress = account.governance?.pubkey?.toBase58()

    if (!walletMap[walletAddress]) {
      walletMap[walletAddress] = {
        governanceAddress,
        address: walletAddress,
        assets: [],
        governanceAccount: account.governance,
        rules: {},
        stats: {},
        totalValue: new BigNumber(0),
      }

      if (governanceAddress) {
        governanceToWallet[governanceAddress] = walletAddress
      }
    }

    walletMap[walletAddress].rules = getRulesFromAccount(
      account,
      walletMap[walletAddress].rules,
      councilMint,
      communityMint
    )

    if (!walletMap[walletAddress].stats.proposalsCount) {
      walletMap[walletAddress].stats.proposalsCount =
        account.governance.account.proposalCount || 0
    }

    if (!walletMap[walletAddress].stats.votingProposalCount) {
      walletMap[walletAddress].stats.votingProposalCount =
        account.governance.account.votingProposalCount || 0
    }

    // We're going to handle NFTs & programs specially
    if (
      account.type !== AccountType.NFT &&
      account.type !== AccountType.PROGRAM
    ) {
      const asset = convertAccountToAsset(
        account,
        councilMintAddress,
        communityMintAddress
      )

      if (asset) {
        walletMap[walletAddress].assets.push(asset)
      }
    }
  }

  for (const [walletAddress, programList] of Object.entries(
    programsGroupedByWallet
  )) {
    if (!walletMap[walletAddress]) {
      walletMap[walletAddress] = {
        address: walletAddress,
        assets: [],
        rules: {},
        stats: {},
        totalValue: new BigNumber(0),
      }
    }

    const dataAccounts = await Promise.all(
      programList.map((p) =>
        getProgramDataAccount(connection, p.pubkey).then((account) => ({
          address: p.pubkey.toBase58(),
          lastDeployedSlot: account.slot,
          upgradeAuthority: account.authority?.toBase58(),
          walletIsUpgradeAuthority:
            account.authority?.toBase58() ===
              walletMap[walletAddress].governanceAddress ||
            account.authority?.toBase58() === walletAddress,
          raw: p,
        }))
      )
    )

    walletMap[walletAddress].assets.push({
      type: AssetType.Programs,
      id: 'program-list',
      count: new BigNumber(dataAccounts.length),
      list: dataAccounts,
    })
  }

  for (const [walletAddress, nftList] of Object.entries(nftsGroupedByWallet)) {
    if (!walletMap[walletAddress]) {
      walletMap[walletAddress] = {
        address: walletAddress,
        assets: [],
        rules: {},
        stats: {},
        totalValue: new BigNumber(0),
      }
    }

    const collections = groupNftsIntoCollections(nftList)

    for (const collection of collections) {
      walletMap[walletAddress].assets.push(collection)
    }
  }

  const allWallets = Object.values(walletMap)
    .map((wallet) => ({
      ...wallet,
      name: wallet.governanceAddress
        ? getAccountName(wallet.governanceAddress)
        : getAccountName(wallet.address),
      totalValue: calculateTotalValue(
        wallet.assets.map((asset) =>
          'value' in asset ? asset.value : new BigNumber(0)
        )
      ),
    }))
    .sort((a, b) => {
      if (a.totalValue.isZero() && b.totalValue.isZero()) {
        const aContainsSortable = a.assets.some(
          (asset) =>
            asset.type === AssetType.NFTCollection ||
            asset.type === AssetType.Programs
        )
        const bContainsSortable = b.assets.some(
          (asset) =>
            asset.type === AssetType.NFTCollection ||
            asset.type === AssetType.Programs
        )

        if (aContainsSortable && !bContainsSortable) {
          return -1
        } else if (!aContainsSortable && bContainsSortable) {
          return 1
        } else {
          return b.assets.length - a.assets.length
        }
      }

      return b.totalValue.comparedTo(a.totalValue)
    })

  const auxiliaryAssets = ungovernedAssets
    .map(
      (account) =>
        convertAccountToAsset({ ...account, type: AccountType.TOKEN }) as Token
    )
    .filter(isNotNull)

  const auxiliaryWallets: AuxiliaryWallet[] = auxiliaryAssets.length
    ? [
        {
          assets: auxiliaryAssets,
          name: 'Auxiliary Assets',
          totalValue: calculateTotalValue(
            auxiliaryAssets.map((asset) =>
              'value' in asset ? asset.value : new BigNumber(0)
            )
          ),
        },
      ]
    : []

  const walletsToMerge = allWallets
    .filter((wallet) => !!governanceToWallet[wallet.address])
    .reduce((acc, wallet) => {
      acc[wallet.address] = wallet
      return acc
    }, {} as { [walletAddress: string]: Wallet })

  const wallets = allWallets
    .filter((wallet) => !walletsToMerge[wallet.address])
    .map((wallet) => {
      const walletToMerge = wallet.governanceAddress
        ? walletsToMerge[wallet.governanceAddress]
        : undefined

      if (walletToMerge) {
        for (const asset of walletToMerge.assets) {
          wallet.assets.push(asset)
        }
      }

      return wallet
    })

  if (realm?.account.authority) {
    const realmAuthority = realm.account.authority
    const config = realm.account.config

    for (const wallet of wallets) {
      if (
        wallet.governanceAddress &&
        wallet.governanceAddress === realmAuthority.toBase58()
      ) {
        const authority: RealmAuthority = {
          type: AssetType.RealmAuthority,
          id: realmAuthority.toBase58() + 'realm',
          address: realmAuthority.toBase58(),
          config: {
            communityMintMaxVoteWeightSource:
              config.communityMintMaxVoteWeightSource,
            minCommunityTokensToCreateGovernance: new BigNumber(
              config.minCommunityTokensToCreateGovernance.toString()
            ).shiftedBy(communityMint ? -communityMint.decimals : 0),
            useCommunityVoterWeightAddin:
              realmConfig?.account.communityTokenConfig.voterWeightAddin ??
              false,
            useMaxCommunityVoterWeightAddin:
              realmConfig?.account.communityTokenConfig.maxVoterWeightAddin ??
              false,
          },
          icon: realmInfo?.ogImage ? (
            <img src={realmInfo.ogImage} />
          ) : (
            <SparklesIcon />
          ),
          name: realmInfo?.displayName || abbreviateAddress(realmAuthority),
        }

        wallet.assets.push(authority)
      }
    }
  }

  return { auxiliaryWallets, wallets }
}
