import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import * as yup from 'yup'
import { PublicKey } from '@solana/web3.js'
import { getGovernanceProgramVersion } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { createMultisigRealm } from 'actions/createMultisigRealm'
import useQueryContext from '@hooks/useQueryContext'

import {
  // DEFAULT_GOVERNANCE_PROGRAM_ID,
  DEFAULT_TEST_GOVERNANCE_PROGRAM_ID,
} from '@components/instructions/tools'

import { notify } from '@utils/notifications'
import { Section } from 'pages/solana'

import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import FormSummary from '../FormSummary'

export const SESSION_STORAGE_FORM_KEY = 'multisig-form-data'

export const STEP1_SCHEMA = {
  avatar: yup.string(),
  name: yup.string().typeError('Required').required('Required'),
  description: yup.string(),
  programId: yup.string(),
}

export const STEP2_SCHEMA = {
  memberAddresses: yup
    .array()
    .of(yup.string())
    .min(1, 'A DAO needs at least one member')
    .required('Required'),
}

export const STEP3_SCHEMA = {
  quorumThreshold: yup
    .number()
    .typeError('Required')
    .max(100, 'Quorum cannot require more than 100% of members')
    .min(1, 'Quorum must be at least 1% of member')
    .required('Required'),
}

export function getFormData() {
  return JSON.parse(sessionStorage.getItem(SESSION_STORAGE_FORM_KEY) || '{}')
}

export function updateUserInput(schema, setValue) {
  const formData = getFormData()
  Object.keys(schema).forEach((fieldName) => {
    const value = formData[fieldName]
    if (value) {
      setValue(fieldName, value, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  })
}

export default function MultiSigWizard() {
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const { query, push } = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const [currentStep, setCurrentStep] = useState(0)
  const [requestPending, setRequestPending] = useState(false)

  function handleNextButtonClick({ step, data }) {
    const formState = getFormData()

    const nextStep = step + 1
    const updatedFormState = {
      ...formState,
      ...data,
    }

    console.log('next button clicked', updatedFormState)
    sessionStorage.setItem(
      SESSION_STORAGE_FORM_KEY,
      JSON.stringify(updatedFormState)
    )
    push(
      {
        pathname: '/solana/create_dao/[type]',
        query: { type: 'multisig', currentStep: nextStep },
      },
      undefined,
      { shallow: true }
    )
  }

  function handlePreviousButton(currentStep) {
    if (currentStep === 1) {
      push(
        {
          pathname: '/solana/create_dao/',
        },
        undefined,
        { shallow: true }
      )
    } else {
      const previousStep = currentStep - 1
      console.log('Previous click')
      push(
        {
          pathname: '/solana/create_dao/[type]',
          query: { type: 'multisig', currentStep: previousStep },
        },
        undefined,
        { shallow: true }
      )
    }
  }

  async function handleSubmitClick() {
    console.log('submit clicked')
    try {
      console.log('connection', connected, wallet)
      if (!connected) {
        if (wallet) await wallet.connect()
      }
      if (!wallet?.publicKey) {
        throw new Error('No valid wallet connected')
      }
      const formData = getFormData()
      // const programId = formData.testDao || true
      // ? DEFAULT_TEST_GOVERNANCE_PROGRAM_ID
      // : DEFAULT_GOVERNANCE_PROGRAM_ID

      const programId = DEFAULT_TEST_GOVERNANCE_PROGRAM_ID

      const governanceProgramId = new PublicKey(programId)
      const programVersion = await getGovernanceProgramVersion(
        connection.current,
        governanceProgramId
      )
      console.log('CREATE REALM Program', {
        governanceProgramId: governanceProgramId.toBase58(),
        programVersion,
      })

      setRequestPending(true)
      const results = await createMultisigRealm(
        connection.current,
        governanceProgramId,
        programVersion,
        formData.name,
        formData.quorumThreshold,
        formData.memberAddresses.map((w) => new PublicKey(w)),
        wallet
      )

      if (results) {
        sessionStorage.removeItem(SESSION_STORAGE_FORM_KEY)
        push(
          fmtUrlWithCluster(`/dao/${results.realmPk.toBase58()}`),
          undefined,
          { shallow: true }
        )
      } else {
        throw new Error('Something bad happened during this request.')
      }
    } catch (error) {
      setRequestPending(false)
      const err = error as Error
      console.log(error)
      return notify({
        type: 'error',
        message: err.message,
      })
    }
  }

  useEffect(() => {
    if (query?.currentStep && !Array.isArray(query.currentStep)) {
      setCurrentStep(Number(query.currentStep))
    } else {
      setCurrentStep(1)
    }
  }, [query])

  useEffect(() => {
    if (currentStep < 4) {
      return
    }
    const formData = getFormData()
    yup
      .object({
        ...STEP1_SCHEMA,
        ...STEP2_SCHEMA,
        ...STEP3_SCHEMA,
      })
      .isValid(formData)
      .then((valid) => {
        if (!valid) {
          return handlePreviousButton(4)
        }
      })
  }, [currentStep])

  return (
    <div className="pt-24 md:pt-28">
      <Section>
        {currentStep === 1 && (
          <Step1
            onPrevClick={handlePreviousButton}
            onSubmit={handleNextButtonClick}
          />
        )}
        {currentStep === 2 && (
          <Step2
            onPrevClick={handlePreviousButton}
            onSubmit={handleNextButtonClick}
          />
        )}
        {currentStep === 3 && (
          <Step3
            onPrevClick={handlePreviousButton}
            onSubmit={handleNextButtonClick}
          />
        )}
        {currentStep === 4 && (
          <FormSummary
            currentStep={currentStep}
            formData={getFormData()}
            onPrevClick={handlePreviousButton}
            onSubmit={handleSubmitClick}
            submissionPending={requestPending}
          />
        )}
      </Section>
    </div>
  )
}
