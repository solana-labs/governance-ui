/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, { InstructionInput } from '../../FormCreator'
import { InstructionInputType } from '../../inputInstructionType'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token,
} from '@solana/spl-token'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import { WSOL_MINT } from '@components/instructions/tools'

type NamePkVal = {
  name: string
  value: PublicKey
}

interface AdminTokenWithdrawTokenFeesForm {
  governedAccount: AssetAccount | null
  token: null | NamePkVal
  holdupTime: number
}

const AdminTokenWithdrawTokenFees = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletOnePointOh()
  const { mangoClient, mangoGroup } = UseMangoV4()
  const { assetAccounts } = useGovernanceAssets()
  const { connection } = useConnection()
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      mangoGroup?.admin &&
      x.extensions.transferAddress?.equals(mangoGroup.admin)
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [tokens, setTokens] = useState<NamePkVal[]>([])
  const [form, setForm] = useState<AdminTokenWithdrawTokenFeesForm>({
    governedAccount: null,
    token: null,
    holdupTime: 0,
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
    const serializedInstruction = ''
    const prerequisiteInstructions: TransactionInstruction[] = []
    const additionalSerializedInstructions: string[] = []
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const bank = mangoGroup!.banksMapByMint.get(
        form.token!.value.toBase58()
      )![0]
      const ataAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        bank.mint,
        form.governedAccount.extensions.transferAddress!,
        true
      )

      const depositAccountInfo = await connection.getAccountInfo(ataAddress)
      if (!depositAccountInfo) {
        // generate the instruction for creating the ATA
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            bank.mint,
            ataAddress,
            form.governedAccount.extensions.transferAddress!,
            wallet.publicKey
          )
        )
      }

      const ix = await mangoClient!.program.methods
        .adminTokenWithdrawFees()
        .accounts({
          group: mangoGroup!.publicKey,
          admin: form.governedAccount.extensions.transferAddress,
          tokenProgram: TOKEN_PROGRAM_ID,
          bank: bank.publicKey,
          vault: bank.vault,
          tokenAccount: ataAddress,
        })
        .instruction()

      additionalSerializedInstructions.push(serializeInstructionToBase64(ix))

      if (bank.mint.toBase58() === WSOL_MINT) {
        additionalSerializedInstructions.push(
          serializeInstructionToBase64(
            Token.createCloseAccountInstruction(
              TOKEN_PROGRAM_ID,
              ataAddress,
              form.governedAccount.extensions.transferAddress!,
              form.governedAccount.extensions.transferAddress!,
              []
            )
          )
        )
      }
    }
    const obj: UiInstruction = {
      prerequisiteInstructions,
      serializedInstruction: serializedInstruction,
      additionalSerializedInstructions: additionalSerializedInstructions,
      isValid,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdupTime,
    }
    return obj
  }

  useEffect(() => {
    const getTokens = async () => {
      const currentTokens = [...mangoGroup!.banksMapByMint.values()].map(
        (x) => ({
          name: x[0].name,
          value: x[0].mint,
        })
      )
      setTokens(currentTokens)
    }
    if (mangoGroup) {
      getTokens()
    }
  }, [mangoGroup])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: solAccounts,
    },
    {
      label: 'Token',
      name: 'token',
      type: InstructionInputType.SELECT,
      initialValue: form.token,
      options: tokens,
    },
    {
      label: 'Instruction hold up time (days)',
      initialValue: form.holdupTime,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'holdupTime',
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

export default AdminTokenWithdrawTokenFees
