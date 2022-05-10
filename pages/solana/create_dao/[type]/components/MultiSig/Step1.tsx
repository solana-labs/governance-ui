import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { useWalletIdentity } from '@cardinal/namespaces-components'

import { notify } from '@utils/notifications'
import useWalletStore from 'stores/useWalletStore'

import FormHeader from '../FormHeader'
import FormField, { ImageUploader } from '../FormField'
import Input from '../Input'
// import Button from 'components_2/Button'
import FormFooter from '../FormFooter'
import AdvancedOptionsDropdown from '../AdvancedOptionsDropdown'

import {
  DEFAULT_GOVERNANCE_PROGRAM_ID,
  // DEFAULT_TEST_GOVERNANCE_PROGRAM_ID,
} from '@components/instructions/tools'

import { STEP1_SCHEMA, updateUserInput } from './Wizard'

export default function Step1({ onSubmit, onPrevClick }) {
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const { show } = useWalletIdentity()
  const schema = yup.object(STEP1_SCHEMA).required()
  const {
    getValues,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    updateUserInput(STEP1_SCHEMA, setValue)
  }, [])

  function serializeValues(values) {
    onSubmit({ step: 1, data: values })
  }

  function handleAvatarSelect(fileInput) {
    setValue('avatar', fileInput, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  async function handleLinkTwitterClick() {
    if (!connected) {
      try {
        if (wallet) await wallet.connect()
        // @ts-ignore
        await show(wallet, connection.current, connection.cluster)
      } catch (error) {
        const err = error as Error
        return notify({
          type: 'error',
          message: err.message,
        })
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="multisig-step-1"
    >
      <FormHeader
        currentStep={1}
        totalSteps={4}
        stepDescription="Basic details"
        title="Let's gather your Multi-Signature DAO's basic details."
        imgSrc="/1-Landing-v2/dao-type-medium-govtoken.png"
        imgAlt="circles spirling"
      />
      <div className="pt-10 space-y-10 md:space-y-12">
        <ImageUploader
          title="What's your DAO's avatar?"
          description="The avatar you choose will visually represent your DAO"
          optional
          defaultValue={getValues('avatar')}
          error={errors.avatar?.message || ''}
          onSelect={handleAvatarSelect}
        />
        <Controller
          name="name"
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
                error={errors.name?.message || ''}
                {...field}
              />
            </FormField>
          )}
        />
        <Controller
          name="description"
          defaultValue=""
          control={control}
          render={({ field }) => (
            <FormField
              title="How would you describe your DAO?"
              description="What's the best way to communicate the purpose of your DAO and why it's valuable to its members?"
              optional
            >
              <Input
                placeholder="e.g. My DAO is..."
                data-testid="dao-description-input"
                error={errors.description?.message || ''}
                {...field}
              />
            </FormField>
          )}
        />
        {/* <FormField
          title="What is your DAO's Twitter handle?"
          optional
          description="Your your DAO's Twitter  account can connect to Realms (via Cardinal)."
        >
          <Button
            secondary
            bgOverride="bg-[#201f27]"
            type="button"
            onClick={handleLinkTwitterClick}
          >
            <div className="relative flex items-center justify-center px-4">
              <svg
                className="fill-[#6496f6] stroke-[#6496f6]"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23 3.00005C22.0424 3.67552 20.9821 4.19216 19.86 4.53005C19.2577 3.83756 18.4573 3.34674 17.567 3.12397C16.6767 2.90121 15.7395 2.95724 14.8821 3.2845C14.0247 3.61176 13.2884 4.19445 12.773 4.95376C12.2575 5.71308 11.9877 6.61238 12 7.53005V8.53005C10.2426 8.57561 8.50127 8.18586 6.93101 7.39549C5.36074 6.60513 4.01032 5.43868 3 4.00005C3 4.00005 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.50005C20.9991 7.2215 20.9723 6.94364 20.92 6.67005C21.9406 5.66354 22.6608 4.39276 23 3.00005V3.00005Z"
                  stroke="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="pl-2">Link Twitter</div>
            </div>
          </Button>
        </FormField> */}
        <AdvancedOptionsDropdown>
          <Controller
            name="programId"
            defaultValue=""
            control={control}
            render={({ field }) => (
              <FormField
                title="My DAO's Program ID"
                description="When updating, ensure you transfer all assets to a new DAO using the new program. This cannot be changed."
                advancedOption
              >
                <Input
                  placeholder={`e.g. ${DEFAULT_GOVERNANCE_PROGRAM_ID}`}
                  data-testid="programId-input"
                  error={errors.programId?.message || ''}
                  {...field}
                />
              </FormField>
            )}
          />
        </AdvancedOptionsDropdown>
      </div>
      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(1)}
        faqTitle="About Multi-Sigs"
      />
    </form>
  )
}
