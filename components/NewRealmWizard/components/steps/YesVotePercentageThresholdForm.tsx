import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormField from '@components/NewRealmWizard/components/FormField'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'
import { InputRangeSlider } from '@components/NewRealmWizard/components/Input'
import Text from '@components/Text'
import AdviceBox from '@components/NewRealmWizard/components/AdviceBox'

import { updateUserInput } from '@utils/formValidation'
import { FORM_NAME as MUTISIG_FORM } from 'pages/realms/new/multisig'

export const CommunityYesVotePercentageSchema = {
  communityYesVotePercentage: yup
    .number()
    .transform((value) => (isNaN(value) ? 0 : value))
    .max(100, 'Approval cannot require more than 100% of votes')
    .min(1, 'Approval must be at least 1% of votes')
    .required('Required'),
}

export interface CommunityYesVotePercentage {
  communityYesVotePercentage: number
}

export const CouncilYesVotePercentageSchema = {
  councilYesVotePercentage: yup
    .number()
    .transform((value) => (isNaN(value) ? 0 : value))
    .max(100, 'Approval cannot require more than 100% of votes')
    .when('$memberAddresses', (memberAddresses, schema) => {
      if (memberAddresses) {
        return schema
          .min(1, 'Quorum must be at least 1% of member')
          .required('Required')
      } else {
        return schema.min(1, 'Quorum must be at least 1% of member')
      }
    }),
}

export interface CouncilYesVotePercentage {
  councilYesVotePercentage: number
}

export default function YesVotePercentageForm({
  type,
  formData,
  currentStep,
  totalSteps,
  forCouncil = false,
  forCommunity = false,
  onSubmit,
  onPrevClick,
  title,
}) {
  const schema = yup
    .object(
      forCommunity
        ? CommunityYesVotePercentageSchema
        : CouncilYesVotePercentageSchema
    )
    .required()
  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
    context: formData,
  })
  const fieldName = forCommunity
    ? 'communityYesVotePercentage'
    : forCouncil
    ? 'councilYesVotePercentage'
    : 'yesVotePercentage'
  const yesVotePercentage = watch(fieldName) || 0

  useEffect(() => {
    updateUserInput(
      formData,
      forCommunity
        ? CommunityYesVotePercentageSchema
        : CouncilYesVotePercentageSchema,
      setValue
    )
  }, [])

  function serializeValues(values) {
    onSubmit({ step: currentStep, data: values })
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="yes-vote-percentage-threshold-form"
    >
      <FormHeader
        type={type}
        currentStep={currentStep}
        totalSteps={totalSteps}
        title={title}
      />
      <div className="mt-16 space-y-10 md:space-y-12">
        <Controller
          name={fieldName}
          control={control}
          defaultValue={60}
          render={({ field, fieldState: { error } }) => (
            <FormField
              title={
                forCommunity
                  ? 'Adjust how much of the community token supply is needed to pass a proposal'
                  : 'Adjust the percentage to determine votes needed to pass a proposal'
              }
              description=""
            >
              <InputRangeSlider
                field={field}
                error={error?.message}
                placeholder="60"
              />
            </FormField>
          )}
        />
      </div>
      <AdviceBox
        title={
          forCommunity
            ? 'Approval percentage'
            : forCouncil
            ? 'Member percentage'
            : 'Yes vote percentage'
        }
        icon={<img src="/icons/threshold-icon.svg" alt="voting icon" />}
      >
        {forCommunity ? (
          <Text level="1">
            Typically, newer DAOs start their community approval quorums around
            60% of total token supply.
          </Text>
        ) : forCouncil && formData?.memberAddresses?.length >= 0 ? (
          <>
            <Text level="1">
              With {formData.memberAddresses.length} members added to your{' '}
              {type === MUTISIG_FORM ? 'wallet' : 'DAO'},
            </Text>
            <Text level="1" className="md:pt-2">
              {Math.ceil(
                (yesVotePercentage * formData.memberAddresses.length) / 100
              )}{' '}
              members would need to approve a proposal for it to pass.
            </Text>
          </>
        ) : (
          <Text level="1">
            Typically, newer DAOs start their approval percentage around 60%.
          </Text>
        )}
      </AdviceBox>

      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
      />
    </form>
  )
}
