import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '../FormHeader'
import FormField from '../FormField'
import FormFooter from '../FormFooter'
import Input from '../Input'

export default function Step2({ onSubmit, onPrevClick }) {
  const { query } = useRouter()
  const schemaObject = {
    daoMembers: yup.array().of(yup.string()).required('Required'),
  }
  const schema = yup.object(schemaObject).required()
  const {
    setValue,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (query?.step2 && !Array.isArray(query.step2)) {
      const formData = JSON.parse(query.step2)
      Object.keys(schemaObject).forEach((fieldName) => {
        const value = formData[fieldName]
        setValue(fieldName, value, {
          shouldValidate: true,
          shouldDirty: true,
        })
      })
    }
  }, [query])

  function serializeValues(values) {
    onSubmit({ step: 2, data: values })
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="multisig-step-2"
    >
      <FormHeader
        currentStep={2}
        totalSteps={4}
        stepDescription="Invite members"
        title="Next, invite members with their Solana Wallet Address."
        imgSrc="/1-Landing-v2/dao-type-medium-govtoken.png"
        imgAlt="circles spirling"
      />
      <div className="pt-10 space-y-10 md:space-y-12">
        <Controller
          name="daoMembers"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormField
              title="What is the name of your multi-signature DAO?"
              description="It's best to choose a descriptive, memorable name for you and your members."
            >
              <Input
                placeholder="e.g. RealmsDAO"
                data-testid="dao-name-input"
                error={errors.daoName?.message || ''}
                {...field}
              />
            </FormField>
          )}
        />
      </div>
      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(2)}
        faqTitle="About Multisig Membership"
      />
    </form>
  )
}
