import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/router'
import { AccountInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@project-serum/anchor'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { getInstructionDataFromBase64 } from '@models/serialisation'
import { RpcContext } from '@models/core/api'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { createProposal } from 'actions/createProposal'
import {
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import { tryParseKey } from '@tools/validators/pubkey'
import { debounce } from '@utils/debounce'
import { notify } from '@utils/notifications'
import { getTransferInstruction } from '@utils/instructionTools'
import { precision } from '@utils/formatting'
import { getTokenTransferSchema } from '@utils/validations'
import { ProgramAccount, tryGetTokenAccount } from '@utils/tokens'
import {
  TreasuryPaymentForm as TypeTreasuryPaymentForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import Button, { SecondaryButton } from '@components/Button'
import Input from '@components/inputs/Input'
import TreasuryPaymentIcon from '@components/TreasuryPaymentIcon'
import { getAccountName } from '@components/instructions/tools'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import { ArrowCircleDownIcon, ArrowCircleUpIcon } from '@heroicons/react/solid'

const TreasuryPaymentForm = ({ close }) => {
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )

  const connection = useWalletStore((s) => s.connection)

  const {
    realmInfo,
    symbol,
    realm,
    ownVoterWeight,
    mint,
    councilMint,
    canChooseWhoVote,
  } = useRealm()

  const { canUseTransferInstruction } = useGovernanceAssets()
  const { fmtUrlWithCluster } = useQueryContext()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)

  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)
  const wallet = useWalletStore((s) => s.current)
  const router = useRouter()
  const programId: PublicKey | undefined = realmInfo?.programId

  const [form, setForm] = useState<TypeTreasuryPaymentForm>({
    destinationAccount: '',
    amount: 0,
    governedTokenAccount: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
    title: '',
    description: '',
  })

  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [balance, setBalance] = useState<any>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<ProgramAccount<AccountInfo> | null>(null)

  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)

  const mintMinAmount = form.governedTokenAccount?.mint
    ? getMintMinAmountAsDecimal(form.governedTokenAccount.mint.account)
    : 1

  const currentPrecision = precision(mintMinAmount)

  const amountFormNotFormatted =
    form.governedTokenAccount?.token?.account?.amount

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
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

    const validAmount = value
      ? parseFloat(
          Math.max(
            Number(mintMinAmount),
            Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
          ).toFixed(currentPrecision)
        )
      : 0

    handleSetForm({
      value: validAmount,
      propertyName: 'amount',
    })
  }

  useEffect(() => {
    setBalance(amountFormNotFormatted?.toNumber())
  }, [amountFormNotFormatted])

  const calculateTransactionDolarAmount = (amount: number) => {
    if (currentAccount && currentAccount.mint) {
      const price = tokenService.getUSDTokenPrice(
        currentAccount?.mint?.publicKey.toBase58()
      )

      const totalPrice = amount * price

      const totalPriceFormatted =
        amount && price ? new BigNumber(totalPrice).toFormat(2) : 0

      return Number(totalPriceFormatted)
    }

    return 0
  }

  const getInstruction = async (): Promise<UiInstruction> => {
    return getTransferInstruction({
      schema,
      form,
      programId,
      connection,
      wallet,
      currentAccount,
      setFormErrors,
    })
  }

  const handlePropose = async () => {
    setIsLoading(true)

    const instruction: UiInstruction = await getInstruction()

    if (instruction.isValid) {
      const governance = currentAccount?.governance
      let proposalAddress: PublicKey | null = null

      if (!realm) {
        setIsLoading(false)
        throw 'No realm selected'
      }

      const rpcContext = new RpcContext(
        new PublicKey(realm.account.owner.toString()),
        realmInfo?.programVersion,
        wallet,
        connection.current,
        connection.endpoint
      )

      const instructionData = {
        data: instruction.serializedInstruction
          ? getInstructionDataFromBase64(instruction.serializedInstruction)
          : null,
        holdUpTime: governance?.info?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: instruction.prerequisiteInstructions || [],
      }

      try {
        // Fetch governance to get up to date proposalCount
        const selectedGovernance = (await fetchRealmGovernance(
          governance?.pubkey
        )) as ParsedAccount<Governance>

        const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
          governance!.info.config
        )

        const defaultProposalMint = !mint?.supply.isZero()
          ? realm.info.communityMint
          : !councilMint?.supply.isZero()
          ? realm.info.config.councilMint
          : undefined

        const proposalMint =
          canChooseWhoVote && voteByCouncil
            ? realm.info.config.councilMint
            : defaultProposalMint

        if (!proposalMint) {
          throw new Error(
            'There is no suitable governing token for the proposal'
          )
        }

        //Description same as title
        proposalAddress = await createProposal(
          rpcContext,
          realm.pubkey,
          selectedGovernance.pubkey,
          ownTokenRecord.pubkey,
          form.title ? form.title : proposalTitle,
          form.description ? form.description : '',
          proposalMint,
          selectedGovernance?.info?.proposalCount,
          [instructionData],
          false
        )

        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )

        router.push(url)
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
    }
    setIsLoading(false)
  }

  const IsAmountNotHigherThenBalance = (): boolean => {
    const { governedTokenAccount, amount } = form

    if (
      amount &&
      amountFormNotFormatted &&
      governedTokenAccount?.mint?.account.decimals
    ) {
      const mintValue = getMintNaturalAmountFromDecimal(
        amount,
        governedTokenAccount?.mint?.account.decimals
      )

      let gte: boolean | undefined = false

      try {
        gte = governedTokenAccount?.token?.account?.amount?.gte(
          new BN(mintValue)
        )
      } catch (error) {
        console.log('error getting balance', error)
      }

      return Boolean(form.governedTokenAccount?.token?.publicKey && gte)
    }

    return false
  }

  useEffect(() => {
    if (currentAccount) {
      handleSetForm({
        value: currentAccount,
        propertyName: 'governedTokenAccount',
      })
    }
  }, [currentAccount])

  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount)

        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey)

          setDestinationAccount(account ? account : null)

          return
        }

        setDestinationAccount(null)
      })

      return
    }

    setDestinationAccount(null)
  }, [form.destinationAccount])

  const schema = getTokenTransferSchema({ form, connection })

  const transactionDolarAmount: number =
    Number(form.amount) > 0
      ? calculateTransactionDolarAmount(Number(form.amount))
      : 0

  const proposalTitle = `Pay ${form.amount}${
    tokenInfo ? ` ${tokenInfo?.symbol} ` : ' '
  }${form.destinationAccount ? `to ${form.destinationAccount}` : ''}`

  return (
    <>
      {close && (
        <div className="flex justify-start items-center gap-x-3">
          <TreasuryPaymentIcon className="w-8 mb-2" />

          <h2 className="text-xl">Treasury payment</h2>
        </div>
      )}

      <Input
        noMaxWidth
        useDefaultStyle={false}
        className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
        wrapperClassName={`${close ? 'mt-0 mb-6' : 'my-6'}`}
        label="Destination account"
        placeholder="Destination account"
        value={form.destinationAccount}
        type="text"
        onChange={(event) =>
          handleSetForm({
            value: event.target.value,
            propertyName: 'destinationAccount',
          })
        }
        error={formErrors['destinationAccount']}
      />

      {destinationAccount && (
        <div className="flex justify-start items-center gap-x-2 -mt-4 ml-1">
          <p className="pb-0.5 text-fgd-3 text-xs">Account owner:</p>

          <p className="text-xs break-all">
            {destinationAccount.account.owner.toString()}
          </p>
        </div>
      )}

      {destinationAccountName && (
        <div className="flex justify-start items-center gap-x-2 ml-1">
          <p className="pb-0.5 text-fgd-3 text-xs">Account name:</p>

          <p className="text-xs break-all">{destinationAccountName}</p>
        </div>
      )}

      <Input
        noMaxWidth
        useDefaultStyle={false}
        className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
        wrapperClassName="mt-6 mb-2 w-full"
        min={mintMinAmount}
        placeholder="Amount"
        label={`Amount ${tokenInfo ? tokenInfo?.symbol : ''}`}
        value={form.amount}
        type="number"
        onChange={setAmount}
        step={mintMinAmount}
        error={formErrors['amount']}
        onBlur={validateAmountOnBlur}
      />

      <small className="text-red ml-1">
        {IsAmountNotHigherThenBalance() && `~$${transactionDolarAmount}`}
      </small>

      <div
        className="flex items-center hover:cursor-pointer w-24 mb-4"
        onClick={() => setShowOptions(!showOptions)}
      >
        {showOptions ? (
          <ArrowCircleUpIcon className="h-4 w-4 mr-1 text-primary-light" />
        ) : (
          <ArrowCircleDownIcon className="h-4 w-4 mr-1 text-primary-light" />
        )}
        <small className="text-fgd-3">Options</small>
      </div>

      {showOptions && (
        <>
          <Input
            noMaxWidth
            useDefaultStyle={false}
            className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
            wrapperClassName="mb-6 w-full"
            label="Title of your proposal"
            placeholder={proposalTitle}
            value={form.title}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'title',
              })
            }
          />

          <Input
            noMaxWidth
            useDefaultStyle={false}
            className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
            wrapperClassName="mb-6 w-full"
            label="Description"
            placeholder="Describe your proposal (optional)"
            value={form.description}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'description',
              })
            }
          />

          {!canChooseWhoVote && (
            <VoteBySwitch
              disabled={!canChooseWhoVote}
              checked={voteByCouncil}
              onChange={() => {
                setVoteByCouncil(!voteByCouncil)
              }}
            />
          )}
        </>
      )}

      <div
        className={`${
          close ? 'justify-center ml-44' : 'justify-center items-center'
        } flex gap-x-6  mt-8`}
      >
        {close && (
          <SecondaryButton
            disabled={isLoading}
            className="w-44"
            onClick={() => close()}
          >
            Cancel
          </SecondaryButton>
        )}

        <Button
          tooltipMessage={
            !canUseTransferInstruction
              ? 'You need to have connected wallet with ability to create treasury payment proposals'
              : !balance
              ? 'Insufficient balance'
              : ''
          }
          disabled={!canUseTransferInstruction || isLoading || !balance}
          className="w-44 flex justify-center items-center"
          onClick={handlePropose}
          isLoading={isLoading}
        >
          Create proposal
        </Button>
      </div>
    </>
  )
}

export default TreasuryPaymentForm
