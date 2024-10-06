import { BigNumber } from 'bignumber.js'
import { MintInfo } from '@solana/spl-token'
import {
  getProgramDataAccount,
  ProgramAccount,
  Realm,
  RealmConfigAccount,
} from '@solana/spl-governance'
import { SparklesIcon } from '@heroicons/react/outline'

import { AssetAccount, AccountType } from '@utils/uiTypes/assets'
import {
  AssetType,
  Token,
  RealmAuthority,
  Asset,
  Mango,
  Sol,
} from '@models/treasury/Asset'
import { AuxiliaryWallet, Wallet } from '@models/treasury/Wallet'
import { getAccountName } from '@components/instructions/tools'
import { RealmInfo } from '@models/registry/api'

import { calculateTotalValue } from './calculateTotalValue'
import { convertAccountToAsset } from './convertAccountToAsset'
import {
  ProgramAssetAccount,
  groupProgramsByWallet,
} from './groupProgramsByWallet'
import { getRulesFromAccount } from './getRulesFromAccount'
import { abbreviateAddress } from '@utils/formatting'
import { Domain } from '@models/treasury/Domain'
import { groupDomainsByWallet } from './groupDomainsByWallet'
import { ConnectionContext } from '@utils/connection'
import { PublicKey } from '@solana/web3.js'
import {
  MangoClient,
  Group,
  MangoAccount,
  I80F48,
  toUiDecimals,
} from '@blockworks-foundation/mango-v4'
import { BN } from '@coral-xyz/anchor'

function isNotNull<T>(x: T | null): x is T {
  return x !== null
}

export async function fetchMangoAccounts(
  assets: Asset[],
  mangoClient: MangoClient | null,
  mangoGroup: Group | null
) {
  if (!mangoClient || !mangoGroup) {
    return {
      mangoAccountsValue: new BigNumber(0),
      mangoAccounts: [],
    }
  }

  const tokenAccountOwners = Array.from(
    new Set(
      assets
        .filter((a) => a.type === AssetType.Token)
        .filter((a: Token) => a.raw.extensions.token)
        .filter((a: Token) => a.raw.extensions.token!.account.owner)
        .map((a: Token) => a.raw.extensions.token!.account.owner.toString())
    )
  ).map((o) => new PublicKey(o))

  const mangoAccounts: MangoAccount[] = []
  if (tokenAccountOwners.length <= 2) {
    for (const tokenAccountOwner of tokenAccountOwners) {
      const accounts = await mangoClient.getMangoAccountsForOwner(
        mangoGroup,
        tokenAccountOwner
      )

      if (accounts) {
        mangoAccounts.push(...accounts)
      }
    }
  }

  const mangoAccountsValue = mangoAccounts.reduce((acc: I80F48, account) => {
    try {
      const value = account.getAssetsValue(mangoGroup!)
      acc = acc.add(value)
      return acc
    } catch (e) {
      console.log(e)
      return acc
    }
  }, new I80F48(new BN(0)))

  return {
    mangoAccountsValue: new BigNumber(toUiDecimals(mangoAccountsValue, 6)),
    mangoAccounts,
  }
}

export const assembleWallets = async (
  connection: ConnectionContext,
  accounts: AssetAccount[],
  domains: Domain[],
  programId: PublicKey,
  mangoGroup: Group | null,
  mangoClient: MangoClient | null,
  councilMintAddress?: string,
  communityMintAddress?: string,
  councilMint?: MintInfo,
  communityMint?: MintInfo,
  realm?: ProgramAccount<Realm>,
  realmConfig?: ProgramAccount<RealmConfigAccount>,
  realmInfo?: RealmInfo
) => {
  const walletMap: { [address: string]: Wallet } = {}
  const programs = accounts.filter(
    (account) => account.type === AccountType.PROGRAM
  ) as ProgramAssetAccount[]
  const programsGroupedByWallet = await groupProgramsByWallet(
    programId,
    programs
  )
  const domainsGroupedByWallet = groupDomainsByWallet(domains)
  const ungovernedAssets: AssetAccount[] = []
  const governanceToWallet: { [address: string]: string } = {}

  for (const account of accounts) {
    let walletAddress = ''
    if (account.isSol && account.extensions.transferAddress) {
      walletAddress = account.extensions.transferAddress.toBase58()
    } else if (account.governance.pubkey) {
      walletAddress = account.governance.nativeTreasuryAddress.toBase58()
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
        account.governance.account?.activeProposalCount?.toNumber() ||
        account.governance.account?.proposalCount ||
        0
    }

    // We're going to handle NFTs & programs specially
    if (
      account.type !== AccountType.NFT &&
      account.type !== AccountType.PROGRAM
    ) {
      const asset = await convertAccountToAsset(
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
        getProgramDataAccount(connection.current, p.pubkey).then((account) => ({
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

  for (const [walletAddress, domainList] of Object.entries(
    domainsGroupedByWallet
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

    walletMap[walletAddress].assets.unshift({
      type: AssetType.Domain,
      id: 'domain-list',
      count: new BigNumber(domainList.length),
      list: domainList,
    })
  }

  const allWallets: any[] = []
  for (const wallet of Object.values(walletMap)) {
    const { mangoAccountsValue } = await fetchMangoAccounts(
      wallet.assets,
      mangoClient,
      mangoGroup
    )

    if (mangoAccountsValue.gt(0)) {
      wallet.assets.push({
        id: 'mango',
        type: AssetType.Mango,
        value: mangoAccountsValue,
      })
    }

    allWallets.push({
      ...wallet,
      name: wallet.governanceAddress
        ? getAccountName(wallet.governanceAddress)
        : getAccountName(wallet.address),
      totalValue: calculateTotalValue(
        wallet.assets.map((asset) =>
          'value' in asset ? asset.value : new BigNumber(0)
        )
      ),
    })
  }

  allWallets.sort((a, b) => {
    if (a.totalValue.isZero() && b.totalValue.isZero()) {
      const aContainsSortable = a.assets.some(
        (asset) => asset.type === AssetType.Programs
      )
      const bContainsSortable = b.assets.some(
        (asset) => asset.type === AssetType.Programs
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

  const auxiliaryAssets = (
    await Promise.all(
      ungovernedAssets.map(
        (account) =>
          convertAccountToAsset({
            ...account,
            type: AccountType.TOKEN,
          }) as Promise<Token | Mango | Sol>
      )
    )
  ).filter(isNotNull)

  const {
    mangoAccountsValue: auxMangoAccountsValue,
  } = await fetchMangoAccounts(auxiliaryAssets, mangoClient!, mangoGroup!)

  if (auxMangoAccountsValue.gt(0)) {
    auxiliaryAssets.unshift({
      id: 'mango',
      type: AssetType.Mango,
      value: auxMangoAccountsValue,
    })
  }

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
            communityTokenConfig: realmConfig?.account.communityTokenConfig,
            councilTokenConfig: realmConfig?.account.councilTokenConfig,
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
