import {
  BN,
  makeCloseSpotOpenOrdersInstruction,
  makeWithdraw2Instruction,
  MangoAccount,
  PublicKey,
} from '@blockworks-foundation/mango-client'
import AdditionalProposalOptions from '@components/AdditionalProposalOptions'
import Button from '@components/Button'
import Input from '@components/inputs/Input'
import { WSOL_MINT_PK } from '@components/instructions/tools'
import Loading from '@components/Loading'
import Tooltip from '@components/Tooltip'
import { CheckCircleIcon } from '@heroicons/react/outline'
import useCreateProposal from '@hooks/useCreateProposal'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import {
  closeAccount,
  initializeAccount,
  WRAPPED_SOL_MINT,
} from '@project-serum/serum/lib/token-instructions'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-governance'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token } from '@solana/spl-token'
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { getATA } from '@utils/ataTools'
import { abbreviateAddress } from '@utils/formatting'
import { validateInstruction } from '@utils/instructionTools'
import { notify } from '@utils/notifications'
import tokenService from '@utils/services/token'
import { tryGetMint, tryGetTokenAccount } from '@utils/tokens'
import {
  getValidateAccount,
  getValidatedPublickKey,
  validateDoseTokenAccountMatchMint,
} from '@utils/validations'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/router'
import { emptyPk } from 'NftVotePlugin/sdk/accounts'
import { useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { MarketStore } from 'Strategies/store/marketStore'
import * as yup from 'yup'

const WithdrawModal = ({
  selectedMangoAccount,
  governance,
  market,
}: {
  selectedMangoAccount: MangoAccount
  governance: ProgramAccount<Governance>
  market: MarketStore
}) => {
  const { canUseTransferInstruction } = useGovernanceAssets()
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { symbol } = useRealm()
  const group = market.group!
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    withdrawAddress: '',
    amount: '',
  })
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [depositIdx, setDepositIdx] = useState<number>(
    selectedMangoAccount.deposits.findIndex((x) => !x.isZero()) || 0
  )
  const [formErrors, setFormErrors] = useState({})
  const selectedDepositMInt = group?.tokens[depositIdx]?.mint
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const { handleCreateProposal } = useCreateProposal()
  const { fmtUrlWithCluster } = useQueryContext()
  const proposalTitle = `Withdraw from mango account to: ${
    form && tryParsePublicKey(form.withdrawAddress)
      ? abbreviateAddress(new PublicKey(form.withdrawAddress))
      : ''
  }`
  const schema = yup.object().shape({
    withdrawAddress: yup
      .string()
      .test(
        'addressTest',
        'Address validation error',
        async function (val: string) {
          if (val) {
            try {
              const currentConnection = connection.current
              const pubKey = getValidatedPublickKey(val)
              const account = await getValidateAccount(
                currentConnection,
                pubKey
              )
              if (account?.value !== null) {
                const tokenAccount = await tryGetTokenAccount(
                  currentConnection,
                  pubKey
                )
                if (tokenAccount && selectedDepositMInt) {
                  await validateDoseTokenAccountMatchMint(
                    tokenAccount.account,
                    selectedDepositMInt
                  )
                }
              }
              return true
            } catch (e) {
              console.log(e)
              return this.createError({
                message: `${e}`,
              })
            }
          } else {
            return this.createError({
              message: `Address is required`,
            })
          }
        }
      ),
    amount: yup.string().required('Amount is required'),
  })
  const handlePropose = async (idx: number) => {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    if (!isValid) {
      return
    }
    const mintPk = group?.tokens[idx].mint
    const isWSolMint = mintPk.toBase58() === WSOL_MINT_PK.toBase58()
    const tokenIndex = group.getTokenIndex(mintPk)
    const publicKey =
      group?.rootBankAccounts?.[tokenIndex]?.nodeBankAccounts[0].publicKey
    const vault =
      group?.rootBankAccounts?.[tokenIndex]?.nodeBankAccounts[0].vault
    //address from form can be changed to ata during code run if needed
    //or wsol address if we withdraw sol
    let address = new PublicKey(form.withdrawAddress)
    const mintInfo = await tryGetMint(connection.current, mintPk)
    //can be changed if WSol mint winch will be transformed to SOL
    let mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      mintInfo!.account.decimals!
    )
    let wrappedSolAccount: null | Keypair = null
    const prerequisiteInstructions: TransactionInstruction[] = []
    if (isWSolMint) {
      mintAmount = Number(form.amount) * LAMPORTS_PER_SOL
      wrappedSolAccount = new Keypair()
      address = wrappedSolAccount.publicKey
      const space = 165
      const rent = await connection.current.getMinimumBalanceForRentExemption(
        space,
        'processed'
      )
      prerequisiteInstructions.push(
        SystemProgram.createAccount({
          fromPubkey: wallet!.publicKey!,
          newAccountPubkey: wrappedSolAccount?.publicKey,
          lamports: rent,
          space: space,
          programId: TOKEN_PROGRAM_ID,
        }),
        initializeAccount({
          account: wrappedSolAccount?.publicKey,
          mint: WRAPPED_SOL_MINT,
          owner: new PublicKey(form.withdrawAddress),
        })
      )
    } else {
      //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
      const { currentAddress: receiverAddress, needToCreateAta } = await getATA(
        {
          connection: connection,
          receiverAddress: address,
          mintPK: mintPk,
          wallet: wallet!,
        }
      )
      address = receiverAddress
      if (needToCreateAta) {
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            mintPk, // mint
            receiverAddress, // ata
            new PublicKey(form.withdrawAddress), // owner of token account
            wallet!.publicKey! // fee payer
          )
        )
      }
    }

    setIsLoading(true)
    const proposalInstructions: InstructionDataWithHoldUpTime[] = []
    for (const i in selectedMangoAccount.spotOpenOrders) {
      if (selectedMangoAccount.spotOpenOrders[i].toBase58() !== emptyPk) {
        const closeOpenOrders = makeCloseSpotOpenOrdersInstruction(
          market.client!.programId,
          group.publicKey,
          selectedMangoAccount.publicKey,
          selectedMangoAccount.owner,
          group.dexProgramId,
          selectedMangoAccount.spotOpenOrders[i],
          group.spotMarkets[i].spotMarket,
          group.signerKey,
          true
        )
        const closeInstruction: InstructionDataWithHoldUpTime = {
          data: getInstructionDataFromBase64(
            serializeInstructionToBase64(closeOpenOrders)
          ),
          holdUpTime: governance!.account!.config.minInstructionHoldUpTime,
          prerequisiteInstructions: [],
        }
        proposalInstructions.push(closeInstruction)
      }
    }

    const instruction = makeWithdraw2Instruction(
      market.client!.programId,
      group.publicKey,
      selectedMangoAccount.publicKey,
      selectedMangoAccount.owner,
      group.mangoCache,
      group.tokens[tokenIndex].rootBank,
      publicKey!,
      vault!,
      address,
      group.signerKey,
      [],
      new BN(mintAmount),
      false
    )
    const instructionData: InstructionDataWithHoldUpTime = {
      data: getInstructionDataFromBase64(
        serializeInstructionToBase64(instruction)
      ),
      holdUpTime: governance!.account!.config.minInstructionHoldUpTime,
      prerequisiteInstructions: prerequisiteInstructions,
      prerequisiteInstructionsSigners: wrappedSolAccount
        ? [wrappedSolAccount]
        : [],
      chunkSplitByDefault: true,
      chunkBy: 1,
    }
    proposalInstructions.push(instructionData)
    if (wrappedSolAccount) {
      const closeAobInstruction = closeAccount({
        source: wrappedSolAccount.publicKey,
        destination: new PublicKey(form.withdrawAddress),
        owner: new PublicKey(form.withdrawAddress),
      })
      const closeAobInstructionData: InstructionDataWithHoldUpTime = {
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(closeAobInstruction)
        ),
        holdUpTime: governance!.account!.config.minInstructionHoldUpTime,
        prerequisiteInstructions: [],
        prerequisiteInstructionsSigners: [],
        chunkSplitByDefault: true,
        chunkBy: 1,
      }
      proposalInstructions.push(closeAobInstructionData)
    }

    try {
      const proposalAddress = await handleCreateProposal({
        title: form.title || proposalTitle,
        description: form.description,
        instructionsData: [...proposalInstructions],
        governance: governance!,
        voteByCouncil,
      })
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )
      router.push(url)
    } catch (e) {
      console.log(e)
      notify({ type: 'error', message: "Can't create proposal" })
    }
    setIsLoading(false)
  }
  return (
    <div>
      {selectedMangoAccount?.deposits.map((x, idx) => {
        const mint = group?.tokens[idx].mint
        const tokenInfo = tokenService.getTokenInfo(mint!.toBase58())
        const symbol = tokenInfo?.symbol
        return !x.isZero() ? (
          <div
            className={`flex items-center p-2 border border-fgd-4 p-3 rounded-lg w-full mb-2 text-sm ${
              idx === depositIdx ? 'border-primary-light' : ''
            } hover:cursor-pointer`}
            key={idx}
            onClick={() => setDepositIdx(idx)}
          >
            <div>
              {' '}
              {new BigNumber(
                selectedMangoAccount
                  .getUiDeposit(market.cache!.rootBankCache[idx], group!, idx)
                  .toNumber()
              ).toFormat(2)}{' '}
              <span className="text-xs">
                {symbol ? symbol : abbreviateAddress(mint)}
              </span>
            </div>
            {idx === depositIdx && (
              <CheckCircleIcon className="w-5 text-green ml-auto"></CheckCircleIcon>
            )}
          </div>
        ) : null
      })}
      <div className="space-y-4 w-full pb-4">
        <Input
          label={'Withdraw address'}
          value={form.withdrawAddress}
          type="text"
          error={formErrors['withdrawAddress']}
          onChange={(e) =>
            handleSetForm({
              value: e.target.value,
              propertyName: 'withdrawAddress',
            })
          }
        />
        <Input
          label={'Amount'}
          value={form.amount}
          type="number"
          min={0}
          error={formErrors['amount']}
          onChange={(e) =>
            handleSetForm({
              value: e.target.value,
              propertyName: 'amount',
            })
          }
        />
        <AdditionalProposalOptions
          title={form.title}
          description={form.description}
          defaultTitle={proposalTitle}
          setTitle={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'title',
            })
          }
          setDescription={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'description',
            })
          }
          voteByCouncil={voteByCouncil}
          setVoteByCouncil={setVoteByCouncil}
        />
      </div>
      <Button
        className="w-full mt-6"
        onClick={() => handlePropose(depositIdx!)}
        disabled={isLoading || !canUseTransferInstruction}
      >
        <Tooltip
          content={
            !canUseTransferInstruction
              ? 'Please connect wallet with enough voting power to create treasury proposals'
              : ''
          }
        >
          {!isLoading ? 'Propose' : <Loading></Loading>}
        </Tooltip>
      </Button>
    </div>
  )
}

export default WithdrawModal
