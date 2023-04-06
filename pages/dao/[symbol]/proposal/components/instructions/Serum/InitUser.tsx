import Input from '@components/inputs/Input'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { tryParseKey } from '@tools/validators/pubkey'
import { debounce } from '@utils/debounce'
import {
  SerumInitUserForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { useContext, useEffect, useState } from 'react'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { validatePubkey } from '@utils/formValidation'
import useWalletStore from 'stores/useWalletStore'
import useSerumGovStore from 'stores/useSerumGovStore'
import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { NewProposalContext } from '../../../new'
import { findProgramAddressSync } from '@coral-xyz/anchor/dist/cjs/utils/pubkey'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

const InitUser = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const programId = useSerumGovStore((s) => s.programId)
  const actions = useSerumGovStore((s) => s.actions)
  const connection = useWalletStore((s) => s.connection.current)
  const wallet = useWalletOnePointOh()
  const { anchorProvider } = useWalletDeprecated()
  const { governedNativeAccounts } = useGovernanceAssets()

  const [userAccount, setUserAccount] = useState<PublicKey | null>(null)
  const { handleSetInstructions } = useContext(NewProposalContext)

  const [form, setForm] = useState<SerumInitUserForm>({
    governedAccount: undefined,
    owner: '',
    programId: programId.toString(),
  })
  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  useEffect(() => {
    if (form.owner && form.programId) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.owner)
        if (pubKey) {
          const [account] = findProgramAddressSync(
            [Buffer.from('user'), pubKey.toBuffer()],
            new PublicKey(form.programId)
          )
          setUserAccount(account ? account : null)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form.owner])

  async function getInstruction(): Promise<UiInstruction> {
    if (
      !connection ||
      !programId ||
      !validatePubkey(form.owner) ||
      !form.governedAccount?.governance.account ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const ix = await actions.getInitUserInstruction(
      new PublicKey(form.owner),
      form.governedAccount.pubkey,
      anchorProvider
    )

    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  return (
    <>
      <GovernedAccountSelect
        label="Payer"
        governedAccounts={governedNativeAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
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
          <div className="text-xs">{userAccount.toString()}</div>
        </div>
      )}
    </>
  )
}

export default InitUser
