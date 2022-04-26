import React, { useContext, useEffect, useState } from 'react'
import {
  createSetRealmConfig,
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../new'
import useRealm from '@hooks/useRealm'
import { parseMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import { parseMintSupplyFraction } from '@utils/tokens'
import { PublicKey } from '@solana/web3.js'
import { getRealmCfgSchema } from '@utils/validations'
import RealmConfigFormComponent from '../forms/RealmConfigFormComponent'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { AssetAccount } from '@utils/uiTypes/assets'

export interface RealmConfigForm {
  governedAccount: AssetAccount | undefined
  minCommunityTokensToCreateGovernance: number
  communityVoterWeightAddin: string
  removeCouncil: boolean
  maxCommunityVoterWeightAddin: string
  communityMintSupplyFactor: number
}

const RealmConfig = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm, mint, realmInfo } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const shouldBeGoverned = index !== 0 && governance
  const { assetAccounts } = useGovernanceAssets()
  const realmAuthority = assetAccounts.find(
    (x) =>
      x.governance.pubkey.toBase58() === realm?.account.authority?.toBase58()
  )
  const [form, setForm] = useState<RealmConfigForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form!.governedAccount?.governance?.account &&
      wallet?.publicKey &&
      realm
    ) {
      const mintAmount = parseMintNaturalAmountFromDecimalAsBN(
        form!.minCommunityTokensToCreateGovernance!,
        mint!.decimals!
      )
      const instruction = await createSetRealmConfig(
        realmInfo!.programId,
        realmInfo!.programVersion!,
        realm.pubkey,
        realm.account.authority!,
        form?.removeCouncil ? undefined : realm?.account.config.councilMint,
        parseMintSupplyFraction(form!.communityMintSupplyFactor.toString()),
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
  const schema = getRealmCfgSchema({ form })

  return (
    <>
      {realmAuthority && (
        <RealmConfigFormComponent
          setForm={setForm}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
          shouldBeGoverned={!!shouldBeGoverned}
          governedAccount={realmAuthority}
          form={form}
        ></RealmConfigFormComponent>
      )}
    </>
  )
}

export default RealmConfig
