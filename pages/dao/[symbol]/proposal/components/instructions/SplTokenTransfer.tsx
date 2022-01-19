import React, { useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { AccountInfo } from '@solana/spl-token'
import {
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { precision } from '@utils/formatting'
import { tryParseKey } from '@tools/validators/pubkey'
import useWalletStore from 'stores/useWalletStore'
import {
  GovernedMultiTypeAccount,
  TokenProgramAccount,
  tryGetTokenAccount,
} from '@utils/tokens'
import {
  TreasuryPaymentForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { getAccountName } from '@components/instructions/tools'
import { debounce } from '@utils/debounce'
import { NewProposalContext } from '../../new'
import { getTokenTransferSchema } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../GovernedAccountSelect'
import {
  getTransferInstruction,
  getTransferNftInstruction,
} from '@utils/instructionTools'
import BigNumber from 'bignumber.js'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import tokenService from '@utils/services/token'
import NFTSelector from '@components/NFTS/NFTSelector'
import { BN } from '@project-serum/anchor'

const SplTokenTransfer = ({
  index,
  governance,
  setProposalTitle,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
  setProposalTitle: any
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance

  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)

  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<TreasuryPaymentForm>({
    destinationAccount: '',
    amount: undefined,
    governedTokenAccount: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
    title: '',
    description: '',
  })

  const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([])

  const isNFT = form.governedTokenAccount?.isNft
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

  const getInstruction = (): Promise<UiInstruction> => {
    const selectedNftMint = selectedNfts[0]?.mint

    const defaultProps = {
      schema,
      form,
      programId,
      connection,
      wallet,
      currentAccount: form.governedTokenAccount || null,
      setFormErrors,
    }

    return isNFT
      ? getTransferNftInstruction({
          ...defaultProps,
          nftMint: selectedNftMint,
        })
      : getTransferInstruction(defaultProps)
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetForm({
      value: isNFT ? 1 : form.amount,
      propertyName: 'amount',
    })
  }, [form.governedTokenAccount])

  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount)

        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey)

          setDestinationAccount(account ? account : null)
        }
      })
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
    setMintInfo(form.governedTokenAccount?.mint?.account)
  }, [form.governedTokenAccount])

  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)

  const schema = getTokenTransferSchema({ form, connection })

  const calcTransactionDolarAmount = (amount) => {
    const { governedTokenAccount } = form

    if (governedTokenAccount && governedTokenAccount.mint) {
      const price = tokenService.getUSDTokenPrice(
        governedTokenAccount.mint.publicKey.toBase58()
      )
      const totalPrice = amount * price
      const totalPriceFormatted =
        amount && price ? new BigNumber(totalPrice).toFormat(2) : ''

      return totalPriceFormatted
    }
  }

  const transactionDolarAmount = calcTransactionDolarAmount(form.amount)
  const nftName = selectedNfts[0]?.val?.name
  const nftTitle = `Send ${nftName ? nftName : 'NFT'} to ${
    form.destinationAccount
  }`

  const IsAmountNotHigherThenBalance = () => {
    if (form.amount) {
      const mintValue = getMintNaturalAmountFromDecimal(
        form.amount,
        form.governedTokenAccount!.mint!.account.decimals
      )

      let gte: boolean | undefined = false

      try {
        gte = form.governedTokenAccount?.token?.account?.amount?.gte(
          new BN(mintValue)
        )
      } catch (e) {
        //silent fail
      }

      return form.governedTokenAccount?.token?.publicKey && gte
    }
  }

  useEffect(() => {
    setProposalTitle(
      isNFT
        ? nftTitle
        : `Pay ${form.amount ? form.amount : ''}${
            tokenInfo ? ` ${tokenInfo?.symbol} ` : ' '
          }to${
            form.destinationAccount ? `  ${form.destinationAccount}` : '...'
          }`
    )
  }, [form.amount, form.destinationAccount, form.governedTokenAccount])

  return (
    <>
      <GovernedAccountSelect
        noMaxWidth
        useDefaultStyle={false}
        className="p-2 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
        label="Source account"
        governedAccounts={
          governedTokenAccountsWithoutNfts as GovernedMultiTypeAccount[]
        }
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

      <Input
        noMaxWidth
        useDefaultStyle={false}
        className="p-4 w-fullb bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
        wrapperClassName="my-6 w-full"
        placeholder="Destination account"
        label="Destination account"
        value={form.destinationAccount}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destinationAccount',
          })
        }
        error={formErrors['destinationAccount']}
      />

      {destinationAccount && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">Account owner</div>
          <div className="text-xs break-all">
            {destinationAccount.account.owner.toString()}
          </div>
        </div>
      )}

      {destinationAccountName && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">Account name</div>
          <div className="text-xs break-all">{destinationAccountName}</div>
        </div>
      )}

      {isNFT && form.governedTokenAccount?.governance?.pubkey ? (
        <NFTSelector
          onNftSelect={(nfts) => setSelectedNfts(nfts)}
          ownerPk={form.governedTokenAccount?.governance.pubkey}
        />
      ) : (
        <Input
          noMaxWidth
          useDefaultStyle={false}
          className="p-4 w-fullb bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
          wrapperClassName="my-6 w-full"
          min={mintMinAmount}
          label="Amount"
          placeholder={`Amount ${tokenInfo ? tokenInfo?.symbol : ''}`}
          value={form.amount}
          type="number"
          onChange={setAmount}
          step={mintMinAmount}
          error={formErrors['amount']}
          onBlur={validateAmountOnBlur}
        />
      )}

      <small className="text-red">
        {transactionDolarAmount
          ? IsAmountNotHigherThenBalance()
            ? `~$${transactionDolarAmount}`
            : 'Insufficient balance'
          : null}
      </small>
    </>
  )
}

export default SplTokenTransfer
