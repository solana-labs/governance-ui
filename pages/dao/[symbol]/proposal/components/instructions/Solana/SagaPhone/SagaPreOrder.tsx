/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  SagaPhoneForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import { BN } from '@project-serum/anchor'
import { USDC_MINT } from 'Strategies/protocols/mango/tools'
import {
  DEVNET_ISSUER,
  getPurchaseInstructions,
  MAINNET_ISSUER,
  USDC_DEVNET,
} from '@tools/sagaPhone/mortar'
import { abbreviateAddress } from '@utils/formatting'

const SagaPreOrder = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { connection } = useWalletStore()
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const isDevnet = connection.cluster === 'devnet'
  const ISSUER = isDevnet ? DEVNET_ISSUER : MAINNET_ISSUER
  const SALE_MINT = isDevnet ? USDC_DEVNET : new PublicKey(USDC_MINT)
  const onePhoneDepositPrice = isDevnet ? 250 : 100
  const governedSolAccounts = assetAccounts.filter(
    (solAcc) =>
      solAcc.type === AccountType.SOL &&
      assetAccounts.find(
        (tokenAcc) =>
          tokenAcc.extensions.token?.account.owner.toBase58() ===
            solAcc.extensions.transferAddress?.toBase58() &&
          tokenAcc.extensions.mint?.publicKey.toBase58() ===
            SALE_MINT.toBase58()
      )
  )
  const governedUSDCAccounts = assetAccounts.filter(
    (token) =>
      token.isToken &&
      token.extensions.mint?.publicKey.toBase58() === SALE_MINT.toBase58() &&
      governedSolAccounts.find(
        (solAcc) =>
          solAcc.extensions.transferAddress?.toBase58() ===
          token.extensions.token?.account.owner.toBase58()
      )
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SagaPhoneForm>({
    governedAccount: null,
    quantity: 1,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    let serializedInstructions: string[] = []
    const prequisiteInstructions: TransactionInstruction[] = []
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      //size of ata
      const size = 165
      const rent = await connection.current.getMinimumBalanceForRentExemption(
        size
      )
      const transferRentIx = SystemProgram.transfer({
        fromPubkey: wallet.publicKey!,
        toPubkey: form.governedAccount.extensions.token!.account.owner!,
        lamports: rent,
      })
      prequisiteInstructions.push(transferRentIx)
      //Mango instruction call and serialize
      const instructions = await getPurchaseInstructions(
        form.governedAccount.extensions.token!.account.owner!,
        ISSUER,
        form.governedAccount.extensions.token!.account.owner!,
        SALE_MINT,
        new BN(form.quantity),
        connection.current
      )

      serializedInstructions = instructions.map((x) =>
        serializeInstructionToBase64(x)
      )
    }
    const obj: UiInstruction = {
      prerequisiteInstructions: prequisiteInstructions,
      additionalSerializedInstructions: serializedInstructions,
      serializedInstruction: '',
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realmInfo?.programId])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  const schema = yup.object().shape({
    quantity: yup.number().min(1).required('Mango group is required'),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  const inputs: InstructionInput[] = [
    {
      label: 'USDC account owned by SOL account',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: governedUSDCAccounts,
      assetType: 'token',
      additionalComponent: form.governedAccount?.extensions.token ? (
        <div>
          SOL account:{' '}
          <small>
            {abbreviateAddress(
              form.governedAccount?.extensions.token?.account.owner
            )}
          </small>
        </div>
      ) : null,
    },
    {
      label: 'Quantity',
      initialValue: form.quantity,
      type: InstructionInputType.INPUT,
      validateMinMax: true,
      name: 'quantity',
      inputType: 'number',
      min: 1,
      additionalComponent: (
        <div>
          To Deposit:{' '}
          {form.quantity ? Number(form.quantity) * onePhoneDepositPrice : 0}
        </div>
      ),
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

export default SagaPreOrder
