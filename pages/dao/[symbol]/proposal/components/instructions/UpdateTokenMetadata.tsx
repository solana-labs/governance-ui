import React, { useContext, useEffect, useState } from 'react'
import Input from 'components/inputs/Input'
import useRealm from 'hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import {
  UiInstruction,
  UpdateTokenMetadataForm,
} from 'utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useGovernanceAssets from 'hooks/useGovernanceAssets'
import { getUpdateTokenMetadataSchema } from 'utils/validations'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { getUpdateTokenMetadataInstruction } from 'utils/instructionTools'
import { AccountType } from '@utils/uiTypes/assets'

const UpdateTokenMetadata = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const mintGovernancesWithMintInfo = assetAccounts.filter(
    (x) => x.type === AccountType.MINT
  )
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<UpdateTokenMetadataForm>({
    name: '',
    symbol: '',
    uri: '',
    mintAccount: undefined,
    programId: programId?.toString(),
  })
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [mintAuthority, setMintAuthority] = useState<
    PublicKey | null | undefined
  >(undefined)
  const [formErrors, setFormErrors] = useState({})

  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  async function getInstruction(): Promise<UiInstruction> {
    return getUpdateTokenMetadataInstruction({
      schema,
      form,
      programId,
      governedMintInfoAccount: form.mintAccount,
      setFormErrors,
      mintAuthority,
    })
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form, governedAccount])
  useEffect(() => {
    setGovernedAccount(form?.mintAccount?.governance)
    setMintAuthority(form?.mintAccount?.extensions.mint?.account.mintAuthority)
  }, [form.mintAccount])

  const schema = getUpdateTokenMetadataSchema()

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
      ></GovernedAccountSelect>

      <Input
        label="Name"
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

export default UpdateTokenMetadata
