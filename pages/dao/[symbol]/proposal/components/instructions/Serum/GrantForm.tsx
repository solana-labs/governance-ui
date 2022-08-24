import GovernedAccountSelect from '@components/inputs/GovernedAccountSelect'
import Input from '@components/inputs/Input'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWallet from '@hooks/useWallet'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  getMintMinAmountAsDecimal,
  parseMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { tryParseKey } from '@tools/validators/pubkey'
import { debounce } from '@utils/debounce'
import { precision } from '@utils/formatting'
import { validatePubkey } from '@utils/formValidation'
import { notify } from '@utils/notifications'
import { SerumGrantLockedForm } from '@utils/uiTypes/proposalCreationTypes'
import { useContext, useEffect, useState } from 'react'
import useSerumGovStore, { MSRM_MINT, SRM_MINT } from 'stores/useSerumGovStore'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'

const GrantForm = ({
  isLocked,
  isMsrm,
  index,
  governance,
}: {
  isLocked: boolean
  isMsrm: boolean
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [userAccount, setUserAccount] = useState<{
    address: PublicKey
    lockIndex: number
    vestIndex: number
  } | null>(null)

  const connection = useWalletStore((s) => s.connection.current)
  const { anchorProvider, wallet } = useWallet()
  const actions = useSerumGovStore((s) => s.actions)
  const programId = useSerumGovStore((s) => s.programId)
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const { handleSetInstructions } = useContext(NewProposalContext)

  const [form, setForm] = useState<SerumGrantLockedForm>({
    governedAccount: undefined,
    owner: '',
    mintInfo: undefined,
    amount: undefined,
    programId: programId.toString(),
  })
  const [formErrors, setFormErrors] = useState({})

  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)

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

  async function getInstruction() {
    if (
      !connection ||
      !programId ||
      !form.mintInfo ||
      !form.amount ||
      !validatePubkey(form.owner) ||
      !form.governedAccount?.governance.account ||
      !form.governedAccount.extensions.mint ||
      !form.governedAccount.extensions.token ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    let ix: TransactionInstruction
    if (isLocked) {
      ix = await actions.getGrantLockedInstruction(
        new PublicKey(form.owner),
        form.governedAccount.extensions.token.account.owner,
        form.governedAccount.pubkey,
        anchorProvider,
        parseMintNaturalAmountFromDecimalAsBN(
          form.amount,
          form.mintInfo.decimals
        ),
        isMsrm
      )
    } else {
      ix = await actions.getGrantVestInstruction(
        new PublicKey(form.owner),
        form.governedAccount.extensions.token.account.owner,
        form.governedAccount.pubkey,
        anchorProvider,
        parseMintNaturalAmountFromDecimalAsBN(
          form.amount,
          form.mintInfo.decimals
        ),
        isMsrm
      )
    }

    if (!ix) {
      notify({ type: 'error', message: 'Could not create instruction.' })
    }

    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    if (form.owner && form.programId) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.owner)
        if (pubKey) {
          const account = await actions.getUserAccount(anchorProvider, pubKey)
          setUserAccount(account)
        } else {
          setFormErrors({
            owner: 'Invalid PublicKey',
            ...formErrors,
          })
          setUserAccount(null)
        }
      })
    } else {
      setUserAccount(null)
    }
  }, [form.owner])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  useEffect(() => {
    setMintInfo(form.governedAccount?.extensions.mint?.account)
  }, [form.governedAccount])

  return (
    <>
      <GovernedAccountSelect
        label={`${isMsrm ? 'MSRM' : 'SRM'} Treasury`}
        governedAccounts={governedTokenAccountsWithoutNfts.filter(
          (acc) =>
            acc.extensions.token?.account.mint.toBase58() ===
            (!isMsrm ? SRM_MINT.toBase58() : MSRM_MINT.toBase58())
        )}
        onChange={(value) => {
          handleSetForm({ propertyName: 'governedAccount', value })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={!!governance}
        governance={governance}
      />
      <Input
        label="Owner"
        value={form.owner}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'owner',
          })
        }
        error={formErrors['owner']}
      />
      {userAccount && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">User Account</div>
          <div className="text-xs pb-1">{userAccount.address.toString()}</div>
          {isLocked ? (
            <>
              <div className="pb-0.5 text-fgd-3 text-xs">Lock Index</div>
              <div className="text-xs">{userAccount.lockIndex}</div>
            </>
          ) : (
            <>
              <div className="pb-0.5 text-fgd-3 text-xs">Vest Index</div>
              <div className="text-xs">{userAccount.vestIndex}</div>
            </>
          )}
        </div>
      )}
      <Input
        min={mintMinAmount}
        label="Amount"
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

export default GrantForm
