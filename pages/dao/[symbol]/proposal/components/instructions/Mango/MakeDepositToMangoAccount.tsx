/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { Connection, PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  MangoDepositToMangoAccountForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import {
  Config,
  MangoClient,
  makeDepositInstruction,
  BN,
} from '@blockworks-foundation/mango-client'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../FormCreator'
import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'

const MakeDepositToMangoAccount = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { governedTokenAccounts } = useGovernanceAssets()
  const tokenAccounts = governedTokenAccounts.filter((x) => x.isToken)
  const connection = useWalletStore((s) => s.connection)
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MangoDepositToMangoAccountForm>({
    governedAccount: null,
    amount: 0,
    mangoAccountPk: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const mangoAccountPk = new PublicKey(form.mangoAccountPk)
      const GROUP = connection.cluster === 'devnet' ? 'devnet.3' : 'mainnet.1'
      const mangoConnection =
        connection.cluster === 'localnet'
          ? new Connection(Config.ids().cluster_urls.mainnet)
          : connection.current
      const groupConfig = Config.ids().getGroupWithName(GROUP)!
      const client = new MangoClient(
        connection.current,
        groupConfig.mangoProgramId
      )
      const group = await client.getMangoGroup(groupConfig.publicKey)
      const rootBanks = await group.loadRootBanks(mangoConnection)
      const rootBank = group.tokens.find(
        (x) =>
          x.mint.toBase58() ===
          form.governedAccount?.extensions.mint?.publicKey.toBase58()
      )?.rootBank
      const quoteRootBank = rootBanks[group.getRootBankIndex(rootBank!)]
      const quoteNodeBank = quoteRootBank?.nodeBankAccounts[0]
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount!,
        form.governedAccount.extensions.mint!.account.decimals
      )
      //Mango instruction call and serialize
      const depositIx = makeDepositInstruction(
        groupConfig.mangoProgramId,
        groupConfig.publicKey,
        form.governedAccount.extensions.token!.account.owner,
        group.mangoCache,
        mangoAccountPk,
        quoteRootBank!.publicKey,
        quoteNodeBank!.publicKey,
        quoteNodeBank!.vault,
        form.governedAccount.extensions.transferAddress!,
        new BN(mintAmount)
      )

      serializedInstruction = serializeInstructionToBase64(depositIx)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
      chunkSplitByDefault: true,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [JSON.stringify(form)])
  const schema = yup.object().shape({
    mangoAccountPk: yup
      .string()
      .required('Mango account publickey is required'),
    amount: yup.number().required('Amount is required'),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  const inputs: InstructionInput[] = [
    {
      label: 'Token',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: tokenAccounts,
    },
    {
      label: 'Amount',
      initialValue: form.amount,
      name: 'amount',
      type: InstructionInputType.INPUT,
      inputType: 'number',
    },
    {
      label: 'Mango Account Pk',
      initialValue: form.mangoAccountPk,
      name: 'mangoAccountPk',
      type: InstructionInputType.INPUT,
      inputType: 'text',
    },
  ]

  return (
    <>
      {form && (
        <InstructionForm
          outerForm={form}
          setForm={setForm}
          inputs={inputs}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
        ></InstructionForm>
      )}
    </>
  )
}

export default MakeDepositToMangoAccount
