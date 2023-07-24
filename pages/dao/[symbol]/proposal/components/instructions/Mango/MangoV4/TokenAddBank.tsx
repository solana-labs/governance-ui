/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import { PublicKey, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance, SYSTEM_PROGRAM_ID } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, { InstructionInput } from '../../FormCreator'
import { InstructionInputType } from '../../inputInstructionType'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

type NamePkVal = {
  name: string
  value: PublicKey
}

interface TokenAddBankForm {
  governedAccount: AssetAccount | null
  token: null | NamePkVal
  holdupTime: number
}

const TokenAddBank = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletOnePointOh()
  const { mangoGroup, mangoClient } = UseMangoV4()
  const { assetAccounts } = useGovernanceAssets()
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      mangoGroup?.admin &&
      x.extensions.transferAddress?.equals(mangoGroup.admin)
  )
  const [tokens, setTokens] = useState<NamePkVal[]>([])
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<TokenAddBankForm>({
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
    let serializedInstruction = ''
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const token = mangoGroup!.banksMapByMint.get(
        form.token!.value.toBase58()
      )![0]
      const mintInfo = mangoGroup!.mintInfosMapByTokenIndex.get(
        token.tokenIndex
      )
      const banks = mangoGroup!.banksMapByTokenIndex.get(token.tokenIndex)
      const ix = await mangoClient!.program.methods
        .tokenAddBank(Number(token.tokenIndex), Number(banks!.length))
        .accounts({
          group: mangoGroup!.publicKey,
          admin: form.governedAccount.extensions.transferAddress,
          mint: token.mint,
          payer: form.governedAccount.extensions.transferAddress,
          rent: SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SYSTEM_PROGRAM_ID,
          existingBank: banks![banks!.length - 1].publicKey,
          mintInfo: mintInfo!.publicKey,
          vault: token.vault,
        })
        .instruction()

      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdupTime,
    }
    return obj
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

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
      label: 'Instruction hold up time (days)',
      initialValue: form.holdupTime,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'holdupTime',
    },
    {
      label: 'Tokens',
      name: 'token',
      type: InstructionInputType.SELECT,
      initialValue: form.token,
      options: tokens,
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

export default TokenAddBank
