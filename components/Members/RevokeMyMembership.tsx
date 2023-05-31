import Button, { LinkButton, SecondaryButton } from '@components/Button'
import Select from '@components/inputs/Select'
import TokenAmountInput from '@components/inputs/TokenAmountInput'
import Modal from '@components/Modal'
import { ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/outline'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import useGovernanceForGovernedAddress from '@hooks/useGovernanceForGovernedAddress'
import useProgramVersion from '@hooks/useProgramVersion'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { createRevokeGoverningTokens } from '@solana/spl-governance'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import { sendTransactionsV3 } from '@utils/sendTransactions'
import useMembershipTypes from 'pages/dao/[symbol]/proposal/components/instructions/SplGov/useMembershipTypes'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'

type Form = {
  membershipPopulation?: 'council' | 'community'
  amount?: string
}
type Errors = {
  [K in keyof Form]?: string
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const Form: FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const wallet = useWalletOnePointOh()
  const { connection } = useConnection()
  const realm = useRealmQuery().data?.result

  const programVersion = useProgramVersion()

  const [isLoading, setIsLoading] = useState(false)

  const membershipTypes = useMembershipTypes()

  const [form, setForm] = useState<Form>({
    amount: '1',
  })

  const [formErrors, setFormErrors] = useState<Errors>({})

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

  // erase errors on dirtying
  useEffect(() => {
    setFormErrors({})
  }, [form])

  const submit = useCallback(async () => {
    if (!programVersion) throw new Error()
    const errors: Errors = {}
    // START jank validation
    if (selectedMint === undefined) {
      errors['membershipPopulation'] = 'Membership type must be defined'
    }
    if (form.amount === undefined || form.amount === '') {
      errors['amount'] = 'An amount must be supplied'
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return false
    }

    if (selectedMint === undefined || form.amount === undefined)
      throw new Error()
    // END jank validation
    // though its worth noting this jank validation is actually a lot easier to debug
    // than current schema based approach because the stack traces are clearer

    if (
      realm === undefined ||
      mintInfo?.result === undefined ||
      governance === undefined ||
      !wallet?.publicKey
    ) {
      throw new Error('proposal created before necessary data is fetched')
    }

    const ix = await createRevokeGoverningTokens(
      realm.owner,
      programVersion,
      realm.pubkey,
      wallet.publicKey,
      selectedMint,
      wallet.publicKey,
      getMintNaturalAmountFromDecimalAsBN(
        parseFloat(form.amount),
        mintInfo.result.decimals
      )
    )

    setIsLoading(true)

    try {
      await sendTransactionsV3({
        connection: connection,
        wallet: wallet,
        transactionInstructions: [
          { instructionsSet: [{ transactionInstruction: ix }] },
        ],
      })
      closeModal()
      location.reload() //TODO invalidate queries (atm there are none used)
    } catch {
      setIsLoading(false)
    }

    setIsLoading(false)
  }, [
    closeModal,
    connection,
    form.amount,
    governance,
    mintInfo?.result,
    programVersion,
    realm,
    selectedMint,
    wallet,
  ])

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <div className="">
              <p className="text-sm text-red-700">
                <b>WARNING!</b> It is not possible to withdraw Membership
                tokens. Using this form will <b>permanently burn</b> your
                membership tokens. This cannot be undone without approval from
                the DAO!
              </p>
            </div>
          </div>
        </div>
      </div>
      <div></div>
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
      <TokenAmountInput
        mint={selectedMint}
        label="Amount of weight to revoke"
        value={form.amount}
        setValue={(x) => setForm((p) => ({ ...p, amount: x }))}
        error={formErrors.amount}
        setError={(x) => setFormErrors((p) => ({ ...p, amount: x }))}
      />
      <div className="flex gap-x-6 justify-end items-center mt-8">
        <SecondaryButton
          disabled={isLoading}
          className="w-44"
          onClick={() => closeModal()}
        >
          Cancel
        </SecondaryButton>

        <Button
          disabled={isLoading}
          className="w-44 flex justify-center items-center"
          onClick={submit}
        >
          Leave DAO
        </Button>
      </div>
    </div>
  )
}

const RevokeMyMembership: FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <LinkButton
        className=" fill-red-400 text-red-400 flex items-center whitespace-nowrap"
        onClick={() => setOpen(true)}
      >
        <XCircleIcon className="flex-shrink-0 h-5 mr-2 w-5" />
        Leave DAO
      </LinkButton>
      {open && (
        <Modal isOpen onClose={() => setOpen(false)}>
          <Form closeModal={() => setOpen(false)} />
        </Modal>
      )}
    </>
  )
}

export default RevokeMyMembership
