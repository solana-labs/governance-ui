import React, { useEffect, useState } from 'react'
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
  ProgramAccount,
  tryGetTokenAccount,
} from '@utils/tokens'
import {
  ComponentInstructionData,
  Instructions,
  TreasuryPaymentForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { getAccountName } from '@components/instructions/tools'
import { debounce } from '@utils/debounce'
import { getTokenTransferSchema } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import {
  getTransferInstruction,
  getTransferNftInstruction,
} from '@utils/instructionTools'
import GovernedAccountSelect from '../GovernedAccountSelect'
import Button from '@components/Button'
import VoteBySwitch from '../VoteBySwitch'
import TokenBalanceCard from '@components/TokenBalanceCard'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { BN } from '@project-serum/anchor'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import NFTSelector from '@components/NFTS/NFTSelector'
import AccountLabel from '@components/TreasuryAccount/AccountHeader'
import { handlePropose } from 'actions/handleCreateProposal'
import { NewProposalContext } from '../../new'

const TreasuryPaymentFormFullScreen = ({
  index,
  governance,
  setGovernance,
  callback,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
  setGovernance: any
  callback: any
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const realmData = useRealm()

  const { realmInfo, canChooseWhoVote } = realmData

  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { governedTokenAccounts } = useGovernanceAssets()

  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [isNFT, setIsNFT] = useState(false)
  const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([])

  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)

  const [governedAccount, setGovernedAccount] = useState<
    ParsedAccount<Governance> | undefined
  >(undefined)

  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<ProgramAccount<AccountInfo> | null>(null)

  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: Instructions.Transfer }])

  const programId: PublicKey | undefined = realmInfo?.programId
  const shouldBeGoverned = index !== 0 && governance

  const [form, setForm] = useState<TreasuryPaymentForm>({
    destinationAccount: '',
    amount: isNFT ? 1 : undefined,
    governedTokenAccount: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
    description: '',
    title: '',
  })

  useEffect(() => {
    if (form.governedTokenAccount) {
      setIsNFT(form.governedTokenAccount.isNft)
    }
  }, [form.governedTokenAccount])

  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1

  const currentPrecision = precision(mintMinAmount)

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

  const schema = getTokenTransferSchema({ form, connection })

  const calcTransactionDolarAmount = (amount: number | undefined) => {
    if (form.governedTokenAccount && form.governedTokenAccount.mint) {
      const price = tokenService.getUSDTokenPrice(
        form.governedTokenAccount.mint.publicKey.toBase58()
      )
      const totalPrice = Number(amount) * price
      const totalPriceFormatted =
        amount && price ? new BigNumber(totalPrice).toFormat(2) : ''

      return totalPriceFormatted
    }

    return ''
  }

  const transactionDolarAmount = calcTransactionDolarAmount(form.amount)

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

  const getInstruction = async (): Promise<UiInstruction[]> => {
    const instructions: UiInstruction[] = []

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

    const nftTransferInstruction = await getTransferNftInstruction({
      ...defaultProps,
      nftMint: selectedNftMint,
    })

    const transferInstruction = await getTransferInstruction(defaultProps)

    instructions.push(isNFT ? nftTransferInstruction : transferInstruction)

    return instructions
  }

  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]

    newInstructions[index] = { ...instructionsData[index], ...val }

    setInstructions(newInstructions)
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })

    handleSetInstructions(
      {
        governedAccount,
        getInstruction,
      },
      index
    )
  }, [realmInfo?.programId])

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

  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    setMintInfo(form.governedTokenAccount?.mint?.account)
  }, [form.governedTokenAccount])

  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)

  const getSelectedGovernance = async () => {
    return (await fetchRealmGovernance(
      form.governedTokenAccount?.governance?.pubkey
    )) as ParsedAccount<Governance>
  }

  const confirmPropose = async () => {
    return await handlePropose({
      getInstruction,
      form,
      schema,
      connection,
      callback,
      governance: form.governedTokenAccount?.governance,
      realmData,
      wallet,
      getSelectedGovernance,
      setIsLoading,
    })
  }

  const nftName = selectedNfts[0]?.val?.name
  const nftTitle = `Send ${nftName ? nftName : 'NFT'} to ${
    form.destinationAccount
  }`
  const proposalTitle = isNFT
    ? nftTitle
    : `Pay ${form.amount || ''}${
        tokenInfo ? ` ${tokenInfo?.symbol} ` : ' '
      }to ${form.destinationAccount}`

  return (
    <NewProposalContext.Provider
      value={{
        instructionsData,
        handleSetInstructions,
        governance,
        setGovernance,
      }}
    >
      <div className="w-full flex justify-between items-start">
        <div className="w-full flex flex-col gap-y-5 justify-start items-start max-w-xl rounded-xl">
          <GovernedAccountSelect
            noMaxWidth
            useDefaultStyle={false}
            className="p-2 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            label="Source account"
            governedAccounts={
              governedTokenAccounts as GovernedMultiTypeAccount[]
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
            className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            wrapperClassName="my-6 w-full"
            label="Destination account"
            placeholder="Destination account"
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

          {isNFT ? (
            <NFTSelector
              onNftSelect={(nfts) => setSelectedNfts(nfts)}
              ownerPk={
                form.governedTokenAccount &&
                form.governedTokenAccount.governance
                  ? form.governedTokenAccount.governance.pubkey
                  : ''
              }
            />
          ) : (
            <Input
              noMaxWidth
              useDefaultStyle={false}
              className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
              wrapperClassName="mb-6 w-full"
              placeholder="Amount"
              min={mintMinAmount}
              label="Amount"
              value={form.amount}
              type="number"
              onChange={setAmount}
              step={mintMinAmount}
              error={formErrors['amount']}
              onBlur={validateAmountOnBlur}
            />
          )}

          {destinationAccount && (
            <div className="flex justify-start items-center gap-x-2">
              <p className="pb-0.5 text-fgd-3 text-xs">Account owner:</p>
              <p className="text-xs">{form.destinationAccount}</p>
            </div>
          )}

          {destinationAccountName && (
            <div className="flex justify-start items-center gap-x-2">
              <p className="pb-0.5 text-fgd-3 text-xs">Account name:</p>
              <p className="text-xs">{destinationAccountName}</p>
            </div>
          )}

          <small className="text-red">
            {transactionDolarAmount
              ? IsAmountNotHigherThenBalance()
                ? `~$${transactionDolarAmount}`
                : 'Insufficient balance'
              : null}
          </small>

          <VoteBySwitch
            disabled={!canChooseWhoVote}
            checked={voteByCouncil}
            onChange={() => {
              setVoteByCouncil(!voteByCouncil)
            }}
          />

          <Button
            className="w-44 flex justify-center items-center mt-8"
            onClick={confirmPropose}
            isLoading={isLoading}
            disabled={
              (isNFT && !selectedNfts.length) ||
              isLoading ||
              !form.destinationAccount ||
              (!isNFT && !form.amount)
            }
          >
            Create proposal
          </Button>
        </div>

        <div className="max-w-xs w-full">
          <div className="w-full">
            <p className="text-white pb-0.5 text-xs">Your balance</p>
            <AccountLabel background="bg-bkg-1" />
          </div>

          <Input
            noMaxWidth
            useDefaultStyle
            wrapperClassName="mb-6"
            label="Title of your proposal"
            placeholder="Title of your proposal (optional)"
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
            useDefaultStyle
            wrapperClassName="mb-20"
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

          <TokenBalanceCard />
        </div>
      </div>
    </NewProposalContext.Provider>
  )
}

export default TreasuryPaymentFormFullScreen
