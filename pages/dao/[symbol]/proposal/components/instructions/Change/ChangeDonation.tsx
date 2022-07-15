import React, { useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { AccountInfo } from '@solana/spl-token'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { precision } from '@utils/formatting'
import { tryParseKey } from '@tools/validators/pubkey'
import useWalletStore from 'stores/useWalletStore'
import { TokenProgramAccount, tryGetTokenAccount } from '@utils/tokens'
import {
  SplTokenTransferForm,
  UiInstruction,
  ChangeNonprofit,
} from '@utils/uiTypes/proposalCreationTypes'
import { getAccountName } from '@components/instructions/tools'
import { debounce } from '@utils/debounce'
import { NewProposalContext } from '../../../new'
import { getTokenTransferSchema } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import {
  getSolTransferInstruction,
  getTransferInstruction,
} from '@utils/instructionTools'
import NonprofitSelect from '@components/inputs/ChangeNonprofitSelect'

const ChangeDonation = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SplTokenTransferForm>({
    destinationAccount: '',
    // No default transfer amount
    amount: undefined,
    governedTokenAccount: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
  })

  const [searchResults, setSearchResults] = useState<ChangeNonprofit[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [selectedNonprofit, setNonprofit] = useState<ChangeNonprofit>()
  const [searchInput, setSearchInput] = useState<string>()

  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [destinationAccount, setDestinationAccount] =
    useState<TokenProgramAccount<AccountInfo> | null>(null)
  const [formErrors, setFormErrors] = useState({})
  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const { handleSetInstructions } = useContext(NewProposalContext)
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

  const handleSelectNonProfit = (selectedNonprofit: string): void => {
    const selectedNonprofitDetail = searchResults.find(
      (nonprofit) => nonprofit.name === selectedNonprofit
    )
    handleSetForm({
      value: selectedNonprofitDetail?.crypto.solana_address,
      propertyName: 'destinationAccount',
    })
    setSearchResults([])
    setSearchInput(selectedNonprofit)
    setNonprofit(selectedNonprofitDetail)
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
  const handleSearch = async (evt) => {
    const debounceTimer = 300
    setSearchInput(evt.target.value)

    if (evt.target.value === '') {
      setTimeout(() => {
        setSearchResults([])
        setLoading(false)
        setIsTyping(false)
        setNonprofit(undefined)
      }, debounceTimer)
    } else {
      setIsTyping(true)
      debounce.debounceFcn(() => performSearch(evt.target.value), debounceTimer)
    }
  }
  const performSearch = (textToSearch: string) => {
    setLoading(true)
    const queryParams = new URLSearchParams()
    queryParams.append('search_term', textToSearch!)
    fetch(
      `https://api.getchange.io/api/v1/nonprofit_basics?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        // Some nonprofits do not have crypto addresses; filter these out.
        return response.nonprofits.filter(
          (n: any) => n.crypto !== undefined
        ) as ChangeNonprofit[]
      })
      .then((nonprofits) => {
        setSearchResults(nonprofits)
      })
      .catch(() => {
        console.log('error finding nonprofits')
      })
      .finally(() => {
        setIsTyping(false)
        setLoading(false)
      })
  }

  async function getInstruction(): Promise<UiInstruction> {
    return !form.governedTokenAccount?.isSol
      ? getTransferInstruction({
          schema,
          form,
          programId,
          connection,
          wallet,
          currentAccount: form.governedTokenAccount || null,
          setFormErrors,
        })
      : getSolTransferInstruction({
          schema,
          form,
          programId,
          connection,
          wallet,
          currentAccount: form.governedTokenAccount || null,
          setFormErrors,
        })
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])
  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount)
        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey)
          setDestinationAccount(account ? account : null)
        } else {
          setDestinationAccount(null)
        }
      })
    } else {
      setDestinationAccount(null)
    }
  }, [form.destinationAccount])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form])
  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    setMintInfo(form.governedTokenAccount?.extensions.mint?.account)
  }, [form.governedTokenAccount])
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const schema = getTokenTransferSchema({ form, connection })

  return (
    <>
      <GovernedAccountSelect
        label="Source account"
        //currently limiting to SOL deposits
        governedAccounts={governedTokenAccountsWithoutNfts.filter(
          (governedTokenAccount) => {
            return governedTokenAccount.isSol
          }
        )}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <NonprofitSelect
        value={searchInput}
        onSearch={handleSearch}
        onSelect={(nonprofitName) => handleSelectNonProfit(nonprofitName)}
        className="h-12"
        showSearchResults={searchResults.length > 0 || isTyping}
        disabled={searchResults.length === 0}
        nonprofitInformation={selectedNonprofit}
        isLoading={loading || isTyping}
      >
        {searchResults.map((foundNonprofit) => (
          <NonprofitSelect.Option
            key={foundNonprofit.ein}
            value={foundNonprofit.name}
          >
            <span>{foundNonprofit.name}</span>
          </NonprofitSelect.Option>
        ))}
      </NonprofitSelect>
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

export default ChangeDonation
