import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import {
  FriktionClaimPendingDepositForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { getFriktionClaimPendingDepositSchema } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { getFriktionClaimPendingDepositInstruction } from '@utils/instructions/Friktion'
import Select from '@components/inputs/Select'
import { FriktionSnapshot, VoltSnapshot } from '@friktion-labs/friktion-sdk'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const FriktionClaimPendingDeposit = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const { realmInfo } = useRealm()
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<FriktionClaimPendingDepositForm>({
    governedTokenAccount: undefined,
    voltVaultId: '',
    programId: programId?.toString(),
    mintInfo: undefined,
  })
  // eslint-disable-next-line @typescript-eslint/ban-types
  const [friktionVolts, setFriktionVolts] = useState<VoltSnapshot[] | null>(
    null
  )
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setMintInfo = (value) => {
    setForm({ ...form, mintInfo: value })
  }

  async function getInstruction(): Promise<UiInstruction> {
    return getFriktionClaimPendingDepositInstruction({
      schema,
      form,
      programId,
      connection,
      wallet,
      setFormErrors,
    })
  }
  useEffect(() => {
    // call for the mainnet friktion volts
    const callfriktionRequest = async () => {
      const response = await fetch(
        'https://friktion-labs.github.io/mainnet-tvl-snapshots/friktionSnapshot.json'
      )
      const parsedResponse = (await response.json()) as FriktionSnapshot
      setFriktionVolts(parsedResponse.allMainnetVolts as VoltSnapshot[])
    }

    callfriktionRequest()
  }, [])

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
  }, [form])
  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    setMintInfo(form.governedTokenAccount?.extensions.mint?.account)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form.governedTokenAccount])
  const schema = getFriktionClaimPendingDepositSchema()

  return (
    <>
      <GovernedAccountSelect
        label="Wallet"
        governedAccounts={governedTokenAccountsWithoutNfts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Select
        label="Friktion Volt"
        value={form.voltVaultId}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'voltVaultId' })
        }
        error={formErrors['voltVaultId']}
      >
        {friktionVolts
          ?.filter((x) => !x.isInCircuits)
          .map((value) => (
            <Select.Option key={value.voltVaultId} value={value.voltVaultId}>
              <div className="break-all text-fgd-1 ">
                <div className="mb-2">{`Volt #${value.voltType} - ${
                  value.voltType === 1
                    ? 'Generate Income'
                    : value.voltType === 2
                    ? 'Sustainable Stables'
                    : ''
                } - ${value.underlyingTokenSymbol} - APY: ${value.apy}%`}</div>
                <div className="space-y-0.5 text-xs text-fgd-3">
                  <div className="flex items-center">
                    Deposit Token: {value.depositTokenSymbol}
                  </div>
                  {/* <div>Capacity: {}</div> */}
                </div>
              </div>
            </Select.Option>
          ))}
      </Select>
    </>
  )
}

export default FriktionClaimPendingDeposit
