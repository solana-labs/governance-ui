import { useEffect, useState } from 'react'
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry'
import { MintInfo, u64 } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { getMintSupplyAsDecimal } from '@tools/sdk/units'
import useWalletStore from 'stores/useWalletStore'
import { tryGetMint } from '@utils/tokens'
import { validateSolAddress } from '@utils/formValidation'
import { preventNegativeNumberInput } from '@utils/helpers'

import { Controller } from 'react-hook-form'

import FormField from '@components/NewRealmWizard/components/FormField'
import Input, { RadioGroup } from '@components/NewRealmWizard/components/Input'
import TokenInfoTable, {
  GenericTokenIcon,
} from '@components/NewRealmWizard/components/TokenInfoTable'

interface MintInfoWithDecimalSupply extends MintInfo {
  supplyAsDecimal: number
}
export interface TokenWithMintInfo extends TokenInfo {
  mint: MintInfoWithDecimalSupply | undefined
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
    supplyAsDecimal: 0,
  },
}

const NOTFOUND_COIN: TokenWithMintInfo = {
  ...PENDING_COIN,
  name: '',
  symbol: '',
}

export const COMMUNITY_TOKEN = 'community token'
export const COUNCIL_TOKEN = 'council token'

export default function TokenInput({
  type,
  control,
  onValidation,
  disableMinTokenInput = false,
}) {
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const [tokenList, setTokenList] = useState<TokenInfo[] | undefined>()
  const [tokenMintAddress, setTokenMintAddress] = useState('')
  const [tokenInfo, setTokenInfo] = useState<TokenWithMintInfo | undefined>()
  const validMintAddress = tokenInfo && tokenInfo !== PENDING_COIN
  const walletIsMintAuthority =
    wallet?.publicKey &&
    tokenInfo?.mint?.mintAuthority &&
    wallet.publicKey.toBase58() === tokenInfo.mint.mintAuthority.toBase58()
  const invalidAddress =
    !validMintAddress && !/finding/.test(tokenInfo?.name ? tokenInfo.name : '')

  useEffect(() => {
    if (!connected) {
      wallet?.connect()
    }
  }, [wallet])

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

        setTokenInfo({
          ...tokenInfo,
          mint: {
            ...mintInfo.account,
            supplyAsDecimal: getMintSupplyAsDecimal(mintInfo.account),
          },
        })
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
    let suggestedMinTokenAmount = 0
    if (typeof tokenInfo?.mint?.supplyAsDecimal === 'number') {
      suggestedMinTokenAmount = Math.ceil(tokenInfo.mint.supplyAsDecimal * 0.01)
    }

    onValidation({
      // validMintAddress: tokenMintAddress !== '' ? validMintAddress : true,
      validMintAddress,
      tokenInfo,
      suggestedMinTokenAmount,
      walletIsMintAuthority,
    })
  }, [validMintAddress, walletIsMintAuthority, tokenInfo])

  return (
    <>
      <Controller
        name={
          type === COMMUNITY_TOKEN
            ? 'communityTokenMintAddress'
            : 'councilTokenMintAddress'
        }
        control={control}
        defaultValue=""
        render={({ field, fieldState: { error } }) => (
          <FormField
            title="What is the address of the community token you would like to use?"
            description="If your token is listed with Solana, you'll see a preview below."
            className="mt-10 md:mt-16"
          >
            <Input
              placeholder="e.g. CwvWQWt5m..."
              data-testid="token-address-input"
              error={
                error?.message ||
                (invalidAddress ? 'Not a valid token address' : '')
              }
              success={validMintAddress ? 'Token found' : undefined}
              {...field}
              onChange={(ev) => {
                field.onChange(ev)
                setTokenMintAddress(ev.target.value)
              }}
            />
            {tokenInfo?.name && tokenInfo.name !== PENDING_COIN.name && (
              <TokenInfoTable
                tokenInfo={tokenInfo}
                loading={tokenInfo === PENDING_COIN}
              />
            )}
          </FormField>
        )}
      />
      {validMintAddress && (
        <>
          <Controller
            name={
              type === COMMUNITY_TOKEN
                ? 'transferCommunityMintAuthority'
                : 'transferCouncilMintAuthority'
            }
            control={control}
            defaultValue={undefined}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, ...field } }) => (
              <FormField
                title="Do you want to transfer mint authority of the token to the DAO?"
                description=""
              >
                <RadioGroup
                  {...field}
                  options={[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ]}
                  disabled={!connected}
                  disabledValues={!walletIsMintAuthority ? [true] : []}
                  error={
                    !connected
                      ? 'You must connect your wallet to move forward.'
                      : ''
                  }
                  warning={
                    field.value === true
                      ? 'Caution: this will give the DAO exclusive authority to mint more tokens.'
                      : connected && !walletIsMintAuthority
                      ? 'Caution: to select "Yes", connect the wallet which owns this token.'
                      : ''
                  }
                />
              </FormField>
            )}
          />

          {!!tokenInfo?.mint?.supplyAsDecimal && !disableMinTokenInput && (
            <Controller
              name={
                type === COMMUNITY_TOKEN
                  ? 'minimumNumberOfCommunityTokensToGovern'
                  : 'minimumNumberOfCouncilTokensToGovern'
              }
              control={control}
              defaultValue={''}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  title="What is the minimum number of community tokens needed to manage this DAO?"
                  description="A user will need at least this many community token to edit the DAO."
                  disabled={!validMintAddress}
                >
                  <Input
                    type="tel"
                    placeholder="e.g. 1,000,000"
                    data-testid="dao-name-input"
                    Icon={<GenericTokenIcon />}
                    error={error?.message || ''}
                    {...field}
                    disabled={!validMintAddress}
                    onChange={(ev) => {
                      preventNegativeNumberInput(ev)
                      field.onChange(ev)
                    }}
                  />
                </FormField>
              )}
            />
          )}
        </>
      )}
    </>
  )
}
