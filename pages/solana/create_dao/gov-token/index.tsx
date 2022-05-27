import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { getGovernanceProgramVersion } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'
import { createMultisigRealm } from 'actions/createMultisigRealm'
import useQueryContext from '@hooks/useQueryContext'
import useLocalStorageState from '@hooks/useLocalStorageState'
import {
  // DEFAULT_GOVERNANCE_PROGRAM_ID,
  DEFAULT_TEST_GOVERNANCE_PROGRAM_ID,
} from '@components/instructions/tools'

import { notify } from '@utils/notifications'
import { isWizardValid } from '@utils/formValidation'

import { Section } from 'pages/solana'
import Image from 'next/image'
import Navbar from 'components_2/NavBar'

import BasicDetailsForm, {
  BasicDetailsSchema,
  BasicDetails,
} from '../../../../forms/BasicDetailsForm'
import GovTokenDetailsForm, {
  GovTokenDetailsSchema,
  GovTokenDetails,
} from '../../../../forms/GovTokenDetailsForm'
import ApprovalThresholdForm, {
  ApprovalThresholdSchema,
  ApprovalThreshold,
} from '../../../../forms/ApprovalThresholdForm'
import AddCouncilForm, {
  AddCouncilSchema,
  AddCouncil,
} from '../../../../forms/AddCouncilForm'
import InviteMembersForm, {
  InviteMembersSchema,
  InviteMembers,
} from '../../../../forms/InviteMembersForm'
import MemberQuorumThresholdForm, {
  MemberQuorumThresholdSchema,
  MemberQuorumThreshold,
} from '../../../../forms/MemberQuorumThresholdForm'
import CreateDAOWizard from 'components_2/CreateDAOWizard'

export const SESSION_STORAGE_FORM_KEY = 'govtoken-form-data'

type GovToken =
  | (BasicDetails &
      GovTokenDetails &
      ApprovalThreshold &
      AddCouncil &
      InviteMembers &
      MemberQuorumThreshold)
  | Record<string, never>

export default function GovTokenWizard() {
  const [formData, setFormData] = useLocalStorageState<GovToken>(
    SESSION_STORAGE_FORM_KEY,
    {}
  )
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const { pathname, query, push, replace } = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const [requestPending, setRequestPending] = useState(false)
  const currentStep =
    typeof query !== 'undefined'
      ? query.currentStep
        ? Number(query.currentStep)
        : 1
      : 1
  const steps = [
    { Form: BasicDetailsForm, schema: BasicDetailsSchema },
    { Form: GovTokenDetailsForm, schema: GovTokenDetailsSchema },
    { Form: ApprovalThresholdForm, schema: ApprovalThresholdSchema },
    { Form: AddCouncilForm, schema: AddCouncilSchema },
    { Form: InviteMembersForm, schema: InviteMembersSchema },
    { Form: MemberQuorumThresholdForm, schema: MemberQuorumThresholdSchema },
  ]

  function handleNextButtonClick({ step, data }) {
    let nextStep
    if (data.addCouncil === false) {
      // skip to the end
      nextStep = steps.length + 1
    } else {
      nextStep = step + 1
    }

    const updatedFormState = {
      ...formData,
      ...data,
    }

    for (const key in updatedFormState) {
      if (updatedFormState[key] == null) {
        delete updatedFormState[key]
      }
    }

    console.log('next button clicked', step, data, nextStep)

    setFormData(updatedFormState)
    push({ pathname, query: { ...query, currentStep: nextStep } }, undefined, {
      shallow: true,
    })
  }

  function handlePreviousButton(fromStep, overwriteHistory = false) {
    console.log('previous button clicked from step:', fromStep, currentStep)

    if (fromStep == 1) {
      push({ pathname: '/solana/create_dao/' }, undefined, { shallow: true })
    } else {
      let previousStep
      if (fromStep === 7 && !formData?.addCouncil) {
        // skip to the end
        previousStep = 4
      } else {
        previousStep = fromStep - 1
      }
      if (overwriteHistory) {
        replace(
          { pathname, query: { ...query, currentStep: previousStep } },
          undefined,
          { shallow: true }
        )
      } else {
        push(
          { pathname, query: { ...query, currentStep: previousStep } },
          undefined,
          { shallow: true }
        )
      }
    }
  }

  async function handleSubmit() {
    console.log('submit clicked')
    try {
      console.log('connection', connected, wallet)
      if (!connected) {
        if (wallet) await wallet.connect()
      }
      if (!wallet?.publicKey) {
        throw new Error('No valid wallet connected')
      }
      // const formData = getFormData()
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
    if (formData && Object.keys(formData).length > 0) {
      ev.returnValue = true
    }
  }

  useEffect(() => {
    window.addEventListener('beforeunload', promptUserBeforeLeaving)
    return () => {
      window.removeEventListener('beforeunload', promptUserBeforeLeaving)
    }
  }, [])

  useEffect(() => {
    if (!isWizardValid({ currentStep, steps, formData })) {
      handlePreviousButton(currentStep, true)
    }
  }, [currentStep])

  return (
    <div className="relative pb-8 md:pb-20 landing-page">
      <Navbar showWalletButton />
      <div className="fixed top-0 w-[100vw] h-[100vh]">
        <Image
          alt="background image"
          src="/1-Landing-v2/creation-bg-desktop.png"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <div className="pt-24 md:pt-28">
        <Section form>
          <CreateDAOWizard
            type="gov-token"
            steps={steps}
            currentStep={currentStep}
            formData={formData}
            handlePreviousButton={handlePreviousButton}
            handleNextButtonClick={handleNextButtonClick}
            handleSubmit={handleSubmit}
            submissionPending={requestPending}
          />
        </Section>
      </div>
    </div>
  )
}
