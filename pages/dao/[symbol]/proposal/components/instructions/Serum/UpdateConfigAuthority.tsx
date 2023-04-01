import Input from '@components/inputs/Input'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useWalletDeprecated from '@hooks/useWalletDeprecated'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { tryParseKey } from '@tools/validators/pubkey'
import { SerumUpdateConfigAuthority } from '@utils/uiTypes/proposalCreationTypes'
import { useContext, useEffect, useState } from 'react'
import useSerumGovStore, { ConfigAccountType } from 'stores/useSerumGovStore'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'

const UpdateConfigAuthority = ({
  index,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const programId = useSerumGovStore((s) => s.programId)
  const actions = useSerumGovStore((s) => s.actions)
  const connection = useWalletStore((s) => s.connection.current)
  const wallet = useWalletOnePointOh()
  const { anchorProvider } = useWalletDeprecated()

  const [configAccount, setConfigAccount] = useState<ConfigAccountType | null>(
    null
  )

  const [isConfigLoading, setIsConfigLoading] = useState(true)

  const { governedNativeAccounts } = useGovernanceAssets()

  const { handleSetInstructions } = useContext(NewProposalContext)

  const [form, setForm] = useState<SerumUpdateConfigAuthority>({
    governedAccount: undefined,
    newAuthority: undefined,
  })

  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  async function getInstruction() {
    if (
      !connection ||
      !programId ||
      !form.governedAccount?.governance.account ||
      !form.newAuthority ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const newAuthorityPubkey = tryParseKey(form.newAuthority)
    if (!newAuthorityPubkey)
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }

    const ix = await actions.getUpdateConfigAuthorityInstruction(
      anchorProvider,
      form.governedAccount.pubkey,
      newAuthorityPubkey
    )
    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    const loadConfigAccount = async () => {
      setIsConfigLoading(true)

      const config = await actions.getConfigAccount(anchorProvider)

      setConfigAccount(config)
      setIsConfigLoading(false)
    }
    loadConfigAccount()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [])

  useEffect(() => {
    if (configAccount) {
      const configAuthority = governedNativeAccounts.find(
        (a) => a.pubkey.toBase58() === configAccount.configAuthority.toBase58()
      )

      setForm({
        ...form,
        governedAccount: configAuthority,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [configAccount])

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

  if (isConfigLoading) {
    return null
  }

  if (!isConfigLoading && !form.governedAccount) {
    return (
      <>
        <h3>The DAO does not govern the config authority.</h3>
      </>
    )
  }

  return (
    <>
      <Input
        type="text"
        label="New Config Authority"
        value={form.newAuthority}
        onChange={(e) =>
          handleSetForm({ propertyName: 'newAuthority', value: e.target.value })
        }
        error={formErrors['newAuthority']}
      />
    </>
  )
}

export default UpdateConfigAuthority
