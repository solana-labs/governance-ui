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
import { GenericTokenIcon } from '@components/NewRealmWizard/components/TokenInfoTable'
import TokenInput, { TokenWithMintInfo, COMMUNITY_TOKEN } from '../TokenInput'

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
    },
    mode: 'all',
    resolver: yupResolver(schema),
  })
  const useExistingCommunityToken = watch('useExistingCommunityToken')
  const useSupplyFactor = watch('useSupplyFactor')
  const [communityTokenInfo, setCommunityTokenInfo] = useState<
    TokenWithMintInfo | undefined
  >()

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
                description="A user will need at least this many community token to edit the DAO"
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
      </AdvancedOptionsDropdown>

      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
      />
    </form>
  )
}
