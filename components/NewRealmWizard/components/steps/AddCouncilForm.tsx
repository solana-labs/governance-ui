import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormField from '@components/NewRealmWizard/components/FormField'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'
import { RadioGroup } from '@components/NewRealmWizard/components/Input'
import Text from '@components/Text'

import { updateUserInput, validateSolAddress } from '@utils/formValidation'
import TokenAddressInput from '../TokenAddressInput'

export const AddCouncilSchema = {
  addCouncil: yup
    .boolean()
    .oneOf(
      [true, false],
      'You must specify whether you would like to add a council or not'
    )
    .required('Required'),
  useExistingCouncilToken: yup
    .boolean()
    .oneOf([true, false], 'You must specify whether you have a token already')
    .when('addCouncil', {
      is: true,
      then: yup.boolean().required('Required'),
      otherwise: yup.boolean().optional(),
    }),
  councilTokenMintAddress: yup
    .string()
    .when('useExistingCouncilToken', {
      is: (val) => val == true,
      then: yup.string().required('Required'),
      otherwise: yup.string().optional(),
    })
    .test('is-valid-address', 'Please enter a valid Solana address', (value) =>
      value ? validateSolAddress(value) : true
    ),
  transferCouncilMintAuthority: yup
    .boolean()
    .oneOf(
      [true, false],
      'You must specify whether you which to transfer mint authority'
    )
    .when('useExistingCouncilToken', {
      is: (val) => val == true,
      then: yup.boolean().required('Required'),
      otherwise: yup.boolean().optional(),
    }),
}

export interface AddCouncil {
  addCouncil: boolean
}

export default function AddCouncilForm({
  type,
  formData,
  currentStep,
  totalSteps,
  onSubmit,
  onPrevClick,
}) {
  const schema = yup.object(AddCouncilSchema).required()
  const {
    control,
    setValue,
    clearErrors,
    setError,
    handleSubmit,
    watch,
    formState: { isValid, errors },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })
  const addCouncil = watch('addCouncil')
  const useExistingCouncilToken = watch('useExistingCouncilToken')
  const [showTransferMintAuthority, setShowTransferMintAuthority] = useState(
    false
  )

  useEffect(() => {
    updateUserInput(formData, AddCouncilSchema, setValue)
  }, [])

  useEffect(() => {
    if (!useExistingCouncilToken) {
      setValue('councilTokenMintAddress', '')
      setValue('transferCouncilMintAuthority', undefined, {
        shouldValidate: true,
      })
    }
  }, [useExistingCouncilToken])

  function handleTokenInput({ validMintAddress, walletIsMintAuthority }) {
    setShowTransferMintAuthority(walletIsMintAuthority)
    if (walletIsMintAuthority) {
      setValue('transferCouncilMintAuthority', undefined)
    } else {
      setValue('transferCouncilMintAuthority', false, {
        shouldValidate: true,
      })
    }
    console.log({ validMintAddress, walletIsMintAuthority })
    if (!validMintAddress) {
      setError('invalidTokenMintAddress', {
        type: 'is-valid-address',
        message: 'Not a valid token address',
      })

      setValue('transferCouncilMintAuthority', undefined, {
        shouldValidate: true,
      })
    } else {
      clearErrors('invalidTokenMintAddress')
    }
  }

  function serializeValues(values) {
    let data
    if (!values.addCouncil) {
      data = {
        ...values,
        memberAddresses: null,
        quorumThreshold: null,
      }
    } else {
      data = values
    }
    onSubmit({ step: currentStep, data })
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="add-council-form"
    >
      <FormHeader
        type={type}
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription="council details"
        title="Add a council to your DAO."
      />
      <div className="space-y-10 md:space-y-20">
        <Text level="1" className="mt-10 mb-16 md:my-18 md:w-[550px]">
          Council members vote on decisions affecting the DAO and its
          treasuries. Since your DAO already has community voting, you may
          choose not to add council members.
        </Text>
        <FormField title="Do you want to add a council?" description="">
          <Controller
            name="addCouncil"
            control={control}
            defaultValue={undefined}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, ...field } }) => (
              <RadioGroup
                {...field}
                options={[
                  { label: 'Yes', value: true },
                  { label: 'No, skip this step', value: false },
                ]}
              />
            )}
          />
        </FormField>

        {addCouncil && (
          <Controller
            name="useExistingCouncilToken"
            control={control}
            defaultValue={undefined}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, ...field } }) => (
              <FormField
                title="Do you have an existing token for your DAO's council?"
                description=""
              >
                <RadioGroup
                  {...field}
                  options={[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ]}
                />
              </FormField>
            )}
          />
        )}
        {addCouncil && useExistingCouncilToken && (
          <Controller
            name="councilTokenMintAddress"
            control={control}
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <FormField
                title="What is the address of the council token you would like to use?"
                description="You can verify the correct token in the preview below."
                className="mt-10 md:mt-16"
              >
                <TokenAddressInput
                  disabled={!useExistingCouncilToken}
                  field={field}
                  error={
                    error?.message || errors.invalidTokenMintAddress?.message
                  }
                  onValidation={handleTokenInput}
                />
              </FormField>
            )}
          />
        )}
        {addCouncil && useExistingCouncilToken && showTransferMintAuthority && (
          <Controller
            name="transferCouncilMintAuthority"
            control={control}
            defaultValue={undefined}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, ...field } }) => (
              <FormField
                title="Do you want to transfer mint authority of this council token to the DAO?"
                description=""
              >
                <RadioGroup
                  {...field}
                  options={[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ]}
                />
              </FormField>
            )}
          />
        )}
      </div>
      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
      />
    </form>
  )
}
