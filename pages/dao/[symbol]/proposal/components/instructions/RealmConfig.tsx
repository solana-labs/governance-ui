import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  createSetRealmConfig,
  Governance,
  ProgramAccount,
  PROGRAM_VERSION_V1,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../new'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useRealm from '@hooks/useRealm'
import {
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
  parseMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { GovernedTokenAccount } from '@utils/tokens'
import { PublicKey } from '@solana/web3.js'
import { precision } from '@utils/formatting'
import { getValidatedPublickKey } from '@utils/validations'
import InstructionForm, { InstructionInputType } from './FormCreator'

interface RealmConfigForm {
  governedAccount: GovernedTokenAccount | undefined
  minCommunityTokensToCreateGovernance: number
  communityVoterWeightAddin: string
  removeCouncil: boolean
  maxCommunityVoterWeightAddin: string
}

const RealmConfig = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm, mint, realmInfo, councilMint } = useRealm()
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const wallet = useWalletStore((s) => s.current)
  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<RealmConfigForm>()
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
      const mintAmount = parseMintNaturalAmountFromDecimalAsBN(
        form!.minCommunityTokensToCreateGovernance!,
        mint!.decimals!
      )
      const instruction = await createSetRealmConfig(
        realmInfo!.programId,
        realmInfo!.programVersion!,
        realm!.pubkey,
        realm!.account.authority!,
        form?.removeCouncil ? undefined : realm?.account.config.councilMint,
        realm!.account.config.communityMintMaxVoteWeightSource,
        mintAmount,
        form!.communityVoterWeightAddin
          ? new PublicKey(form!.communityVoterWeightAddin)
          : undefined,
        form?.maxCommunityVoterWeightAddin
          ? new PublicKey(form.maxCommunityVoterWeightAddin)
          : undefined,
        wallet.publicKey
      )
      serializedInstruction = serializeInstructionToBase64(instruction)
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
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    minCommunityTokensToCreateGovernance: yup
      .number()
      .required('Min community tokens to create governance is required'),
    communityVoterWeightAddin: yup
      .string()
      .test(
        'communityVoterWeightAddinTest',
        'communityVoterWeightAddin validation error',
        function (val: string) {
          if (!form?.communityVoterWeightAddin) {
            return true
          }
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
              message: `communityVoterWeightAddin is required`,
            })
          }
        }
      ),
    maxCommunityVoterWeightAddin: yup
      .string()
      .test(
        'maxCommunityVoterWeightAddin',
        'maxCommunityVoterWeightAddin validation error',
        function (val: string) {
          if (!form?.maxCommunityVoterWeightAddin) {
            return true
          }
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
              message: `maxCommunityVoterWeightAddin is required`,
            })
          }
        }
      ),
  })
  const minCommunity = mint ? getMintMinAmountAsDecimal(mint) : 0
  const minCommunityTokensToCreateProposal = getMintDecimalAmount(
    mint!,
    realm!.account.config.minCommunityTokensToCreateGovernance
  )
  const currentPrecision = precision(minCommunity)
  const inputs = [
    {
      label: 'Governance',
      initialValue: null,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned,
      governance: governance,
      options: governedMultiTypeAccounts.filter(
        (x) =>
          x.governance.pubkey.toBase58() ===
          realm?.account.authority?.toBase58()
      ),
    },
    {
      label: 'Min community tokens to create governance',
      initialValue: minCommunityTokensToCreateProposal,
      name: 'minCommunityTokensToCreateGovernance',
      type: InstructionInputType.INPUT,
      inputType: 'number',
      min: minCommunity,
      step: minCommunity,
      hide: !mint,
      validateMinMax: true,
      precision: currentPrecision,
    },
    // {
    //   label: 'Community mint supply factor (max vote weight)',
    //   initialValue:
    //     realm!.account.config.communityMintMaxVoteWeightSource.value.toNumber() /
    //     mint!.supply.toNumber(),
    //   name: 'communityMintSupplyFactor',
    //   type: InstructionInputType.INPUT,
    //   inputType: 'number',
    //   min: minCommunity,
    //   step: minCommunity,
    //   hide: !mint,
    //   validateMinMax: true,
    //   precision: currentPrecision,
    // },
    {
      label: 'Community voter weight addin',
      initialValue: '',
      name: 'communityVoterWeightAddin',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide: realmInfo?.programVersion === PROGRAM_VERSION_V1,
    },
    {
      label: 'Community max voter weight addin',
      initialValue: '',
      name: 'maxCommunityVoterWeightAddin',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide: realmInfo?.programVersion === PROGRAM_VERSION_V1,
    },
    {
      label: 'Remove council',
      initialValue: false,
      name: 'removeCouncil',
      type: InstructionInputType.SWITCH,
      hide: !councilMint,
    },
  ]
  return (
    <>
      <InstructionForm
        setForm={setForm}
        inputs={inputs}
        setFormErrors={setFormErrors}
        formErrors={formErrors}
      ></InstructionForm>
    </>
  )
}

export default RealmConfig
