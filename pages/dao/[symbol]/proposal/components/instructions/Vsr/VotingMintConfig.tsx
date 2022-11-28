import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
  //serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import useRealm from '@hooks/useRealm'
import { NewProposalContext } from '../../../new'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../FormCreator'
import { getValidatedPublickKey } from '@utils/validations'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { getScaledFactor } from '@utils/tokens'
import { yearsToSecs } from 'VoteStakeRegistry/tools/dateTools'
import { BN, web3 } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import {
  emptyPk,
  getRegistrarPDA,
  Registrar,
} from 'VoteStakeRegistry/sdk/accounts'
import { DEFAULT_VSR_ID, VsrClient } from 'VoteStakeRegistry/sdk/client'
import useWallet from '@hooks/useWallet'

interface ConfigureCollectionForm {
  programId: string | undefined
  governedAccount: AssetAccount | undefined
  mint: string
  mintIndex: number
  grantAuthority: AssetAccount | undefined
  mintDigitShift: number
  mintUnlockedFactor: number
  mintLockupFactor: number
  mintLockupSaturation: number
}

const VotingMintConfig = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<ConfigureCollectionForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { wallet, anchorProvider } = useWallet()

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form &&
      form!.governedAccount?.governance.pubkey &&
      wallet?.publicKey?.toBase58()
    ) {
      const vsrClient = VsrClient.connect(
        anchorProvider,
        form?.programId ? new web3.PublicKey(form.programId) : undefined
      )
      const digitShift = form.mintDigitShift
      const unlockedScaledFactor = getScaledFactor(form.mintUnlockedFactor)
      const lockupScaledFactor = getScaledFactor(form.mintLockupFactor)
      const lockupSaturationSecs = new BN(
        yearsToSecs(form.mintLockupSaturation).toString()
      )
      const mint = new PublicKey(form.mint)
      const mintIndex = form.mintIndex
      const grantAuthority = form.grantAuthority!.governance.pubkey
      const { registrar } = await getRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        vsrClient!.program.programId!
      )
      let remainingAccounts = [
        {
          pubkey: mint,
          isSigner: false,
          isWritable: false,
        },
      ]

      try {
        // If we can fetch the registrar then use it for the additional mint configs
        // Note: The registrar might not exist if we are setting this for the first time in a single proposal
        // In that case we default to 0 existing mints
        const registrarAcc = (await vsrClient?.program.account.registrar.fetch(
          registrar
        )) as Registrar

        const registrarMints = registrarAcc?.votingMints
          .filter((vm) => !vm.mint.equals(new PublicKey(emptyPk)))
          .map((vm) => {
            return {
              pubkey: vm.mint,
              isSigner: false,
              isWritable: false,
            }
          })

        remainingAccounts = remainingAccounts.concat(registrarMints)
      } catch (ex) {
        console.info("Can't fetch registrar", ex)
      }
      const configureCollectionIx = await vsrClient!.program.methods
        .configureVotingMint(
          mintIndex, // mint index
          digitShift, // digit_shift
          unlockedScaledFactor, // unlocked_scaled_factor
          lockupScaledFactor, // lockup_scaled_factor
          lockupSaturationSecs, // lockup_saturation_secs
          grantAuthority! // grant_authority)
        )
        .accounts({
          registrar,
          realmAuthority: realm!.account.authority,
          mint,
        })
        .remainingAccounts(remainingAccounts)
        .instruction()
      serializedInstruction = serializeInstructionToBase64(
        configureCollectionIx
      )
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form!.governedAccount?.governance,
      chunkSplitByDefault: true,
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
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    grantAuthority: yup
      .object()
      .nullable()
      .required('Grant authority is required'),
    mint: yup
      .string()
      .test(
        'accountTests',
        'mint address validation error',
        function (val: string) {
          if (val) {
            try {
              return !!getValidatedPublickKey(val)
            } catch (e) {
              console.log(e)
              return this.createError({
                message: `${e}`,
              })
            }
          } else {
            return this.createError({
              message: `mint address is required`,
            })
          }
        }
      ),
  })
  const inputs: InstructionInput[] = [
    {
      label: 'Voter Stake Registry Program ID',
      initialValue: DEFAULT_VSR_ID.toString(),
      name: 'programId',
      type: InstructionInputType.INPUT,
    },
    {
      label: 'Governance',
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
    {
      label: 'mint',
      initialValue: realm?.account.communityMint.toBase58() || '',
      inputType: 'text',
      name: 'mint',
      type: InstructionInputType.INPUT,
    },
    {
      label: 'mint index',
      initialValue: 0,
      min: 0,
      inputType: 'number',
      name: 'mintIndex',
      type: InstructionInputType.INPUT,
    },
    {
      label: 'Grant authority (Governance)',
      initialValue: null,
      name: 'grantAuthority',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      options: assetAccounts.filter((x) => x.isToken || x.isSol || x.isNft),
    },
    {
      label: 'mint digit shift',
      initialValue: 0,
      min: 0,
      inputType: 'number',
      name: 'mintDigitShift',
      type: InstructionInputType.INPUT,
    },
    {
      label: 'mint unlocked factor',
      initialValue: 0,
      min: 0,
      inputType: 'number',
      name: 'mintUnlockedFactor',
      type: InstructionInputType.INPUT,
    },
    {
      label: 'mint lockup factor',
      initialValue: 0,
      min: 0,
      inputType: 'number',
      name: 'mintLockupFactor',
      type: InstructionInputType.INPUT,
    },
    {
      label: 'mint lockup saturation (years)',
      initialValue: 0,
      min: 0,
      inputType: 'number',
      name: 'mintLockupSaturation',
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

export default VotingMintConfig
