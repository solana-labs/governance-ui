import Button, { SecondaryButton } from '@components/Button'
import Input from '@components/inputs/Input'
import { getAccountName } from '@components/instructions/tools'
import useRealm from '@hooks/useRealm'
import { AccountInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
  //   getMintDecimalAmountFromNatural,
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { tryParseKey } from '@tools/validators/pubkey'
import { debounce } from '@utils/debounce'
import { precision } from '@utils/formatting'
import { ProgramAccount, tryGetTokenAccount } from '@utils/tokens'
import {
  SendTokenCompactViewForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import React, { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import { ViewState } from './Types'
import { BN } from '@project-serum/anchor'
import { getTokenTransferSchema } from '@utils/validations'
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  ArrowLeftIcon,
  //   InformationCircleIcon,
} from '@heroicons/react/solid'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { getInstructionDataFromBase64 } from '@models/serialisation'
import useQueryContext from '@hooks/useQueryContext'
import { RpcContext } from '@models/core/api'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { createProposal } from 'actions/createProposal'
import { useRouter } from 'next/router'
import { notify } from '@utils/notifications'
import Textarea from '@components/inputs/Textarea'
// import { Popover } from '@headlessui/react'
import AccountLabel from './AccountHeader'
import Tooltip from '@components/Tooltip'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { getTransferInstruction } from '@utils/instructionTools'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'

const TreasuryPaymentForm = ({ close }) => {
  const {
    setCurrentCompactView,
    resetCompactViewState,
  } = useTreasuryAccountStore()
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
  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletStore((s) => s.current)
  const router = useRouter()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SendTokenCompactViewForm>({
    destinationAccount: '',
    // No default transfer amount
    amount: undefined,
    governedTokenAccount: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
    title: '',
    description: '',
  })
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<ProgramAccount<AccountInfo> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const mintMinAmount = form.governedTokenAccount?.mint
    ? getMintMinAmountAsDecimal(form.governedTokenAccount.mint.account)
    : 1
  const currentPrecision = precision(mintMinAmount)

  const handleGoBackToMainView = () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
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
  //   const setMaxAmount = () => {
  //     const amount =
  //       currentAccount && currentAccount.mint?.account
  //         ? getMintDecimalAmountFromNatural(
  //             currentAccount.mint?.account,
  //             new BN(currentAccount.token!.account.amount)
  //           ).toNumber()
  //         : 0
  //     handleSetForm({
  //       value: amount,
  //       propertyName: 'amount',
  //     })
  //   }
  const calcTransactionDolarAmount = (amount) => {
    const price = tokenService.getUSDTokenPrice(
      currentAccount!.mint!.publicKey.toBase58()
    )
    const totalPrice = amount * price
    const totalPriceFormatted =
      amount && price ? new BigNumber(totalPrice).toFormat(2) : ''
    return totalPriceFormatted
  }

  async function getInstruction(): Promise<UiInstruction> {
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
  const IsAmountNotHigherThenBalance = () => {
    const mintValue = getMintNaturalAmountFromDecimal(
      form.amount!,
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
        } else {
          setDestinationAccount(null)
        }
      })
    } else {
      setDestinationAccount(null)
    }
  }, [form.destinationAccount])

  const schema = getTokenTransferSchema({ form, connection })
  const transactionDolarAmount = calcTransactionDolarAmount(form.amount)
  const proposalTitle = `Pay ${form.amount}${
    tokenInfo ? ` ${tokenInfo?.symbol} ` : ' '
  }to ${form.destinationAccount}`

  return (
    <>
      <div className="flex justify-start items-center gap-x-3">
        {/* <TreasuryPaymentIcon className="w-8 mb-2" /> */}

        <h2 className="text-xl">Add new member to {realmInfo?.displayName}</h2>
      </div>

      <Input
        useDefaultStyle={false}
        className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
        wrapperClassName="my-6"
        label="Member's wallet"
        placeholder="Member's wallet"
        value={form.destinationAccount}
        type="text"
        onChange={(event) =>
          handleSetForm({
            value: event.target.value,
            propertyName: 'destinationAccount',
          })
        }
        noMaxWidth
        error={formErrors['destinationAccount']}
      />

      <div
        className={'flex items-center hover:cursor-pointer w-24 my-3'}
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
            wrapperClassName="mb-6"
            label="Title of your proposal"
            placeholder="Title of your proposal"
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
            wrapperClassName="mb-6"
            min={mintMinAmount}
            label="Voter weight"
            value={form.amount}
            type="number"
            onChange={setAmount}
            step={mintMinAmount}
            error={formErrors['amount']}
            onBlur={validateAmountOnBlur}
          />

          {canChooseWhoVote && (
            <VoteBySwitch
              checked={voteByCouncil}
              onChange={() => {
                setVoteByCouncil(!voteByCouncil)
              }}
            />
          )}

          <Input
            noMaxWidth
            useDefaultStyle={false}
            className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
            wrapperClassName="mb-6"
            label="Description"
            placeholder="Description of your proposal (optional)"
            value={form.description}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'description',
              })
            }
          />
        </>
      )}

      <div className="flex gap-x-6 justify-start items-center mt-8">
        <SecondaryButton
          disabled={isLoading}
          className="w-44"
          onClick={() => close()}
        >
          Cancel
        </SecondaryButton>

        <Button
          disabled={!form.destinationAccount}
          className="w-44 flex justify-center items-center"
          onClick={() => handlePropose()}
          isLoading={isLoading}
        >
          Add member
        </Button>
      </div>
    </>
  )
}

export default TreasuryPaymentForm
