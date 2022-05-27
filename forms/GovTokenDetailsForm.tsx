import { useEffect, useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry'
import * as yup from 'yup'

import { preventNegativeNumberInput } from '@utils/helpers'

import Header from 'components_2/ProductHeader'
import FormHeader from '../components_2/FormHeader'
import FormField from '../components_2/FormField'
import FormFooter from '../components_2/FormFooter'
import AdvancedOptionsDropdown from '../components_2/AdvancedOptionsDropdown'
import Input, { RadioGroup } from '../components_2/Input'
import TokenInfoTable, {
  GenericTokenIcon,
} from '../components_2/TokenInfoTable'

import { updateUserInput, validateSolAddress } from '../utils/formValidation'

const PENDING_COIN = {
  chainId: 1,
  address: 'pending',
  symbol: 'finding symbol...',
  name: 'finding name...',
  decimals: 9,
  logoURI: '',
  tags: [''],
  extensions: {
    facebook: '',
    twitter: '',
    website: '',
  },
}

const NOTFOUND_COIN = {
  ...PENDING_COIN,
  name: '(Token has no name)',
  symbol: '(Token has no symbol)',
}

export const GovTokenDetailsSchema = {
  useExistingToken: yup
    .boolean()
    .oneOf([true, false], 'You must specify whether you have a token already')
    .required('Required'),
  tokenAddress: yup
    .string()
    .when('useExistingToken', {
      is: (val) => val == true,
      then: yup.string().required('Required'),
      otherwise: yup.string().optional(),
    })
    .test('is-valid-address', 'Please enter a valid Solana address', (value) =>
      value ? validateSolAddress(value) : true
    ),
  transferMintAuthorityToDao: yup
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
  tokenAddress?: string
  transferMintAuthorityToDao?: boolean
  newTokenName?: string
  newTokenSymbol?: string
  minimumNumberOfTokensToEditDao?: number
  mintSupplyFactor?: number
}

export default function GovTokenDetailsForm({
  formData,
  currentStep,
  totalSteps,
  onSubmit,
  onPrevClick,
}) {
  const [tokenList, setTokenList] = useState<TokenInfo[] | undefined>()
  const schema = yup.object(GovTokenDetailsSchema).required()
  const {
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })
  const useExistingToken = watch('useExistingToken')
  const tokenAddress = watch('tokenAddress')
  const tokenInfo: TokenInfo | undefined = useMemo(() => {
    if (!tokenList) {
      return PENDING_COIN
    } else if (tokenAddress && validateSolAddress(tokenAddress)) {
      const tokenInfo = tokenList.find(
        (token) => token.address === tokenAddress
      )
      return tokenInfo || NOTFOUND_COIN
    } else {
      return undefined
    }
  }, [tokenAddress, tokenList])
  const noToken = !tokenInfo || tokenInfo === PENDING_COIN

  useEffect(() => {
    updateUserInput(formData, GovTokenDetailsSchema, setValue)
  }, [])

  useEffect(() => {
    // TODO: wire up to cluster
    async function getTokenList() {
      const tokenList = await new TokenListProvider().resolve()
      const filteredTokenList = tokenList
        .filterByClusterSlug('mainnet-beta')
        .getList()
      setTokenList(filteredTokenList)
    }

    getTokenList()
  }, [])

  function serializeValues(values) {
    const data = {
      transferMintAuthorityToDao: null,
      minimumNumberOfTokensToEditDao: null,
      mintSupplyFactor: null,
      ...values,
    }
    if (values.useExistingToken) {
      data.newTokenName = null
      data.newTokenSymbol = null
      data.tokenInfo = tokenInfo
    } else {
      data.tokenAddress = null
      data.transferMintAuthorityToDao = null
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
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription="Determine Token"
        title="Next, determine the token your DAO will use for dovernance tasks."
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
                  onChange={field.onChange}
                  value={field.value}
                  onBlur={field.onBlur}
                  options={[
                    { label: 'Yes I do', value: true },
                    { label: "No, let's create one", value: false },
                  ]}
                />
              </div>
            )}
          />
        </FormField>
        {useExistingToken === true && (
          <>
            <Controller
              name="tokenAddress"
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
                    error={errors.tokenAddress?.message}
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
        {useExistingToken === false && (
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
        )}
        {typeof useExistingToken !== 'undefined' && (
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
        {useExistingToken === true && (
          <>
            <FormField
              title="Do you want to transfer mint authority of the token to the DAO?"
              description=""
              disabled={noToken}
            >
              <Controller
                name="transferMintAuthorityToDao"
                control={control}
                defaultValue={undefined}
                render={({ field }) => (
                  <RadioGroup
                    onChange={field.onChange}
                    value={field.value}
                    onBlur={field.onBlur}
                    options={[
                      { label: 'Yes', value: true },
                      { label: 'No', value: false },
                    ]}
                    disabled={noToken}
                  />
                )}
              />
            </FormField>
          </>
        )}
        {typeof useExistingToken !== 'undefined' && (
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
        faqTitle=""
      />
    </form>
  )
}
