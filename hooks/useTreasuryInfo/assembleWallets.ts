import { BigNumber } from 'bignumber.js'
import { MintInfo } from '@solana/spl-token'
import {
  getNativeTreasuryAddress,
  getProgramDataAccount,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'

import { AssetAccount, AccountType } from '@utils/uiTypes/assets'
import { AssetType, Token } from '@models/treasury/Asset'
import { AuxiliaryWallet, Wallet } from '@models/treasury/Wallet'
import { getAccountName } from '@components/instructions/tools'
import { NFT } from '@models/treasury/NFT'

import { calculateTotalValue } from './calculateTotalValue'
import { convertAccountToAsset } from './convertAccountToAsset'
import { groupNftsByWallet } from './groupNftsByWallet'
import { groupNftsIntoCollections } from './groupNftsIntoCollections'
import {
  ProgramAssetAccount,
  groupProgramsByWallet,
} from './groupProgramsByWallet'
import { getRulesFromAccount } from './getRulesFromAccount'

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
  communityMint?: MintInfo
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
    }

    walletMap[walletAddress].rules = getRulesFromAccount(
      account,
      walletMap[walletAddress].rules,
      councilMintAddress,
      communityMintAddress,
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

  const wallets = Object.values(walletMap)
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

  console.log(auxiliaryWallets)

  return { auxiliaryWallets, wallets }
}
