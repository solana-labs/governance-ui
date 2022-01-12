import Button from '@components/Button'
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
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  //   InformationCircleIcon,
} from '@heroicons/react/solid'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { getInstructionDataFromBase64 } from '@solana/spl-governance'
import useQueryContext from '@hooks/useQueryContext'
import { RpcContext } from '@solana/spl-governance'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { createProposal } from 'actions/createProposal'
import { useRouter } from 'next/router'
import { notify } from '@utils/notifications'
import Textarea from '@components/inputs/Textarea'
// import { Popover } from '@headlessui/react'
import AccountLabel from './AccountHeader'
import Tooltip from '@components/Tooltip'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  getTransferInstruction,
  getTransferNftInstruction,
} from '@utils/instructionTools'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import NFTSelector from '@components/NFTS/NFTSelector'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { getProgramVersionForRealm } from '@models/registry/api'

const SendTokens = () => {
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
  const nftName = selectedNfts[0]?.val?.name
  const nftTitle = `Send ${nftName ? nftName : 'NFT'} to ${
    form.destinationAccount
  }`
  const proposalTitle = isNFT
    ? nftTitle
    : `Pay ${form.amount}${tokenInfo ? ` ${tokenInfo?.symbol} ` : ' '}to ${
        form.destinationAccount
      }`

  if (!currentAccount) {
    return null
  }

  return (
    <>
      <h3 className="mb-4 flex items-center">
        <>
          Send {tokenInfo && tokenInfo?.symbol} {isNFT && 'NFT'}
        </>
      </h3>
      <AccountLabel></AccountLabel>
      <div className="space-y-4 w-full pb-4">
        <Input
          label="Destination account"
          value={form.destinationAccount}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'destinationAccount',
            })
          }
          noMaxWidth={true}
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
        {isNFT ? (
          <NFTSelector
            onNftSelect={(nfts) => setSelectedNfts(nfts)}
            ownerPk={currentAccount.governance!.pubkey}
          ></NFTSelector>
        ) : (
          <Input
            min={mintMinAmount}
            label={`Amount ${tokenInfo ? tokenInfo?.symbol : ''}`}
            value={form.amount}
            type="number"
            onChange={setAmount}
            step={mintMinAmount}
            error={formErrors['amount']}
            onBlur={validateAmountOnBlur}
            noMaxWidth={true}
          />
        )}
        <small className="text-red">
          {transactionDolarAmount
            ? IsAmountNotHigherThenBalance()
              ? `~$${transactionDolarAmount}`
              : 'Insufficient balance'
            : null}
        </small>
        <div
          className={'flex items-center hover:cursor-pointer w-24'}
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? (
            <ArrowCircleUpIcon className="h-4 w-4 mr-1 text-primary-light" />
          ) : (
            <ArrowCircleDownIcon className="h-4 w-4 mr-1 text-primary-light" />
          )}
          <small className="text-fgd-3">Options</small>
          {/* popover with description maybe will be needed later */}
          {/* <Popover className="relative ml-auto border-none flex">
            <Popover.Button className="focus:outline-none">
              <InformationCircleIcon className="h-4 w-4 mr-1 text-primary-light hover:cursor-pointer" />
            </Popover.Button>

            <Popover.Panel className="absolute z-10 right-4 top-4 w-80">
              <div className="bg-bkg-1 px-4 py-2 rounded-md text-xs">
                {`In case of empty fields of advanced options, title and description will be
                combination of amount token symbol and destination account e.g
                "Pay 10 sol to PF295R1YJ8n1..."`}
              </div>
            </Popover.Panel>
          </Popover> */}
        </div>
        {showOptions && (
          <>
            <Input
              noMaxWidth={true}
              label="Title"
              placeholder={
                form.amount && form.destinationAccount
                  ? proposalTitle
                  : 'Title of your proposal'
              }
              value={form.title}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'title',
                })
              }
            />
            <Textarea
              noMaxWidth={true}
              label="Description"
              placeholder={
                'Description of your proposal or use a github gist link (optional)'
              }
              wrapperClassName="mb-5"
              value={form.description}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'description',
                })
              }
            ></Textarea>
            {canChooseWhoVote && (
              <VoteBySwitch
                checked={voteByCouncil}
                onChange={() => {
                  setVoteByCouncil(!voteByCouncil)
                }}
              ></VoteBySwitch>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <Button
          disabled={
            !canUseTransferInstruction ||
            isLoading ||
            (isNFT && !selectedNfts.length)
          }
          className="ml-auto"
          onClick={handlePropose}
          isLoading={isLoading}
        >
          <Tooltip
            content={
              !canUseTransferInstruction
                ? 'You need to have connected wallet with ability to create token transfer proposals'
                : isNFT && !selectedNfts.length
                ? 'Please select nft'
                : ''
            }
          >
            <div>Propose</div>
          </Tooltip>
        </Button>
      </div>
    </>
  )
}

export default SendTokens
