import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry'
import { PublicKey } from '@solana/web3.js'
import { MintInfo, u64 } from '@solana/spl-token'

import useWalletStore from 'stores/useWalletStore'
import { preventNegativeNumberInput } from '@utils/helpers'
import { updateUserInput, validateSolAddress } from '@utils/formValidation'
import { tryGetMint } from '@utils/tokens'

// import Header from '@components/Header'
import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormField from '@components/NewRealmWizard/components/FormField'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'
import Input, { RadioGroup } from '@components/NewRealmWizard/components/Input'
import TokenInfoTable, {
  GenericTokenIcon,
} from '@components/NewRealmWizard/components/TokenInfoTable'

export const GovTokenDetailsSchema = {
  useExistingToken: yup
    .boolean()
    .oneOf([true, false], 'You must specify whether you have a token already')
    .required('Required'),
  communityTokenMintAddress: yup
    .string()
    .when('useExistingToken', {
      is: (val) => val == true,
      then: yup.string().required('Required'),
      otherwise: yup.string().optional(),
    })
    .test('is-valid-address', 'Please enter a valid Solana address', (value) =>
      value ? validateSolAddress(value) : true
    ),
  transferCommunityMintAuthorityToDao: yup
    .boolean()
    .oneOf(
      [true, false],
      'You must specify whether you which to transfer mint authority'
    )
    .when('useExistingToken', {
      is: (val) => val == true,
      then: yup.boolean().required('Required'),
      otherwise: yup.boolean().optional(),
    }),
  newTokenName: yup.string(),
  newTokenSymbol: yup.string(),
  minimumNumberOfTokensToEditDao: yup
    .number()
    .positive('Must be greater than 0')
    .transform((value) => (isNaN(value) ? undefined : value)),
  mintSupplyFactor: yup
    .number()
    .positive('Must be greater than 0')
    .max(1, 'Must not be greater than 1')
    .transform((value) => (isNaN(value) ? undefined : value)),
}

export interface GovTokenDetails {
  useExistingToken: boolean
  communityTokenMintAddress?: string
  transferCommunityMintAuthorityToDao?: boolean
  newTokenName?: string
  newTokenSymbol?: string
  minimumNumberOfTokensToEditDao?: number
  mintSupplyFactor?: number
}

interface CommunityTokenInfo extends TokenInfo {
  mint: MintInfo | undefined
}

