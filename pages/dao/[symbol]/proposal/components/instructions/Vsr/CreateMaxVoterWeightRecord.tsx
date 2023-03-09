import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import useRealm from '@hooks/useRealm'
import { NewProposalContext } from '../../../new'
import InstructionForm, { InstructionInputType } from '../FormCreator'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  getRegistrarPDA,
  getMaxVoterWeightPDA,
} from 'VoteStakeRegistry/sdk/accounts'
import { DEFAULT_VSR_ID, VsrClient } from 'VoteStakeRegistry/sdk/client'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import useWallet from '@hooks/useWallet'
import { heliumVsrPluginsPks, vsrPluginsPks } from '@hooks/useVotingPlugins'

interface CreateVsrMaxVoterWeightRecordForm {
  programId: string | undefined
  governedAccount: AssetAccount | undefined
}

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  programId: yup
    .string()
    .nullable()
    .test((key) => {
      try {
        new PublicKey(key as string)
      } catch (err) {
        return false
      }
      return true
    })
    .required('VSR Program ID is required'),
})

const CreateVsrMaxVoterWeightRecord = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm, realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<CreateVsrMaxVoterWeightRecordForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { wallet, anchorProvider } = useWallet()

  const getInstruction = async (): Promise<UiInstruction> => {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    const returnInvalid = (): UiInstruction => ({
      serializedInstruction: '',
      isValid: false,
      governance: undefined,
    })

    if (
      !isValid ||
      !wallet ||
      !wallet.publicKey ||
      !form ||
      !form.governedAccount?.governance?.account ||
      !form.programId ||
      !realmInfo ||
      !realm
    ) {
      return returnInvalid()
    }

    let instruction: TransactionInstruction
    let vsrClient: VsrClient | HeliumVsrClient | undefined

    if (vsrPluginsPks.includes(form.programId)) {
      vsrClient = await VsrClient.connect(
        anchorProvider,
        new PublicKey(form.programId)
      )
    }

    if (heliumVsrPluginsPks.includes(form.programId)) {
      vsrClient = await HeliumVsrClient.connect(
        anchorProvider,
        new PublicKey(form.programId)
      )
    }

    if (!vsrClient) {
      return returnInvalid()
    }

    const { registrar } = await getRegistrarPDA(
      realm.pubkey,
      realm.account.communityMint,
      vsrClient.program.programId
    )

    if (vsrClient instanceof HeliumVsrClient) {
      instruction = await vsrClient!.program.methods
        .updateMaxVoterWeightV0()
        .accounts({ registrar })
        .instruction()
    } else {
      const { maxVoterWeight } = await getMaxVoterWeightPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        vsrClient!.program.programId!
      )

      instruction = await vsrClient!.program.methods
        .updateMaxVoteWeight()
        .accounts({
          registrar,
          maxVoteWeightRecord: maxVoterWeight,
        })
        .instruction()
    }

    return {
      serializedInstruction: serializeInstructionToBase64(instruction),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form?.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  const inputs = [
    {
      label: 'Wallet',
      initialValue: undefined,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned,
      governance: governance,
      options: assetAccounts.filter(
        (x) =>
          x.governance.pubkey.toBase58() ===
          realm?.account.authority?.toBase58()
      ),
    },
    {
      label: 'Voter Stake Registry Program ID',
      initialValue: form?.programId || DEFAULT_VSR_ID,
      name: 'programId',
      type: InstructionInputType.INPUT,
    },
  ]
  return (
    <>
      <InstructionForm
        outerForm={form}
        setForm={setForm}
        inputs={inputs}
        setFormErrors={setFormErrors}
        formErrors={formErrors}
      ></InstructionForm>
    </>
  )
}

export default CreateVsrMaxVoterWeightRecord
