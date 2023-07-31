import { useContext, useEffect, useState } from 'react'
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
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { NewProposalContext } from '../../../new'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { InstructionInputType } from '../inputInstructionType'
import { getMaxVoterWeightRecord } from '@utils/plugin/accounts'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'

interface CreateNftMaxVoterWeightRecord {
  governedAccount: AssetAccount | undefined
}

const CreateNftPluginMaxVoterWeightRecord = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const realm = useRealmQuery().data?.result

  const { realmInfo } = useRealm()
  const nftClient = useVotePluginsClientStore((s) => s.state.nftClient)
  const { assetAccounts } = useGovernanceAssets()
  const wallet = useWalletOnePointOh()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<CreateNftMaxVoterWeightRecord>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form!.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const { maxVoterWeightRecord } = await getMaxVoterWeightRecord(
        realm!.pubkey!,
        realm!.account.communityMint,
        nftClient!.program.programId
      )
      const createMaxVoterWeightRecordix = await nftClient!.program.methods
        .createMaxVoterWeightRecord()
        .accounts({
          maxVoterWeightRecord,
          governanceProgramId: realmInfo!.programId,
          realm: realm!.pubkey,
          realmGoverningTokenMint: realm!.account.communityMint,
          payer: wallet.publicKey!,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .instruction()
      serializedInstruction = serializeInstructionToBase64(
        createMaxVoterWeightRecordix
      )
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form!.governedAccount?.governance,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form?.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
  })
  const inputs: InstructionInput[] = [
    {
      label: 'Wallet',
      initialValue: null,
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

export default CreateNftPluginMaxVoterWeightRecord
