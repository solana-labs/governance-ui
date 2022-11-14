import React, { useContext, useEffect, useState } from 'react'
import Input from 'components/inputs/Input'
import useRealm from 'hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import {
  UiInstruction,
  CreateTokenMetadataForm,
} from 'utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useGovernanceAssets from 'hooks/useGovernanceAssets'
import { getCreateTokenMetadataSchema } from 'utils/validations'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { getCreateTokenMetadataInstruction } from 'utils/instructionTools'
import { AccountType } from '@utils/uiTypes/assets'
import useWalletStore from 'stores/useWalletStore'

const CreateTokenMetadata = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const mintGovernancesWithMintInfo = assetAccounts.filter(
    (x) => x.type === AccountType.MINT
  )
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<CreateTokenMetadataForm>({
    name: '',
    symbol: '',
    uri: '',
    mintAccount: undefined,
    programId: programId?.toString(),
  })
  const wallet = useWalletStore((s) => s.current)
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [mintAuthority, setMintAuthority] = useState<
    PublicKey | null | undefined
  >(undefined)
  const [payerSolTreasury, setPayerSolTreasury] = useState<
    PublicKey | null | undefined
  >(undefined)
  const [shouldMakeSolTreasury, setShouldMakeSolTreasury] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  function getInstruction(): Promise<UiInstruction> {
    return getCreateTokenMetadataInstruction({
      schema,
      form,
      programId,
      connection,
      wallet,
      governedMintInfoAccount: form.mintAccount,
      setFormErrors,
      mintAuthority,
      payerSolTreasury,
      shouldMakeSolTreasury,
    })
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form, governedAccount])
  useEffect(() => {
    setGovernedAccount(form?.mintAccount?.governance)
    setMintAuthority(form?.mintAccount?.extensions.mint?.account.mintAuthority)
    const currentGovernanceSolTreasury = assetAccounts.filter(
      (x) =>
        x.governance.pubkey.toString() ===
          form.mintAccount?.governance.pubkey.toString() && x.isSol
    )
    if (currentGovernanceSolTreasury.length !== 0) {
      setShouldMakeSolTreasury(false)
      const solTreasury = currentGovernanceSolTreasury[0].pubkey
      setPayerSolTreasury(solTreasury)
    } else if (form.mintAccount != null && governance != null) {
      setShouldMakeSolTreasury(true)
      setPayerSolTreasury(undefined)
    }
  }, [
    form,
    governance,
    setMintAuthority,
    setShouldMakeSolTreasury,
    setPayerSolTreasury,
    assetAccounts,
  ])

  const schema = getCreateTokenMetadataSchema()

  return (
    <>
      <GovernedAccountSelect
        label="Mint"
        governedAccounts={mintGovernancesWithMintInfo}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'mintAccount' })
        }}
        value={form.mintAccount}
        error={formErrors['mintAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

      {shouldMakeSolTreasury && (
        <>
          <div>
            <div className="pb-0.5 text-fgd-3 text-xs">
              This will make SOL wallet for the governance and send SOL ({'<'}{' '}
              0.006) from your wallet to execute the transactions.
            </div>
          </div>
        </>
      )}

      <Input
        label="Name"
        placeholder={'Token name'}
        value={form.name}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'name',
          })
        }
        error={formErrors['name']}
      />
      <Input
        label="Symbol"
        placeholder={'Token symbol like "USDC"'}
        value={form.symbol}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'symbol',
          })
        }
        error={formErrors['symbol']}
      />
      <Input
        label="URI"
        placeholder={'URI for Token metadata JSON'}
        value={form.uri}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uri',
          })
        }
        error={formErrors['uri']}
      />
    </>
  )
}

export default CreateTokenMetadata
