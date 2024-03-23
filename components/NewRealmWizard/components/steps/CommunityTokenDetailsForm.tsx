import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { preventNegativeNumberInput } from '@utils/helpers'
import { updateUserInput, validatePubkey } from '@utils/formValidation'

import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormField from '@components/NewRealmWizard/components/FormField'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'
import Input, { RadioGroup } from '@components/NewRealmWizard/components/Input'
import { CogIcon, ExternalLinkIcon } from '@heroicons/react/outline'

import { GenericTokenIcon } from '@components/NewRealmWizard/components/TokenInfoTable'
import TokenInput, { TokenWithMintInfo, COMMUNITY_TOKEN } from '../TokenInput'
import { getCoefficients } from '../../../../actions/addPlugins/addQVPlugin'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import CivicPassSelector from '../CivicPassSelector'

export const CommunityTokenSchema = {
  useExistingCommunityToken: yup
    .boolean()
    .oneOf([true, false], 'You must specify whether you have a token already')
    .required('Required'),
  communityTokenMintAddress: yup
    .string()
    .when('useExistingCommunityToken', {
      is: true,
      then: yup.string().required('Required'),
      otherwise: yup.string().optional(),
    })
    .test('is-valid-address', 'Please enter a valid Solana address', (value) =>
      value ? validatePubkey(value) : true
    ),
  transferCommunityMintAuthority: yup
    .boolean()
    .oneOf(
      [true, false],
      'You must specify whether you which to transfer mint authority'
    )
    .when('useExistingCommunityToken', {
      is: true,
      then: yup.boolean().required('Required'),
      otherwise: yup.boolean().optional(),
    }),
  minimumNumberOfCommunityTokensToGovern: yup
    .number()
    .positive('Must be greater than 0')
    .transform((value) => (isNaN(value) ? undefined : value))
    .when('useExistingCommunityToken', {
      is: false,
      then: (schema) => schema.required('Required'),
      otherwise: (schema) => schema.optional(),
    }),
  communityMintSupplyFactor: yup
    .number()
    .positive('Must be greater than 0')
    .max(1, 'Must not be greater than 1')
    .transform((value) => (isNaN(value) ? undefined : value)),
  useSupplyFactor: yup
    .boolean()
    .oneOf(
      [true, false],
      'You must specify what type of max voter weight you want to use.'
    )
    .required('Required'),
  communityAbsoluteMaxVoteWeight: yup
    .number()
    .positive('Must be greater than 0')
    .transform((value) => (isNaN(value) ? undefined : value)),
}

export interface CommunityToken {
  useExistingToken: boolean
  communityTokenMintAddress?: string
  transferCommunityMintAuthority?: boolean
  minimumNumberOfCommunityTokensToGovern?: number
  communityMintSupplyFactor?: number
  isQuadratic?: boolean
  coefficientA: number
  coefficientB: number
  coefficientC: number
  civicPass: string
  useSupplyFactor: boolean
  communityAbsoluteMaxVoteWeight?: number
}

