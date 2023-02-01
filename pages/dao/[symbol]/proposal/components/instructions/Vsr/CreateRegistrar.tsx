import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
  SYSTEM_PROGRAM_ID,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import useRealm from '@hooks/useRealm'
import { NewProposalContext } from '../../../new'
import InstructionForm, { InstructionInputType } from '../FormCreator'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { PublicKey, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { getRegistrarPDA } from 'VoteStakeRegistry/sdk/accounts'
import { DEFAULT_VSR_ID, VsrClient } from 'VoteStakeRegistry/sdk/client'
import { web3 } from '@project-serum/anchor'
import useWallet from '@hooks/useWallet'
import { heliumVsrPluginsPks, vsrPluginsPks } from '@hooks/useVotingPlugins'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'

interface CreateVsrRegistrarForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
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
        new web3.PublicKey(key as string)
      } catch (err) {
        return false
      }
      return true
    })
    .required('VSR Program ID is required'),
})

const CreateVsrRegistrar = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm, realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<CreateVsrRegistrarForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { wallet, anchorProvider } = useWallet()

  async function getInstruction(): Promise<UiInstruction> {
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

    let instruction: web3.TransactionInstruction
    let vsrClient: VsrClient | HeliumVsrClient | undefined

    if (vsrPluginsPks.includes(form.programId)) {
      vsrClient = await VsrClient.connect(
        anchorProvider,
        new PublicKey(form.programId)
      )
    }

    if (heliumVsrPluginsPks.includes(form.programId)) {
      vsrClient = await HeliumVsrClient.connect(anchorProvider)
    }

    if (!vsrClient) {
      return returnInvalid()
    }

    const { registrar, registrarBump } = await getRegistrarPDA(
      realm.pubkey,
      realm.account.communityMint,
      vsrClient.program.programId
    )

    if (vsrClient instanceof HeliumVsrClient) {
      instruction = await vsrClient.program.methods
        .initializeRegistrarV0({
          positionUpdateAuthority: null,
        })
        .accounts({
          registrar,
          realm: realm.pubkey,
          governanceProgramId: realmInfo.programId,
          realmAuthority: realm.account.authority!,
          realmGoverningTokenMint: realm.account.communityMint!,
          payer: wallet.publicKey!,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .instruction()
    } else {
      instruction = await vsrClient.program.methods
        .createRegistrar(registrarBump)
        .accounts({
          registrar,
          realm: realm.pubkey,
          governanceProgramId: realmInfo.programId,
          realmAuthority: realm.account.authority!,
          realmGoverningTokenMint: realm.account.communityMint!,
          payer: wallet.publicKey!,
          systemProgram: SYSTEM_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
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
      initialValue: DEFAULT_VSR_ID.toString(),
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

export default CreateVsrRegistrar
