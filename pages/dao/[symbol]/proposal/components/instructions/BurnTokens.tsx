import React, { useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import { getMintMinAmountAsDecimal, parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import {
    BurnTokensForm,
    UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import { getBurnTokensSchema } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance, serializeInstructionToBase64 } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { TOKEN_PROGRAM_ID, Token, u64} from "@solana/spl-token"
import { validateInstruction } from '@utils/instructionTools'

const BurnTokens = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { governedSPLTokenAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<BurnTokensForm>({
    amount: undefined,
    governedTokenAccount: undefined,
    mintInfo: undefined,
  })
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [formErrors, setFormErrors] = useState({})
  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setMintInfo = (value) => {
    setForm({ ...form, mintInfo: value })
  }
  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }
  const validateAmountOnBlur = () => {
    const value = form.amount

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    
    if (form.amount && isValid && form.governedTokenAccount) {
        const mintPK = form.governedTokenAccount.extensions.mint!.publicKey
        const tokenAccount = form.governedTokenAccount.extensions.transferAddress!
        const sourceWallet = form.governedTokenAccount.extensions.token!.account.owner
        
        const burnAmount = parseMintNaturalAmountFromDecimal(
            form.amount!,
            form.governedTokenAccount.extensions.mint!.account.decimals
        )
        
        const burnIx = Token.createBurnInstruction(
            TOKEN_PROGRAM_ID,
            mintPK,
            tokenAccount,
            sourceWallet,
            [],
            new u64(burnAmount.toString())
        )
        
        serializedInstruction = serializeInstructionToBase64(burnIx)
    }

    return {
        serializedInstruction,
        isValid,
        governance: form.governedTokenAccount?.governance,
        chunkBy: 4
    }
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  
  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    setMintInfo(form.governedTokenAccount?.extensions.mint?.account)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form.governedTokenAccount])
  

  const schema = getBurnTokensSchema({ form })

  return (
    <>
      <GovernedAccountSelect
        label="Select Token account"
        governedAccounts={governedSPLTokenAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type="token"
      ></GovernedAccountSelect>
      <Input
        min={mintMinAmount}
        label="Amount to burn"
        value={form.amount}
        type="number"
        onChange={setAmount}
        step={mintMinAmount}
        error={formErrors['amount']}
        onBlur={validateAmountOnBlur}
      />
    </>
  )
}

export default BurnTokens