const PENDING_COIN: CommunityTokenInfo = {
  chainId: 1,
  address: 'pending',
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

const NOTFOUND_COIN: CommunityTokenInfo = {
  ...PENDING_COIN,
  name: '(Token has no name)',
  symbol: '(Token has no symbol)',
}

export default function GovTokenDetailsForm({
  type,
  formData,
  currentStep,
  totalSteps,
  onSubmit,
  onPrevClick,
}) {
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const [tokenList, setTokenList] = useState<TokenInfo[] | undefined>()
  const schema = yup.object(GovTokenDetailsSchema).required()
  const {
    watch,
    control,
    setValue,
    clearErrors,
    setError,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })
  const useExistingToken = watch('useExistingToken')
  const communityTokenMintAddress = watch('communityTokenMintAddress')
  const [tokenInfo, setTokenInfo] = useState<CommunityTokenInfo | undefined>()
  const [showTransferMintAuthority, setShowTransferMintAuthority] = useState(
    false
  )
  const noToken = !tokenInfo || tokenInfo === PENDING_COIN

  useEffect(() => {
    updateUserInput(formData, GovTokenDetailsSchema, setValue)
  }, [])

  useEffect(() => {
    if (useExistingToken && !connected) {
      wallet?.connect()
    }
  }, [useExistingToken, wallet])

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
    async function getMintInfo(communityTokenMintAddress) {
      setTokenInfo(PENDING_COIN)
      const mintInfo = await tryGetMint(
        connection.current,
        new PublicKey(communityTokenMintAddress)
      )
      if (mintInfo) {
        const tokenInfo =
          tokenList?.find(
            (token) => token.address === communityTokenMintAddress
          ) || NOTFOUND_COIN

        setTokenInfo({ ...tokenInfo, mint: mintInfo?.account })
      } else {
        setError('tokenMintAddress', {
          type: 'is-valid-address',
          message: 'Not a valid token address',
        })
        setTokenInfo(undefined)
      }
    }
    clearErrors()
    if (
      communityTokenMintAddress &&
      validateSolAddress(communityTokenMintAddress)
    ) {
      getMintInfo(communityTokenMintAddress)
    } else {
      setTokenInfo(undefined)
    }
  }, [tokenList, communityTokenMintAddress])

  useEffect(() => {
    if (noToken) {
      setShowTransferMintAuthority(false)
      setValue('transferCommunityMintAuthorityToDao', undefined)
    } else if (
      wallet?.publicKey?.toBase58() ===
      tokenInfo?.mint?.mintAuthority?.toBase58()
    ) {
      setShowTransferMintAuthority(true)
      setValue('transferCommunityMintAuthorityToDao', undefined)
    } else {
      setShowTransferMintAuthority(false)
      setValue('transferCommunityMintAuthorityToDao', false, {
        shouldValidate: true,
      })
    }
  }, [noToken, wallet, tokenInfo])

  function serializeValues(values) {
    const data = {
      transferCommunityMintAuthorityToDao: null,
      minimumNumberOfTokensToEditDao: null,
      mintSupplyFactor: null,
      ...values,
    }
    if (values.useExistingToken) {
      data.newTokenName = null
      data.newTokenSymbol = null
      data.tokenInfo = tokenInfo
    } else {
      data.communityTokenMintAddress = null
      data.transferCommunityMintAuthorityToDao = null
      data.tokenInfo = null
    }

    onSubmit({ step: currentStep, data })
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="govtoken-details-form"
    >
      <FormHeader
        type={type}
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription="community token details"
        title="Next, determine the community token your DAO will use for governance tasks."
      />
      <div className="pt-16 space-y-10 md:pt-24 md:space-y-12">
        <FormField
          title="Do you have an existing token for your DAO's community?"
          description=""
        >
          <Controller
            name="useExistingToken"
            control={control}
            defaultValue={undefined}
            render={({ field }) => (
              <div className="pt-3">
                <RadioGroup
                  {...field}
                  options={[
                    { label: 'Yes, I do', value: true },
                    { label: 'No', value: false },
                  ]}
                />
              </div>
            )}
          />
        </FormField>
        {useExistingToken && (
          <>
            <Controller
              name="communityTokenMintAddress"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormField
                  title="What is the address of the token you would like to use?"
                  description="You can verify the correct token in the preview below."
                  className="mt-10 md:mt-16"
                >
                  <Input
                    placeholder="e.g. CwvWQWt5m..."
                    data-testid="dao-name-input"
                    error={
                      errors.communityTokenMintAddress?.message ||
                      errors.tokenMintAddress?.message
                    }
                    success={!noToken ? 'Token found' : undefined}
                    {...field}
                  />
                </FormField>
              )}
            />
            <TokenInfoTable
              tokenInfo={tokenInfo}
              loading={tokenInfo === PENDING_COIN}
            />
          </>
        )}
        {/*
          <>
            <Header
              as="h4"
              className="flex flex-col px-2 py-6 text-center rounded bg-night-grey"
            >
              <div>🎉</div>
              Good news: we can mint you a brand new one!
            </Header>
            <Controller
              name="newTokenName"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormField
                  title="What would you like to name your token?"
                  description="Your generated token will be used for voting power."
                  optional
                >
                  <Input
                    placeholder="e.g. RealmsCoin"
                    data-testid="dao-name-input"
                    error={errors.newTokenName?.message || ''}
                    {...field}
                  />
                </FormField>
              )}
            />

            <Controller
              name="newTokenSymbol"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormField
                  title="What should your token's symbol be?"
                  description="A token's symbol is used in wallets to denote the token."
                  optional
                >
                  <Input
                    placeholder="e.g. REALM"
                    data-testid="dao-name-input"
                    error={errors.newTokenSymbol?.message || ''}
                    {...field}
                  />
                </FormField>
              )}
            />
          </>
        )*/}
        {useExistingToken && (
          <>
            <Controller
              name="minimumNumberOfTokensToEditDao"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormField
                  title="What is the minimum number of tokens needed to edit this DAO's info?"
                  description="A user will need at least this many of your governance token to edit and maintain this DAO."
                  disabled={noToken}
                  optional
                >
                  <Input
                    type="tel"
                    placeholder="1,000,000"
                    data-testid="dao-name-input"
                    Icon={<GenericTokenIcon />}
                    error={errors.minimumNumberOfTokensToEditDao?.message || ''}
                    {...field}
                    disabled={noToken}
                    onChange={(ev) => {
                      preventNegativeNumberInput(ev)
                      field.onChange(ev)
                    }}
                  />
                </FormField>
              )}
            />
          </>
        )}
        {useExistingToken && showTransferMintAuthority && (
          <>
            <FormField
              title="Do you want to transfer mint authority of the token to the DAO?"
              description=""
            >
              <Controller
                name="transferCommunityMintAuthorityToDao"
                control={control}
                defaultValue={undefined}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    options={[
                      { label: 'Yes', value: true },
                      { label: 'No', value: false },
                    ]}
                  />
                )}
              />
            </FormField>
          </>
        )}
        {useExistingToken && (
          <>
            <AdvancedOptionsDropdown
              className={useExistingToken ? undefined : 'mt-8'}
            >
              <Controller
                name="mintSupplyFactor"
                defaultValue=""
                control={control}
                render={({ field }) => (
                  <FormField
                    title="Community mint supply factor"
                    description='This determines the maximum voting weight of the community token. If set to "1" then total supply of the community governance token is equal to 100% vote.'
                    advancedOption
                  >
                    <Input
                      type="tel"
                      placeholder={`1`}
                      Icon={<GenericTokenIcon />}
                      data-testid="programId-input"
                      error={errors.mintSupplyFactor?.message || ''}
                      {...field}
                      onChange={(ev) => {
                        preventNegativeNumberInput(ev)
                        field.onChange(ev)
                      }}
                    />
                  </FormField>
                )}
              />
            </AdvancedOptionsDropdown>
          </>
        )}
      </div>

      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
      />
    </form>
  )
}
