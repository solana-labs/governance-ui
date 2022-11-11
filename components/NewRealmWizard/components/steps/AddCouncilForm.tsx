import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormField from '@components/NewRealmWizard/components/FormField'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'
import { RadioGroup } from '@components/NewRealmWizard/components/Input'
import AdviceBox from '@components/NewRealmWizard/components/AdviceBox'
import Text from '@components/Text'

import { updateUserInput, validatePubkey } from '@utils/formValidation'
import TokenInput, { TokenWithMintInfo, COUNCIL_TOKEN } from '../TokenInput'

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
      value ? validatePubkey(value) : true
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
  useExistingCouncilToken?: boolean
  councilTokenMintAddress?: string
  transferCouncilMintAuthority?: boolean
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
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })
  const addCouncil = watch('addCouncil')
  const useExistingCouncilToken = watch('useExistingCouncilToken')
  const [councilTokenInfo, setCouncilTokenInfo] = useState<
    TokenWithMintInfo | undefined
  >()
  const forceCouncil =
    formData.useExistingCommunityToken === false ||
    (formData?.communityTokenInfo?.mint?.supplyAsDecimal === 0 &&
      formData.transferCommunityMintAuthority)

  useEffect(() => {
    updateUserInput(formData, AddCouncilSchema, setValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [])

  useEffect(() => {
    setValue('addCouncil', forceCouncil || undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [forceCouncil])

  useEffect(() => {
    if (!useExistingCouncilToken) {
      setValue('councilTokenMintAddress', '')
      setValue('transferCouncilMintAuthority', undefined)
      setCouncilTokenInfo(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [useExistingCouncilToken])

  useEffect(() => {
    if (!addCouncil) {
      setValue('useExistingCouncilToken', undefined, { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [addCouncil])

  function handleTokenInput({ tokenInfo }) {
    setCouncilTokenInfo(tokenInfo)
    setValue('transferCouncilMintAuthority', undefined, {
      shouldValidate: true,
    })
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
      data.councilTokenInfo = councilTokenInfo ? councilTokenInfo : null
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
        title="Add a council to your DAO."
      />
      <div className="space-y-10 md:space-y-20">
        <div className="mt-10 mb-16 md:my-18">
          <AdviceBox
            title="About Councils"
            icon={<img src="/icons/council-icon.svg" alt="council icon" />}
          >
            Council members can supervise and moderate DAO activities. It’s
            recommended to always create the council for DAOs in their
            incubation stage to prevent governance attacks or accidental losses
            of assets managed by the DAO.
          </AdviceBox>
        </div>

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
                disabled={forceCouncil}
              />
            )}
          />
          {forceCouncil && (
            <Text level="2" className="mt-2 text-fgd-2">
              A council is required to govern the DAO until the community token
              is distributed to members.
            </Text>
          )}
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
                    { label: "No, let's create one", value: false },
                  ]}
                />
              </FormField>
            )}
          />
        )}
        {addCouncil && useExistingCouncilToken && (
          <TokenInput
            type={COUNCIL_TOKEN}
            control={control}
            disableMinTokenInput
            onValidation={handleTokenInput}
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
