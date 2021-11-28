import Button, { SecondaryButton } from '@components/Button'
import Input from '@components/inputs/Input'
import { getAccountName } from '@components/instructions/tools'
import useRealm from '@hooks/useRealm'
import { AccountInfo, Token } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
  getMintDecimalAmountFromNatural,
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { tryParseKey } from '@tools/validators/pubkey'
import { debounce } from '@utils/debounce'
import { precision } from '@utils/formatting'
import {
  ProgramAccount,
  TOKEN_PROGRAM_ID,
  tryGetTokenAccount,
} from '@utils/tokens'
import {
  SplTokenTransferForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import React, { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import { ViewState } from './Types'
import { BN } from '@project-serum/anchor'
import { returnTokenTransferSchema } from '@utils/validations'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { isFormValid } from '@utils/formValidation'
import {
  getInstructionDataFromBase64,
  serializeInstructionToBase64,
} from '@models/serialisation'
import useQueryContext from '@hooks/useQueryContext'
import { RpcContext } from '@models/core/api'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { createProposal } from 'actions/createProposal'
import { useRouter } from 'next/router'
import { notify } from '@utils/notifications'

const SendTokens = () => {
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
  } = useRealm()
  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletStore((s) => s.current)
  const router = useRouter()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SplTokenTransferForm>({
    destinationAccount: '',
    // No default transfer amount
    amount: undefined,
    governedTokenAccount: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
  })
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
  const setMaxAmount = () => {
    const amount =
      currentAccount && currentAccount.mint?.account
        ? getMintDecimalAmountFromNatural(
            currentAccount.mint?.account,
            new BN(currentAccount.token!.account.amount)
          ).toNumber()
        : 0
    handleSetForm({
      value: amount,
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
  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedTokenAccount?.token?.publicKey &&
      form.governedTokenAccount?.token &&
      form.governedTokenAccount?.mint?.account
    ) {
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount!,
        form.governedTokenAccount.mint.account.decimals
      )
      const transferIx = Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        form.governedTokenAccount.token?.account.address,
        new PublicKey(form.destinationAccount),
        form.governedTokenAccount.governance!.pubkey,
        [],
        mintAmount
      )
      serializedInstruction = serializeInstructionToBase64(transferIx)
    }

    const obj: UiInstruction = {
      serializedInstruction,
      isValid,
      governedAccount: currentAccount?.governance,
    }
    return obj
  }
  const handleSend = async () => {
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
      }
      try {
        // Fetch governance to get up to date proposalCount
        const selectedGovernance = (await fetchRealmGovernance(
          governance?.pubkey
        )) as ParsedAccount<Governance>

        const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
          governance!.info.config
        )

        // Select the governing token mint for the proposal
        // By default we choose the community mint if it has positive supply (otherwise nobody can vote)
        // TODO: If token holders for both mints can vote the we should add the option in the UI to choose who votes (community or the council)
        const proposalMint = !mint?.supply.isZero()
          ? realm.info.communityMint
          : !councilMint?.supply.isZero()
          ? realm.info.config.councilMint
          : undefined

        if (!proposalMint) {
          throw new Error(
            'There is no suitable governing token for the proposal'
          )
        }
        //TODO description ?
        proposalAddress = await createProposal(
          rpcContext,
          realm.pubkey,
          selectedGovernance.pubkey,
          ownTokenRecord.pubkey,
          'test proposal',
          'test description',
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
  const returnIfAmountIsNotHigherBalance = () => {
    const mintValue = getMintNaturalAmountFromDecimal(
      form.amount!,
      form.governedTokenAccount!.mint!.account.decimals
    )

    return (
      form.governedTokenAccount?.token?.publicKey &&
      form.governedTokenAccount.token.account.amount.gte(new BN(mintValue))
    )
  }
  const schema = returnTokenTransferSchema({ form, connection })
  const transactionDolarAmount = calcTransactionDolarAmount(form.amount)
  return (
    <>
      <h3 className="mb-4 flex items-center">
        <>
          <ArrowLeftIcon
            onClick={() => setCurrentCompactView(ViewState.AccountView)}
            className="h-4 w-4 mr-1 text-primary-light mr-2 hover:cursor-pointer"
          />
          Send {tokenInfo && tokenInfo?.symbol}
        </>
      </h3>
      {tokenInfo?.logoURI && (
        <div className="flex justify-center mb-4">
          <img className="flex-shrink-0 h-14 w-14" src={tokenInfo.logoURI} />
        </div>
      )}
      <div className="space-y-4 w-full">
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
        <div className="flex">
          <Input
            min={mintMinAmount}
            label={`Amount ${tokenInfo ? tokenInfo?.symbol : ''}`}
            value={form.amount}
            type="number"
            onChange={setAmount}
            step={mintMinAmount}
            error={formErrors['amount']}
            onBlur={validateAmountOnBlur}
          />
          <Button className="self-end mb-1 ml-2 text-xs" onClick={setMaxAmount}>
            Max
          </Button>
        </div>
        <small className="text-red">
          {transactionDolarAmount
            ? returnIfAmountIsNotHigherBalance()
              ? `~$${transactionDolarAmount}`
              : 'Insufficient balance'
            : null}
        </small>
      </div>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <SecondaryButton
          isLoading={isLoading}
          className="sm:w-1/2 text-th-fgd-1"
          onClick={handleGoBackToMainView}
        >
          Cancel
        </SecondaryButton>
        <Button className="sm:w-1/2" onClick={handleSend} isLoading={isLoading}>
          Send
        </Button>
      </div>
    </>
  )
}

export default SendTokens
