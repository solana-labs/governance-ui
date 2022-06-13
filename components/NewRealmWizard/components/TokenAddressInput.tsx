import { useEffect, useState } from 'react'
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry'
import { MintInfo, u64 } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import useWalletStore from 'stores/useWalletStore'
import { tryGetMint } from '@utils/tokens'
import { validateSolAddress } from '@utils/formValidation'

import Input from '@components/NewRealmWizard/components/Input'
import TokenInfoTable from '@components/NewRealmWizard/components/TokenInfoTable'

export interface TokenWithMintInfo extends TokenInfo {
  mint: MintInfo | undefined
}

const PENDING_COIN: TokenWithMintInfo = {
  chainId: 0,
  address: '',
  symbol: 'finding symbol...',
  name: 'finding name...',
  decimals: 9,
  logoURI: '',
  tags: [''],
  extensions: {},
  mint: {
    mintAuthority: null,
    supply: new u64(0),
    freezeAuthority: null,
    decimals: 3,
    isInitialized: false,
  },
}

const NOTFOUND_COIN: TokenWithMintInfo = {
  ...PENDING_COIN,
  name: '',
  symbol: '',
}

export default function TokenAddressInput({
  disabled = false,
  field,
  error,
  onValidation,
  ...props
}) {
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const [tokenList, setTokenList] = useState<TokenInfo[] | undefined>()
  const [tokenMintAddress, setTokenMintAddress] = useState('')
  const [tokenInfo, setTokenInfo] = useState<TokenWithMintInfo | undefined>()
  const validMintAddress = tokenInfo && tokenInfo !== PENDING_COIN

  useEffect(() => {
    if (!disabled && !connected) {
      wallet?.connect()
    }
  }, [disabled, wallet])

  useEffect(() => {
    async function getTokenList() {
      const tokenList = await new TokenListProvider().resolve()
      const filteredTokenList = tokenList
        .filterByClusterSlug(
          connection.cluster === 'mainnet' ? 'mainnet-beta' : connection.cluster
        )
        .getList()
      setTokenList(filteredTokenList)
    }

    getTokenList()
  }, [connection.cluster])

  useEffect(() => {
    async function getTokenInfo(tokenMintAddress) {
      setTokenInfo(PENDING_COIN)
      const mintInfo = await tryGetMint(
        connection.current,
        new PublicKey(tokenMintAddress)
      )
      if (mintInfo) {
        const tokenInfo =
          tokenList?.find((token) => token.address === tokenMintAddress) ||
          NOTFOUND_COIN

        setTokenInfo({ ...tokenInfo, mint: mintInfo?.account })
      } else {
        setTokenInfo(undefined)
      }
    }

    if (tokenMintAddress && validateSolAddress(tokenMintAddress)) {
      getTokenInfo(tokenMintAddress)
    } else {
      setTokenInfo(undefined)
    }
  }, [tokenList, tokenMintAddress])

  useEffect(() => {
    let walletIsMintAuthority = false

    if (
      wallet?.publicKey &&
      tokenInfo?.mint?.mintAuthority &&
      wallet.publicKey.toBase58() === tokenInfo.mint.mintAuthority.toBase58()
    ) {
      walletIsMintAuthority = true
    }

    onValidation({
      validMintAddress: tokenMintAddress !== '' ? validMintAddress : true,
      tokenInfo,
      walletIsMintAuthority,
    })
  }, [validMintAddress, wallet, tokenInfo])

  return !disabled ? (
    <>
      <Input
        placeholder="e.g. CwvWQWt5m..."
        data-testid="token-address-input"
        error={error}
        success={validMintAddress ? 'Token found' : undefined}
        {...field}
        {...props}
        onChange={(ev) => {
          field.onChange(ev)
          props?.onChange && props.onChange(ev)
          setTokenMintAddress(ev.target.value)
        }}
      />
      <TokenInfoTable
        tokenInfo={tokenInfo}
        loading={tokenInfo === PENDING_COIN}
      />
    </>
  ) : (
    <></>
  )
}
