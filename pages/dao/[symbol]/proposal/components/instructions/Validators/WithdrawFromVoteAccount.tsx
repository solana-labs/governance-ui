import React, { useContext, useEffect, useState } from 'react'
import Input from 'components/inputs/Input'
import * as yup from 'yup'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'

import { PublicKey, StakeProgram, TransactionInstruction, VoteProgram } from '@solana/web3.js'

import {
  UiInstruction,
  ValidatorStakingForm,
  ValidatorWithdrawFromVoteAccountForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { isFormValid } from '@utils/formValidation'
import { web3 } from '@coral-xyz/anchor'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import useRealm from '@hooks/useRealm'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const WithdrawFromVoteAccount= ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useLegacyConnectionContext()
  const programId: PublicKey = StakeProgram.programId
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const wallet = useWalletOnePointOh()

  const [form, setForm] = useState<ValidatorWithdrawFromVoteAccountForm>({
    validatorVoteKey: '',
    authorizedWithdrawerKey: '',
    toPubkey: '',
    amount: 0,
    governedTokenAccount: undefined,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)

  const setValidatorVoteKey = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'validatorVoteKey',
    })
  }

  const setAuthorizedWithdrawerKey = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'authorizedWithdrawerKey',
    })
  }

  const setToPubkey = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'toPubkey',
    })
  }

  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const schema = yup.object().shape({
      validatorVoteKey: yup
        .string()
        .required('Validator vote address is required'),
      authorizedWithdrawerKey: yup
        .string()
        .required('Authorized withdrawer key is required'),
      toPubkey: yup
        .string()
        .required('toPubkey is required'),
      amount: yup
        .number()
        .min(0.1, 'Amount must be positive number')
        .required('Amount is required'),
    })
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  const { realmInfo } = useRealm()

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    const governancePk = governance?.pubkey
    const returnInvalid = (): UiInstruction => {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: undefined,
      }
    }
    const governanceAccount = governance?.account

    if (
      !connection ||
      !isValid ||
      !programId ||
      !governanceAccount ||
      !governancePk ||
      !form.governedTokenAccount?.isSol ||
      !wallet ||
      !wallet.publicKey ||
      !realmInfo
    ) {
      return returnInvalid()
    }

    const prerequisiteInstructions: web3.TransactionInstruction[] = []

    const validatorVotePK: PublicKey = new PublicKey(form.validatorVoteKey)
    const withdrawAmount: number = parseMintNaturalAmountFromDecimal(form.amount!, 9)

    // There is only one ix in the tx.
    // https://github.com/solana-labs/solana-web3.js/blob/79e6a873a7e4aaf326ae6f06d642394738e31265/src/programs/vote.ts#L525
    const withdrawIx: TransactionInstruction = VoteProgram.withdraw({
      authorizedWithdrawerPubkey: new PublicKey(form.authorizedWithdrawerKey),
      lamports: withdrawAmount,
      toPubkey: new PublicKey(form.toPubkey),
      votePubkey: validatorVotePK,
    }).instructions[0];

    return {
      serializedInstruction: serializeInstructionToBase64(withdrawIx),
      isValid: true,
      governance: form.governedTokenAccount.governance,
      prerequisiteInstructions: prerequisiteInstructions,
      chunkBy: 1,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form])

  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
  }, [form.governedTokenAccount])

  return (
    <>
      <GovernedAccountSelect
        label="Source account"
        governedAccounts={governedTokenAccountsWithoutNfts.filter(
          (x) => x.isSol
        )}
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
        label="Validator Vote Address"
        value={form.validatorVoteKey}
        error={formErrors['validatorVoteKey']}
        type="string"
        onChange={setValidatorVoteKey}
      />
      <Input
        label="Authorized Withdrawer Key (Should be DAO wallet)"
        value={form.authorizedWithdrawerKey}
        error={formErrors['authorizedWithdrawerKey']}
        type="string"
        onChange={setAuthorizedWithdrawerKey}
      />
      <Input
        label="toPubkey (where the SOL is going, should be DAO wallet)"
        value={form.toPubkey}
        error={formErrors['toPubkey']}
        type="string"
        onChange={setToPubkey}
      />
      <Input
        label="Amount"
        value={form.amount}
        error={formErrors['amount']}
        type="number"
        min="1"
        onChange={setAmount}
      />
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      >
        Withdraw SOL from vote account. This uses withdraw and not safeWithdraw, so check that the rent exempt amount remains.
      </div>
    </>
  )
}

export default WithdrawFromVoteAccount