export default function CommunityTokenForm({
  type,
  formData,
  currentStep,
  totalSteps,
  onSubmit,
  onPrevClick,
}) {
  const schema = yup.object(CommunityTokenSchema).required()
  const { connection } = useConnection()

  const {
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isValid },
  } = useForm<any>({
    // @asktree: I set default values here in order to eliminate a bug where a value was only being set as a side effect of opening advanced options
    defaultValues: {
      useSupplyFactor: true,
      isQuadratic: false,
      coefficientA: 1000,
      coefficientB: 0,
      coefficientC: 0,
    },
    mode: 'all',
    resolver: yupResolver(schema),
  })
  const useExistingCommunityToken = watch('useExistingCommunityToken')
  const communityTokenMintAddress = watch('communityTokenMintAddress')
  const useSupplyFactor = watch('useSupplyFactor')
  const isQuadratic = watch('isQuadratic')
  const coefficientA = watch('coefficientA')
  const coefficientB = watch('coefficientB')
  const coefficientC = watch('coefficientC')
  const [communityTokenInfo, setCommunityTokenInfo] = useState<
    TokenWithMintInfo | undefined
  >()

  useEffect(() => {
    const fetchCoefficients = async () => {
      const coefficients = await getCoefficients(
        undefined,
        new PublicKey(communityTokenMintAddress),
        connection
      )
      setValue('coefficientA', coefficients[0].toFixed(2))
      setValue('coefficientB', coefficients[1])
      setValue('coefficientC', coefficients[2])
    }

    // If the user wants to use a pre-existing token, we need to adjust the coefficients ot match the decimals of that token
    if (communityTokenMintAddress) {
      fetchCoefficients()
    }
  }, [connection, communityTokenMintAddress, setValue])

  useEffect(() => {
    updateUserInput(formData, CommunityTokenSchema, setValue)
  }, [formData, setValue])

  useEffect(() => {
    if (!useExistingCommunityToken) {
      setValue('communityTokenMintAddress', undefined)
      // @asktree: it seems wrong that this would be a form value at all given that it has no corresponding user input.
      setValue('suggestedMinTokenAmount', undefined)
      setValue('minimumNumberOfCommunityTokensToGovern', undefined)
      setValue('transferCommunityMintAuthority', undefined, {
        shouldValidate: true,
      })
    }
  }, [setValue, useExistingCommunityToken])

  useEffect(() => {
    if (useSupplyFactor) {
      setValue('communityAbsoluteMaxVoteWeight', undefined)
    } else setValue('communityMintSupplyFactor', undefined)
  }, [setValue, useSupplyFactor])

  function handleTokenInput({ suggestedMinTokenAmount, tokenInfo }) {
    setCommunityTokenInfo(tokenInfo)
    setValue('transferCommunityMintAuthority', undefined, {
      shouldValidate: true,
    })
    setValue('suggestedMinTokenAmount', suggestedMinTokenAmount)
    if (suggestedMinTokenAmount > 0) {
      setValue(
        'minimumNumberOfCommunityTokensToGovern',
        suggestedMinTokenAmount
      )
    } else {
      setValue('minimumNumberOfCommunityTokensToGovern', undefined)
    }
  }

  function serializeValues(values) {
    const data = {
      transferCommunityMintAuthority: null,
      minimumNumberOfCommunityTokensToGovern: null,
      // communityMintSupplyFactor: null,
      ...values,
    }
    if (values.useExistingCommunityToken) {
      data.communityTokenInfo = communityTokenInfo
    } else {
      data.communityTokenMintAddress = null
      data.transferCommunityMintAuthority = null
      data.communityTokenInfo = null
    }

    if (useSupplyFactor) {
      data.communityMintSupplyFactor =
        values.communityMintSupplyFactor === undefined
          ? null
          : values.communityMintSupplyFactor
    } else
      data.communityAbsoluteMaxVoteWeight =
        values.communityAbsoluteMaxVoteWeight === undefined
          ? null
          : values.communityAbsoluteMaxVoteWeight

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
        title="Next, determine the DAO’s community token."
      />
      <div className="mt-16 space-y-10 md:mt-24 md:space-y-20">
        <Controller
          name="useExistingCommunityToken"
          control={control}
          defaultValue={undefined}
          render={({ field: { ref: _, ...field } }) => (
            <div className="pt-3">
              <FormField
                title="Do you have an existing token for your DAO's community?"
                description="Holders of this token will be able to vote and/or edit your DAO."
              >
                <RadioGroup
                  {...field}
                  options={[
                    { label: 'Yes', value: true },
                    { label: "No, let's create one", value: false },
                  ]}
                />
              </FormField>
            </div>
          )}
        />
        {useExistingCommunityToken && (
          <TokenInput
            type={COMMUNITY_TOKEN}
            control={control}
            onValidation={handleTokenInput}
          />
        )}
        {useExistingCommunityToken === false && (
          <Controller
            name="minimumNumberOfCommunityTokensToGovern"
            control={control}
            defaultValue={''}
            render={({ field, fieldState: { error } }) => (
              <FormField
                title="What is the minimum number of community tokens needed to manage this DAO?"
                description="A user will need at least this many community tokens to edit the DAO"
                // advancedOption
              >
                <Input
                  type="tel"
                  placeholder="e.g. 1,000,000"
                  data-testid="dao-name-input"
                  Icon={<GenericTokenIcon />}
                  error={error?.message || ''}
                  {...field}
                  onChange={(ev) => {
                    preventNegativeNumberInput(ev)
                    field.onChange(ev)
                  }}
                />
              </FormField>
            )}
          />
        )}
      </div>

      <AdvancedOptionsDropdown>
        <Controller
          name="useSupplyFactor"
          control={control}
          defaultValue={true}
          render={({ field: { ref: _, ...field } }) => (
            <div className="pt-3">
              <FormField
                title="What type of max voter weight do you want to use?"
                description="This value determines the max voter weight used to calculate voting thresholds."
                advancedOption
              >
                <RadioGroup
                  {...field}
                  options={[
                    { label: 'Supply Fraction', value: true },
                    { label: 'Absolute', value: false },
                  ]}
                />
              </FormField>
            </div>
          )}
        />
        {useSupplyFactor === false && (
          <Controller
            name="communityAbsoluteMaxVoteWeight"
            defaultValue=""
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormField
                title="Absolute max voter weight"
                description="This option use the provided absolute value as max voter weight Irrespectively of the governance token supply."
                advancedOption
                className="mt-6"
              >
                <Input
                  type="tel"
                  placeholder={`1`}
                  Icon={<GenericTokenIcon />}
                  data-testid="programId-input"
                  error={error?.message || ''}
                  {...field}
                  onChange={(ev) => {
                    preventNegativeNumberInput(ev)
                    field.onChange(ev)
                  }}
                />
              </FormField>
            )}
          />
        )}
        {useSupplyFactor && (
          <Controller
            name="communityMintSupplyFactor"
            defaultValue=""
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormField
                title="Circulating supply factor"
                description="This option determines the max voter weight as a fraction of the total circulating supply of the governance token."
                advancedOption
                className="mt-6"
              >
                {isQuadratic && <div className="body-sm mb-2 text-fgd-2">
                  <div>
                    <span className="text-[#5DC9EB]">Note:&nbsp;</span>
                    Quadratic Voting DAOs typically have a lower circulating supply factor
                    than non-quadratic DAOs. This is because the quadratic formula
                    reduces the weight of votes overall.
                  </div>
                  <div>
                    Consider optionally setting a value &lt; 1 here to increase the accuracy of approval thresholds.
                  </div>
                </div>}
                <Input
                  type="tel"
                  placeholder={`1`}
                  Icon={<GenericTokenIcon />}
                  data-testid="programId-input"
                  error={error?.message || ''}
                  {...field}
                  onChange={(ev) => {
                    preventNegativeNumberInput(ev)
                    field.onChange(ev)
                  }}
                />
              </FormField>
            )}
          />
        )}

        <Controller
            name="isQuadratic"
            control={control}
            defaultValue={true}
          render={({ field: { ref: _, ...field } }) => (
            <div className="pt-3 mb-6">
              <FormField
                title="Create a quadratic dao?"
                description="This gives more proportional power to smaller token holders, encouraging community participation. Additionally, the Civic Pass plugin will be included, requiring all users to verify their identity and ensuring sybil resistance by mitigating the risk of fake or duplicate accounts."
                advancedOption
              >
                <RadioGroup
                  {...field}
                  options={[
                    { label: 'Default', value: false },
                    { label: 'Quadratic', value: true },
                  ]}
                />
              </FormField>
            </div>
          )}
        />

        {isQuadratic && (
          <AdvancedOptionsDropdown
            title="Quadratic Configuration"
            icon={
              <CogIcon
                width={24}
                height={24}
                color="#5DC9EB"
                className="mr-2"
              />
            }
          >
            <div className="flex mb-4 items-center">
              <p className="pl-1 border-gray-500 body-small mb-4">
                <i>Changes advised for advanced users only</i>
              </p>
            </div>
            <Controller
              name="civicPass"
              control={control}
              defaultValue={''}
              render={({ field }) => (
                <FormField title="Civic Pass verification">
                  <div className="mt-2 mb-6">
                    <CivicPassSelector
                      selectedPass={field.value}
                      onPassSelected={field.onChange}
                    />
                  </div>
                </FormField>
              )}
            />

            <FormField
              title="Quadratic Coefficients"
              description="Configures the quadratic voting formulae influencing coefficients, which change the weight of votes."
            >
              <div className="mb-4 flex mt-[-16px]">
                <p className="mr-1">See Docs</p>
                <a
                  href="https://docs.realms.today/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLinkIcon className="w-6 h-6 ml-1" color="#5DC9EB" />
                </a>
              </div>
            </FormField>
            <div className="flex space-x-4">
              <Controller
                name="coefficientA"
                control={control}
                defaultValue={''}
                render={({ field, fieldState: { error } }) => (
                  <FormField
                    title="Coefficient A"
                    description=""
                    // advancedOption
                  >
                    <Input
                      type="tel"
                      placeholder="1000"
                      error={error?.message || ''}
                      defaultValue={coefficientA}
                      {...field}
                      onChange={(ev) => {
                        preventNegativeNumberInput(ev)
                        field.onChange(ev)
                      }}
                    />
                  </FormField>
                )}
              />
              <Controller
                name="coefficientB"
                control={control}
                defaultValue={''}
                render={({ field, fieldState: { error } }) => (
                  <FormField
                    title="Coefficient B"
                    description=""
                    // advancedOption
                  >
                    <Input
                      type="tel"
                      placeholder="0"
                      error={error?.message || ''}
                      defaultValue={coefficientB}
                      {...field}
                      onChange={(ev) => {
                        preventNegativeNumberInput(ev)
                        field.onChange(ev)
                      }}
                    />
                  </FormField>
                )}
              />
              <Controller
                name="coefficientC"
                control={control}
                defaultValue={''}
                render={({ field, fieldState: { error } }) => (
                  <FormField
                    title="Coefficient C"
                    description=""
                    // advancedOption
                  >
                    <Input
                      type="tel"
                      placeholder="0"
                      error={error?.message || ''}
                      defaultValue={coefficientC}
                      {...field}
                      onChange={(ev) => {
                        preventNegativeNumberInput(ev)
                        field.onChange(ev)
                      }}
                    />
                  </FormField>
                )}
              />
            </div>
          </AdvancedOptionsDropdown>
        )}
      </AdvancedOptionsDropdown>

      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
      />
    </form>
  )
}
