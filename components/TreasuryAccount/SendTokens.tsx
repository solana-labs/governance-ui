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
import { TokenProgramAccount, tryGetTokenAccount } from '@utils/tokens'
import {
  SendTokenCompactViewForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import React, { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import { BN } from '@project-serum/anchor'
import { getTokenTransferSchema } from '@utils/validations'
import { ArrowCircleDownIcon, ArrowCircleUpIcon } from '@heroicons/react/solid'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import useQueryContext from '@hooks/useQueryContext'
import {
  getInstructionDataFromBase64,
  RpcContext,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance'
import { createProposal } from 'actions/createProposal'
import { useRouter } from 'next/router'
import { notify } from '@utils/notifications'
import AccountLabel from './AccountHeader'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  getTransferInstruction,
  getTransferNftInstruction,
} from '@utils/instructionTools'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import NFTSelector from '@components/NFTS/NFTSelector'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import TreasuryPaymentIcon from '@components/TreasuryPaymentIcon'
import { getProgramVersionForRealm } from '@models/registry/api'

const SendTokens = ({ close }) => {
  const { resetCompactViewState } = useTreasuryAccountStore()
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
  const isNFT = currentAccount?.isNft
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletStore((s) => s.current)
  const router = useRouter()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SendTokenCompactViewForm>({
    destinationAccount: '',
    amount: isNFT ? 1 : undefined,
    governedTokenAccount: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
    title: '',
    description: '',
  })
  const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([])
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<TokenProgramAccount<AccountInfo> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const mintMinAmount = form.governedTokenAccount?.mint
    ? getMintMinAmountAsDecimal(form.governedTokenAccount.mint.account)
    : 1
  const currentPrecision = precision(mintMinAmount)

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
    const selectedNftMint = selectedNfts[0]?.mint
    const defaultProps = {
      schema,
      form,
      programId,
      connection,
      wallet,
      currentAccount,
      setFormErrors,
    }
    return isNFT
      ? getTransferNftInstruction({
          ...defaultProps,
          nftMint: selectedNftMint,
        })
      : getTransferInstruction(defaultProps)
  }

  const nftName = selectedNfts[0]?.val?.name
  const nftTitle = `Send ${nftName ? nftName : 'NFT'} to ${
    form.destinationAccount
  }`

  const proposalTitle = isNFT
    ? nftTitle
    : `Pay ${form.amount || ''}${
        tokenInfo ? ` ${tokenInfo?.symbol} ` : ''
      } to ${form.destinationAccount}`

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
        new PublicKey(realm.owner.toString()),
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection.current,
        connection.endpoint
      )
      const instructionData = {
        data: instruction.serializedInstruction
          ? getInstructionDataFromBase64(instruction.serializedInstruction)
          : null,
        holdUpTime: governance?.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: instruction.prerequisiteInstructions || [],
      }
      try {
        // Fetch governance to get up to date proposalCount
        const selectedGovernance = (await fetchRealmGovernance(
          governance?.pubkey
        )) as ProgramAccount<Governance>

        const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
          governance!.account.config
        )

        const defaultProposalMint = !mint?.supply.isZero()
          ? realm.account.communityMint
          : !councilMint?.supply.isZero()
          ? realm.account.config.councilMint
          : undefined

        const proposalMint =
          canChooseWhoVote && voteByCouncil
            ? realm.account.config.councilMint
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
          selectedGovernance?.account?.proposalCount,
          [instructionData],
          false
        )
        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )
        resetCompactViewState()
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

  if (!currentAccount) {
    return null
  }

  return (
    <>
      <div className="flex justify-start items-center gap-x-3 mb-8">
        <TreasuryPaymentIcon className="w-8 mb-2" />

        <h2 className="text-xl">Treasury payment</h2>
      </div>

      <p className="pb-0.5 text-fgd-3 text-xs">Your balance</p>

      <AccountLabel background="bg-bkg-2" />

      <div className="space-y-4 w-full pb-4">
        <Input
          noMaxWidth
          useDefaultStyle={false}
          className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
          wrapperClassName="my-6"
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

        {isNFT ? (
          <NFTSelector
            onNftSelect={(nfts) => setSelectedNfts(nfts)}
            ownerPk={currentAccount.governance!.pubkey}
          />
        ) : (
          <Input
            noMaxWidth
            useDefaultStyle={false}
            className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
            wrapperClassName="mt-6 mb-2"
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
        )}

        <small className="text-red ml-1">
          {transactionDolarAmount
            ? IsAmountNotHigherThenBalance()
              ? `~$${transactionDolarAmount}`
              : 'Insufficient balance'
            : null}
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
              wrapperClassName="mb-6"
              label="Title of your proposal"
              placeholder="Title of your proposal"
              value={form.title || proposalTitle}
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
                checked={voteByCouncil}
                onChange={() => {
                  setVoteByCouncil(!voteByCouncil)
                }}
              />
            )}
          </>
        )}
      </div>

      <div className="flex gap-x-6 justify-start items-center mt-8">
        <SecondaryButton
          disabled={isLoading}
          className="w-44"
          onClick={() => close()}
        >
          Cancel
        </SecondaryButton>

        <Button
          tooltipMessage={
            isNFT && !selectedNfts.length
              ? 'Please, select NFT'
              : !canUseTransferInstruction
              ? 'You need to have connected wallet with ability to create treasury payment proposals'
              : !transactionDolarAmount || !IsAmountNotHigherThenBalance()
              ? 'Insufficient balance'
              : ''
          }
          disabled={
            !canUseTransferInstruction ||
            isLoading ||
            !transactionDolarAmount ||
            !IsAmountNotHigherThenBalance() ||
            (isNFT && !selectedNfts.length)
          }
          className="w-44 flex justify-center items-center"
          onClick={handlePropose}
          isLoading={isLoading}
        >
          Add proposal
        </Button>
      </div>
    </>
  )
}

export default SendTokens
