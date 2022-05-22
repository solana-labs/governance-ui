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

import BasicDetailsForm, { BasicDetailsSchema } from './BasicDetailsForm'
import GovTokenDetailsForm, {
  GovTokenDetailsSchema,
} from './GovTokenDetailsForm'
import ApprovalThresholdForm, {
  ApprovalThresholdSchema,
} from './ApprovalThresholdForm'
import AddCouncilForm, { AddCouncilSchema } from './AddCouncilForm'
import InviteMembersForm, { InviteMembersSchema } from './InviteMembersForm'
import MemberQuorumThresholdForm, {
  MemberQuorumThresholdSchema,
} from './MemberQuorumThresholdForm'
import FormSummary from '../FormSummary'

export const SESSION_STORAGE_FORM_KEY = 'govtoken-form-data'

export function validateSolAddress(address: string) {
  try {
    const pubkey = new PublicKey(address)
    const isSolana = PublicKey.isOnCurve(pubkey.toBuffer())
    return isSolana
  } catch (error) {
    return false
  }
}

export function getFormData() {
  return JSON.parse(sessionStorage.getItem(SESSION_STORAGE_FORM_KEY) || '{}')
}

export function updateUserInput(schema, setValue) {
  const formData = getFormData()
  Object.keys(schema).forEach((fieldName) => {
    const value = formData[fieldName]
    if (typeof value !== 'undefined') {
      setValue(fieldName, value, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  })
}

export default function GovTokenWizard() {
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const { pathname, query, push } = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const [requestPending, setRequestPending] = useState(false)
  const currentStep = query?.currentStep || 1
  const steps = [
    { Form: BasicDetailsForm, schema: BasicDetailsSchema },
    { Form: GovTokenDetailsForm, schema: GovTokenDetailsSchema },
    { Form: ApprovalThresholdForm, schema: ApprovalThresholdSchema },
    { Form: AddCouncilForm, schema: AddCouncilSchema },
    { Form: InviteMembersForm, schema: InviteMembersSchema },
    { Form: MemberQuorumThresholdForm, schema: MemberQuorumThresholdSchema },
  ]

  function handleNextButtonClick({ step, data }) {
    const formState = getFormData()
    let nextStep
    if (data.addCouncil === false) {
      // skip to the end
      nextStep = steps.length + 1
    } else {
      nextStep = step + 1
    }

    const updatedFormState = {
      ...formState,
      ...data,
    }

    console.log('next button clicked', step, data, nextStep)
    sessionStorage.setItem(
      SESSION_STORAGE_FORM_KEY,
      JSON.stringify(updatedFormState)
    )
    push({ pathname, query: { ...query, currentStep: nextStep } }, undefined, {
      shallow: true,
    })
  }

  function handlePreviousButton(currentStep) {
    if (currentStep === 1) {
      push({ pathname: '/solana/create_dao/' }, undefined, { shallow: true })
    } else {
      const formState = getFormData()
      let previousStep
      if (currentStep === 7 && !formState.addCouncil) {
        // skip to the end
        previousStep = 4
      } else {
        previousStep = currentStep - 1
      }

      console.log('Previous click', previousStep)
      push(
        { pathname, query: { ...query, currentStep: previousStep } },
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

  function promptUserBeforeLeaving(ev) {
    ev.preventDefault()
    ev.returnValue = true
  }

  useEffect(() => {
    if (currentStep < steps.length + 1) {
      return
    }
    const formData = getFormData()
    yup
      .object(
        steps.reduce((prev, { schema }) => {
          return {
            ...prev,
            ...schema,
          }
        }, {})
      )
      .isValid(formData)
      .then((valid) => {
        if (!valid) {
          return handlePreviousButton(steps.length + 1)
        }
      })
  }, [currentStep])

  useEffect(() => {
    window.addEventListener('beforeunload', promptUserBeforeLeaving)
    return () => {
      window.removeEventListener('beforeunload', promptUserBeforeLeaving)
    }
  }, [])

  return (
    <div className="pt-24 md:pt-28">
      <Section>
        {steps.map(({ Form }, index, stepList) => {
          return (
            <div
              key={index}
              className={index + 1 == currentStep ? '' : 'hidden'}
            >
              <Form
                currentStep={index + 1}
                totalSteps={steps.length + 1}
                prevStepSchema={
                  index > 0 ? stepList[index - 1].schema : undefined
                }
                onPrevClick={handlePreviousButton}
                onSubmit={handleNextButtonClick}
              />
            </div>
          )
        })}

        {currentStep == steps.length + 1 && (
          <FormSummary
            currentStep={steps.length + 1}
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
