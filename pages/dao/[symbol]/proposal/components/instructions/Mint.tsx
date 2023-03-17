import React, { useContext, useEffect, useState } from 'react'
import Input from 'components/inputs/Input'
import useRealm from 'hooks/useRealm'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { precision } from 'utils/formatting'
import useWalletStore from 'stores/useWalletStore'
import { UiInstruction, MintForm } from 'utils/uiTypes/proposalCreationTypes'
import { getAccountName } from 'components/instructions/tools'
import { NewProposalContext } from '../../new'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useGovernanceAssets from 'hooks/useGovernanceAssets'
import { getMintSchema } from 'utils/validations'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { getMintInstruction } from 'utils/instructionTools'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import { useDestination } from '@hooks/useDestination'

const Mint = ({
  index,
  governance,
  initialMintAccount,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
  initialMintAccount?: AssetAccount | undefined
}) => {
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const mintGovernancesWithMintInfo = assetAccounts.filter(
    (x) => x.type === AccountType.MINT
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MintForm>({
    destinationAccount: '',
    // No default mint amount
    amount: undefined,
    mintAccount: initialMintAccount,
    programId: programId?.toString(),
  })
  const wallet = useWalletStore((s) => s.current)
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [formErrors, setFormErrors] = useState({})
  const [address, setAddress] = useState('')
  const mintMinAmount = form.mintAccount
    ? getMintMinAmountAsDecimal(form.mintAccount.extensions.mint!.account)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const { destinationAccount, destinationAddress } = useDestination(
    connection.current,
    address
  )

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
    return getMintInstruction({
      schema,
      form,
      programId,
      connection,
      wallet,
      governedMintInfoAccount: form.mintAccount,
      setFormErrors,
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
    if (destinationAddress) {
      handleSetForm({
        value: destinationAddress.toBase58(),
        propertyName: 'destinationAccount',
      })
    } else {
      handleSetForm({ value: '', propertyName: 'destinationAccount' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [destinationAddress])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form, governedAccount])
  useEffect(() => {
    setGovernedAccount(form?.mintAccount?.governance)
  }, [form.mintAccount])
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const destinationAddressParsed = address.endsWith('.sol')
    ? form.destinationAccount
    : undefined
  const schema = getMintSchema({ form, connection })

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
        type="mint"
      ></GovernedAccountSelect>
      <Input
        label="Destination account"
        value={address}
        type="text"
        onChange={(e) => setAddress(e.target.value)}
        error={formErrors['destinationAccount']}
      />
      {destinationAddressParsed && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">{address}</div>
          <div className="text-xs">{destinationAddressParsed}</div>
        </div>
      )}
      {destinationAccount && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">Account owner</div>
          <div className="text-xs">
            {destinationAccount.account.owner.toString()}
          </div>
        </div>
      )}
      {destinationAccountName && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">Account name</div>
          <div className="text-xs">{destinationAccountName}</div>
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

export default Mint
