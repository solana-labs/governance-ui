import React, { ReactNode, useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import SearchSelect from '@components/inputs/SearchSelect'
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
  const [selectedNonprofit, setNonprofit] = useState<ChangeNonprofit>()
  const [searchInput, setSearchInput] = useState<string>()

  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<TokenProgramAccount<AccountInfo> | null>(null)
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
    console.log(selectedNonprofitDetail)
    handleSetForm({
      value: selectedNonprofitDetail?.crypto.solana_address,
      propertyName: 'destinationAccount',
    })
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

  let searchTimeout: number | undefined
  const handleSearch = (evt) => {
    setSearchInput(evt.target.value)
    performSearch()
  }
  const performSearch = () => {
    if (searchInput === '') {
      setLoading(false)
      return
    }
    setLoading(true)
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    searchTimeout = window.setTimeout(() => {
      const queryParams = new URLSearchParams()
      queryParams.append('search_term', searchInput!)
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
          console.log(nonprofits)
          setSearchResults(nonprofits)
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false)
        })
    }, 200)
  }

  /* const noSearchTerm = () => {
  if (!this.searchInput) {
    return true;
  }
  const searchInputEmpty =
    this.searchInput.value === null || this.searchInput.value === "";
  const noSelectedCategory = this.selectedCategory === undefined;
  return searchInputEmpty && noSelectedCategory;
}
 */

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
  const renderSearchResults = () => {
    console.log('render')
    ;<div id="search-results" tabIndex={1}>
      {searchResults.length !== 0 ? (
        <>
          <div id="search-results-title">Nonprofits</div>
          {searchResults.slice(0, 10).map((nonprofit) => {
            ;<div className="name">${nonprofit.name}</div>
          })}
        </>
      ) : (
        <></>
      )}
      {searchResults.length === 0 && loading ? (
        <p id="no-results">
          <b>No results.</b>
          <br />
          Are we missing a nonprofit? Email hello@getchange.io and we'll help!
        </p>
      ) : (
        <></>
      )}
      $
      {loading ? (
        <div id="loading-overlay">
          <span className="spinner"></span>
        </div>
      ) : (
        <></>
      )}
    </div>
  }
  const noSearchTerm = () => {
    if (!searchInput || searchInput === null || searchInput === '') {
      return true
    } else {
      return false
    }
  }

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
      <Input
        label="Nonprofit name or EIN"
        value={searchInput}
        onChange={handleSearch}
        type="text"
      />
      <SearchSelect
        className="h-12"
        disabled={searchResults.length === 0}
        onChange={(nonprofitName) => handleSelectNonProfit(nonprofitName)}
        value={'value field'}
      >
        {searchResults.map((foundNonprofit) => (
          <SearchSelect.Option
            key={foundNonprofit.ein}
            value={foundNonprofit.name}
          >
            <span>{foundNonprofit.name}</span>
          </SearchSelect.Option>
        ))}
      </SearchSelect>

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
