import { BigNumber } from 'bignumber.js'
import { useEffect, useMemo, useState } from 'react'

import { Domain } from '@models/treasury/Domain'
import { Status, Result } from '@utils/uiTypes/Result'
import { AuxiliaryWallet, Wallet } from '@models/treasury/Wallet'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import useRealm from '@hooks/useRealm'

import { assembleWallets } from './assembleWallets'
import { calculateTokenCountAndValue } from './calculateTokenCountAndValue'
import { getDomains } from './getDomains'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

interface Data {
  auxiliaryWallets: AuxiliaryWallet[]
  icon?: JSX.Element
  governedTokens: {
    counts: Map<string, BigNumber>
    values: Map<string, BigNumber>
  }
  name: string
  totalValue: BigNumber
  wallets: Wallet[]
}

export default function useTreasuryInfo(
  getNftsAndDomains = true
): Result<Data> {
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const { realmInfo } = useRealm()
  const connection = useLegacyConnectionContext()
  const accounts = useGovernanceAssetsStore((s) => s.assetAccounts)

  const loadingGovernedAccounts = useGovernanceAssetsStore(
    (s) => s.loadGovernedAccounts
  )
  const [domainsLoading, setDomainsLoading] = useState(getNftsAndDomains)
  const [auxWallets, setAuxWallets] = useState<AuxiliaryWallet[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [buildingWallets, setBuildingWallets] = useState(getNftsAndDomains)

  const { counts, values } = useMemo(
    () => calculateTokenCountAndValue(accounts),
    [accounts]
  )

  useEffect(() => {
    if (!loadingGovernedAccounts && accounts.length && getNftsAndDomains) {
      setDomainsLoading(true)
      setBuildingWallets(true)

      getDomains(
        accounts.filter((acc) => acc.isSol),
        connection.current
      ).then((domainNames) => {
        setDomains(domainNames)
        setDomainsLoading(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    loadingGovernedAccounts,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    accounts.map((account) => account.pubkey.toBase58()).join('-'),
  ])

  const walletsAsync = useMemo(() => {
    if (domainsLoading || !realmInfo) {
      return Promise.resolve({ wallets: [] })
    } else {
      return assembleWallets(
        connection,
        accounts,
        domains,
        realmInfo.programId,
        realm?.account.config.councilMint?.toBase58(),
        realm?.account.communityMint?.toBase58(),
        councilMint,
        mint,
        realm,
        config,
        realmInfo
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    accounts,
    domains,
    domainsLoading,
    realmInfo,
    connection.current.rpcEndpoint,
  ])

  useEffect(() => {
    setBuildingWallets(true)
    setWallets([])

    if (!domainsLoading && realmInfo) {
      walletsAsync.then(({ auxiliaryWallets, wallets }) => {
        setWallets(wallets)
        setAuxWallets(auxiliaryWallets)
        setBuildingWallets(false)
      })
    }
  }, [walletsAsync, realmInfo, domainsLoading])

  if (!realmInfo || loadingGovernedAccounts || buildingWallets) {
    return {
      _tag: Status.Pending,
    }
  }

  return {
    _tag: Status.Ok,
    data: {
      wallets,
      auxiliaryWallets: auxWallets,
      icon: realmInfo.ogImage ? <img src={realmInfo.ogImage} /> : undefined,
      governedTokens: { counts, values },
      name: realmInfo.displayName || realmInfo.symbol,
      totalValue: [...auxWallets, ...wallets].reduce((acc, wallet) => {
        return acc.plus(wallet.totalValue)
      }, new BigNumber(0)),
    },
  }
}
