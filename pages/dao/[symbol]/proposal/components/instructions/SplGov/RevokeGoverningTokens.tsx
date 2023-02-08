import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import TokenAmountInput from '@components/inputs/TokenAmountInput'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import useGovernanceForGovernedAddress from '@hooks/useGovernanceForGovernedAddress'
import useProgramVersion from '@hooks/useProgramVersion'
import useRealm from '@hooks/useRealm'
import {
  createRevokeGoverningTokens,
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import { validateSolAddress } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { NewProposalContext } from '../../../new'
import useMembershipTypes from './useMembershipTypes'

type Form = {
  memberKey?: string
  membershipPopulation?: 'council' | 'community'
  amount?: string
}
type Errors = {
  [K in keyof Form]?: string
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const RevokeGoverningTokens: FC<{
  index: number
  governance: ProgramAccount<Governance> | null
}> = ({ index, governance: governanceProp }) => {
  const { handleSetInstructions } = useContext(NewProposalContext)
  const [form, setForm] = useState<Form>({
    amount: '1',
  })
  const [formErrors, setFormErrors] = useState<Errors>({})
  const membershipTypes = useMembershipTypes()
  const { realmInfo, realm } = useRealm()
  const programId: PublicKey | undefined = realmInfo?.programId
  const programVersion = useProgramVersion()

  // If there's only one membership type, we can just select that for the user.
  // @asktree style note: I create a new variable rather than using `setForm` here because I don't like side effects
  const selectedMembershipType = useMemo(
    () =>
      form.membershipPopulation ?? Object.keys(membershipTypes).length === 1
        ? Object.keys(membershipTypes)[0]
        : undefined,
    [form.membershipPopulation, membershipTypes]
  )

  const selectedMint = useMemo(
    () =>
      selectedMembershipType === undefined
        ? undefined
        : (membershipTypes[selectedMembershipType] as PublicKey | undefined),
    [membershipTypes, selectedMembershipType]
  )

  const { data: mintInfo } = useMintInfoByPubkeyQuery(selectedMint)
  const governance = useGovernanceForGovernedAddress(selectedMint)

  const getInstruction = useCallback(async (): Promise<UiInstruction> => {
    const errors: Errors = {}
    // START jank validation
    if (selectedMint === undefined) {
      errors['membershipPopulation'] = 'Membership type must be defined'
    }
    if (form.memberKey === undefined || !validateSolAddress(form.memberKey)) {
      errors['memberKey'] = 'A valid Solana wallet must be supplied'
    }
    if (form.amount === undefined || form.amount === '') {
      errors['amount'] = 'An amount must be supplied'
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return {
        isValid: false,
        serializedInstruction: '', // powerful typing
        governance: undefined,
      }
    }

    if (
      selectedMint === undefined ||
      form.memberKey === undefined ||
      form.amount === undefined
    )
      throw new Error()
    // END jank validation
    // though its worth noting this jank validation is actually a lot easier to debug
    // than current schema based approach because the stack traces are clearer

    const member = new PublicKey(form.memberKey)

    if (
      realm === undefined ||
      programId === undefined ||
      mintInfo?.result === undefined ||
      governance === undefined
    ) {
      throw new Error('proposal created before necessary data is fetched')
    }
    const ix = await createRevokeGoverningTokens(
      programId,
      programVersion,
      realm.pubkey,
      member,
      selectedMint,
      governance.pubkey,
      getMintNaturalAmountFromDecimalAsBN(
        parseFloat(form.amount),
        mintInfo.result.decimals
      )
    )
    return {
      isValid: true,
      serializedInstruction: serializeInstructionToBase64(ix),
      governance: governance,
    }
  }, [
    form.amount,
    form.memberKey,
    governance,
    mintInfo?.result,
    programId,
    programVersion,
    realm,
    selectedMint,
  ])

  // erase errors on dirtying
  useEffect(() => {
    setFormErrors({})
  }, [form])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governance, getInstruction },
      index
    )
  }, [getInstruction, handleSetInstructions, index, governance])

  return (
    <>
      <Select
        label="Membership Type"
        value={selectedMembershipType}
        onChange={(x) => setForm((p) => ({ ...p, membershipPopulation: x }))}
      >
        {Object.keys(membershipTypes).map((x) => (
          <Select.Option key={x} value={x}>
            {capitalizeFirstLetter(x)}
          </Select.Option>
        ))}
      </Select>
      <Input
        label="Member Public Key"
        value={form.memberKey}
        type="text"
        onChange={(e) => setForm((p) => ({ ...p, memberKey: e.target.value }))}
        error={formErrors.memberKey}
      />
      <TokenAmountInput
        mint={selectedMint}
        label="Amount of weight to revoke"
        value={form.amount}
        setValue={(x) => setForm((p) => ({ ...p, amount: x }))}
        error={formErrors.amount}
        setError={(x) => setFormErrors((p) => ({ ...p, amount: x }))}
      />
    </>
  )
}

export default RevokeGoverningTokens
