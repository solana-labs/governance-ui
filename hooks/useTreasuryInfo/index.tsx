import { BigNumber } from 'bignumber.js'
import { useEffect, useMemo, useState } from 'react'

import { Domain } from '@models/treasury/Domain'
import { NFT } from '@models/treasury/NFT'
import { Status, Result } from '@utils/uiTypes/Result'
import { AuxiliaryWallet, Wallet } from '@models/treasury/Wallet'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'

import { assembleWallets } from './assembleWallets'
import { calculateTokenCountAndValue } from './calculateTokenCountAndValue'
import { getNfts } from './getNfts'
import { getDomains } from './getDomains'

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

export default function useTreasuryInfo(): Result<Data> {
  const { realmInfo, realm, mint, councilMint, config } = useRealm()
  const connection = useWalletStore((s) => s.connection)
  const accounts = useGovernanceAssetsStore((s) => s.assetAccounts)
  const loadingGovernedAccounts = useGovernanceAssetsStore(
    (s) => s.loadGovernedAccounts
  )
  const [nfts, setNfts] = useState<NFT[]>([])
  const [nftsLoading, setNftsLoading] = useState(true)
  const [domainsLoading, setDomainsLoading] = useState(true)
  const [auxWallets, setAuxWallets] = useState<AuxiliaryWallet[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [buildingWallets, setBuildingWallets] = useState(true)

  const { counts, values } = useMemo(
    () => calculateTokenCountAndValue(accounts),
    [accounts]
  )

  useEffect(() => {
    if (!loadingGovernedAccounts && accounts.length) {
      setNftsLoading(true)
      setDomainsLoading(true)
      setBuildingWallets(true)

      getDomains(
        accounts.filter((acc) => acc.isSol),
        connection.current
      ).then((domainNames) => {
        setDomains(domainNames)
        setDomainsLoading(false)
      })

      getNfts(
        accounts
          .map((account) =>
            account.isSol && account.extensions.transferAddress
              ? account.extensions.transferAddress.toBase58()
              : account.governance.pubkey?.toBase58()
          )
          .filter(Boolean)
      ).then((nfts) => {
        setNfts(nfts)
        setNftsLoading(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    loadingGovernedAccounts,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    accounts.map((account) => account.pubkey.toBase58()).join('-'),
  ])

  const walletsAsync = useMemo(() => {
    if (nftsLoading || domainsLoading || !realmInfo) {
      return Promise.resolve({ wallets: [] })
    } else {
      return assembleWallets(
        connection,
        accounts,
        nfts,
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
    nfts,
    nftsLoading,
    domains,
    domainsLoading,
    realmInfo,
    connection.current.rpcEndpoint,
  ])

  useEffect(() => {
    setBuildingWallets(true)
    setWallets([])

    if (!nftsLoading && !domainsLoading && realmInfo) {
      walletsAsync.then(({ auxiliaryWallets, wallets }) => {
        setWallets(wallets)
        setAuxWallets(auxiliaryWallets)
        setBuildingWallets(false)
      })
    }
  }, [walletsAsync, nftsLoading, realmInfo, domainsLoading])

  if (!realmInfo || loadingGovernedAccounts || nftsLoading || buildingWallets) {
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
      totalValue: wallets.reduce((acc, wallet) => {
        return acc.plus(wallet.totalValue)
      }, new BigNumber(0)),
    },
  }
}
