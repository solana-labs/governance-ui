import {
  makeWithdrawInstruction,
  MangoAccount,
  PublicKey,
  U64_MAX_BN,
} from '@blockworks-foundation/mango-client'
import AdditionalProposalOptions from '@components/AdditionalProposalOptions'
import Button from '@components/Button'
import Input from '@components/inputs/Input'
import useCreateProposal from '@hooks/useCreateProposal'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { abbreviateAddress } from '@utils/formatting'
import { validateInstruction } from '@utils/instructionTools'
import { notify } from '@utils/notifications'
import tokenService from '@utils/services/token'
import { getValidatedPublickKey } from '@utils/validations'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/router'
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
  const router = useRouter()
  const wallet = useWalletStore((s) => s.current)
  const { symbol } = useRealm()
  const group = market.group!
  const groupConfig = market.groupConfig!
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    withdrawAddress: '',
  })
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [depositIdx, setDepositIdx] = useState<number | null>(null)
  const [formErrors, setFormErrors] = useState({})
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
      .test('addressTest', 'Address validation error', function (val: string) {
        if (val) {
          try {
            return !!getValidatedPublickKey(val)
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
      }),
  })
  const handlePropose = async (idx: number) => {
    const rootBank = group.rootBankAccounts[idx]!
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    if (!isValid) {
      return
    }
    const address = new PublicKey(form.withdrawAddress)
    setIsLoading(true)
    const instruction = makeWithdrawInstruction(
      groupConfig.mangoProgramId,
      groupConfig.publicKey,
      selectedMangoAccount.publicKey,
      wallet!.publicKey!,
      group.mangoCache,
      rootBank.publicKey,
      rootBank.nodeBanks[0],
      rootBank.nodeBankAccounts[0].vault,
      address,
      group.signerKey,
      selectedMangoAccount.spotOpenOrders,
      U64_MAX_BN,
      false
    )
    try {
      const instructionData: InstructionDataWithHoldUpTime = {
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(instruction)
        ),
        holdUpTime: governance!.account!.config.minInstructionHoldUpTime,
        prerequisiteInstructions: [],
      }
      const proposalAddress = await handleCreateProposal({
        title: form.title || proposalTitle,
        description: form.description,
        instructionsData: [instructionData],
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
  }
  return (
    <div>
      {selectedMangoAccount.deposits.map((x, idx) => {
        const mint = group?.tokens[idx].mint
        const tokenInfo = tokenService.getTokenInfo(mint!.toBase58())
        const symbol = tokenInfo?.symbol
        return !x.isZero() ? (
          <div key={idx} onClick={() => setDepositIdx(idx)}>
            {new BigNumber(
              selectedMangoAccount
                .getUiDeposit(market.cache!.rootBankCache[idx], group!, idx)
                .toNumber()
            ).toFormat(2)}{' '}
            {symbol}
          </div>
        ) : null
      })}
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
      <Button
        className="w-full mt-6"
        onClick={() => handlePropose(depositIdx!)}
        disabled={isLoading || depositIdx === null}
      >
        Propose
      </Button>
    </div>
  )
}

export default WithdrawModal
