import Input from '@components/inputs/Input'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletDeprecated from '@hooks/useWalletDeprecated'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { SerumUpdateConfigParam } from '@utils/uiTypes/proposalCreationTypes'
import { useContext, useEffect, useState } from 'react'
import useSerumGovStore, { ConfigAccountType } from 'stores/useSerumGovStore'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'
import * as anchor from '@coral-xyz/anchor'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

const UpdateConfigParams = ({
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

  const [form, setForm] = useState<SerumUpdateConfigParam>({
    governedAccount: undefined,
    claimDelay: undefined,
    redeemDelay: undefined,
    cliffPeriod: undefined,
    linearVestingPeriod: undefined,
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
      !form.claimDelay ||
      !form.redeemDelay ||
      !form.cliffPeriod ||
      !form.linearVestingPeriod ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const ix = await actions.getUpdateConfigParamInstruction(
      anchorProvider,
      form.governedAccount.pubkey,
      new anchor.BN(form.claimDelay),
      new anchor.BN(form.redeemDelay),
      new anchor.BN(form.cliffPeriod),
      new anchor.BN(form.linearVestingPeriod)
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

  // Find the config account amongst the native accounts, and set it to the form.
  useEffect(() => {
    if (configAccount) {
      const configAuthority = governedNativeAccounts.find(
        (a) => a.pubkey.toBase58() === configAccount.configAuthority.toBase58()
      )

      setForm({
        governedAccount: configAuthority,
        claimDelay: configAccount.claimDelay.toNumber(),
        redeemDelay: configAccount.redeemDelay.toNumber(),
        cliffPeriod: configAccount.cliffPeriod.toNumber(),
        linearVestingPeriod: configAccount.linearVestingPeriod.toNumber(),
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
        min={1}
        label="Claim Delay"
        value={form.claimDelay}
        type="number"
        onChange={(e) => {
          handleSetForm({
            value: e.target.value,
            propertyName: 'claimDelay',
          })
        }}
        error={formErrors['claimDelay']}
      />
      <Input
        min={1}
        label="Redeem Delay"
        value={form.redeemDelay}
        type="number"
        onChange={(e) => {
          handleSetForm({
            value: e.target.value,
            propertyName: 'redeemDelay',
          })
        }}
        error={formErrors['redeemDelay']}
      />
      <Input
        min={1}
        label="Cliff Period"
        value={form.cliffPeriod}
        type="number"
        onChange={(e) => {
          handleSetForm({
            value: e.target.value,
            propertyName: 'cliffPeriod',
          })
        }}
        error={formErrors['cliffPeriod']}
      />
      <Input
        min={1}
        label="Linear Vesting Period"
        value={form.linearVestingPeriod}
        type="number"
        onChange={(e) => {
          handleSetForm({
            value: e.target.value,
            propertyName: 'linearVestingPeriod',
          })
        }}
        error={formErrors['linearVestingPeriod']}
      />
    </>
  )
}

export default UpdateConfigParams
