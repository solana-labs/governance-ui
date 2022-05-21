import { useEffect, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'

import { notify } from '@utils/notifications'

// import { RadioGroup } from '@headlessui/react'
import FormHeader from '../FormHeader'
import FormField from '../FormField'
import FormFooter from '../FormFooter'
import Input, { RadioGroup } from '../Input'

import {
  STEP1_SCHEMA,
  STEP2_SCHEMA,
  getFormData,
  updateUserInput,
} from './Wizard'

function validateSolAddress(address: string) {
  try {
    const pubkey = new PublicKey(address)
    const isSolana = PublicKey.isOnCurve(pubkey.toBuffer())
    return isSolana
  } catch (error) {
    return false
  }
}

export default function Step2({ onSubmit, onPrevClick }) {
  const [validationError, setValidationError] = useState<string>('')
  const schema = yup.object(STEP2_SCHEMA).required()
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    const formData = getFormData()
    yup
      .object(STEP1_SCHEMA)
      .isValid(formData)
      .then((valid) => {
        if (valid) {
          updateUserInput(STEP2_SCHEMA, setValue)
        } else {
          onPrevClick(2)
        }
      })
  }, [])

  function serializeValues(values) {
    onSubmit({ step: 2, data: values })
  }

  function validateInput(input: string) {
    const addressList = input.split(/[\s|,]/).filter((item) => item.length > 2)
    return [...new Set(addressList)].filter((wallet) => {
      return validateSolAddress(wallet)
    })
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="gov-token-step-2"
    >
      <FormHeader
        currentStep={2}
        totalSteps={5}
        stepDescription="Determine Token"
        title="Next, determine the token your DAO will use for dovernance tasks."
        imgSrc="/1-Landing-v2/dao-type-medium-govtoken.png"
        imgAlt="circles spirling"
      />
      <div className="pt-10 space-y-10 md:space-y-12">
        <FormField
          title="Do you have an existing token for your DAO's community?"
          description=""
        >
          <Controller
            name="useExistingToken"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <RadioGroup
                onChange={field.onChange}
                value={field.value}
                onBlur={field.onBlur}
                options={[
                  { label: 'Yes I do', value: true },
                  { label: "No, let's create one", value: false },
                ]}
              />
            )}
          />
        </FormField>
      </div>

      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(2)}
        faqTitle="About Governance Tokens"
      />
    </form>
  )
}
