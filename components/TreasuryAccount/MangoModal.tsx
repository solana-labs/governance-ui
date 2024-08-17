import {
  Group,
  MangoAccount,
  USDC_MINT,
  toUiDecimals,
  toNative,
} from '@blockworks-foundation/mango-v4'
import AdditionalProposalOptions from '@components/AdditionalProposalOptions'
import Button, { LinkButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import { BN } from '@coral-xyz/anchor'
import useCreateProposal from '@hooks/useCreateProposal'
import UseMangoV4 from '@hooks/useMangoV4'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import {
  getInstructionDataFromBase64,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { AccountMeta, PublicKey } from '@solana/web3.js'
import { AssetAccount } from '@utils/uiTypes/assets'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Tooltip from '@components/Tooltip'
import {
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
} from '@tools/sdk/units'
import BigNumber from 'bignumber.js'
import { precision } from '@utils/formatting'
import * as yup from 'yup'
import tokenPriceService from '@utils/services/tokenPrice'
import { validateInstruction } from '@utils/instructionTools'
import Switch from '@components/Switch'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import ProgramSelector from '@components/Mango/ProgramSelector'
import useProgramSelector from '@components/Mango/useProgramSelector'
import ButtonGroup from '@components/ButtonGroup'

enum ProposalType {
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
}
import { useVoteByCouncilToggle } from '@hooks/useVoteByCouncilToggle'

const MangoModal = ({ account }: { account: AssetAccount }) => {
  const { canUseTransferInstruction } = useGovernanceAssets()
  const programSelectorHook = useProgramSelector()
  const { mangoClient, mangoGroup, getMaxWithdrawForBank } = UseMangoV4(
    programSelectorHook.program?.val,
    programSelectorHook.program?.group
  )
  const { fmtUrlWithCluster } = useQueryContext()
  const { handleCreateProposal } = useCreateProposal()
  const router = useRouter()
  const { symbol } = useRealm()
  const [isProposing, setIsProposing] = useState(false)
  const { voteByCouncil, setVoteByCouncil } = useVoteByCouncilToggle()
  const [isLoadingMangoAccount, setIsLoadingMangoAccount] = useState<boolean>(
    true
  )
  const [mangoAccounts, setMangoAccounts] = useState<MangoAccount[]>([])
  const tabs = [ProposalType.DEPOSIT, ProposalType.WITHDRAW]
  const [proposalType, setProposalType] = useState(ProposalType.DEPOSIT)
  const [form, setForm] = useState<{
    mangoAccount: MangoAccount | null | undefined
    accountName: string
    amount: number
    title: string
    description: string
    delegate: boolean
    delegateWallet: string
  }>({
    accountName: '',
    title: '',
    description: '',
    amount: 0,
    mangoAccount: undefined,
    delegate: false,
    delegateWallet: '',
  })

  const [formErrors, setFormErrors] = useState({})
  const [maxWithdrawBalance, setMaxWithdrawBalance] = useState(0)

  const handleSetForm = ({ propertyName, value }) => {
    setForm({ ...form, [propertyName]: value })
    setFormErrors({})
  }

  useEffect(() => {
    setForm({ ...form, mangoAccount: undefined })
  }, [programSelectorHook.program?.val.toBase58()])

  useEffect(() => {
    setFormErrors({})
    setForm({
      ...form,
      accountName: '',
      amount: 0,
      mangoAccount: undefined,
      title: `${proposalType} ${
        tokenPriceService.getTokenInfo(
          account.extensions.mint!.publicKey.toBase58()
        )?.symbol || 'tokens'
      } ${proposalType === 'Withdraw' ? 'from' : 'to'} Mango`,
    })
  }, [proposalType])

  const SOL_BUFFER = 0.02

  const treasuryAmount = new BN(
    account.isSol
      ? account.extensions.amount!.toNumber()
      : account.extensions.token!.account.amount
  )
  const mintInfo = account.extensions.mint!.account!
  const mintMinAmount = mintInfo ? getMintMinAmountAsDecimal(mintInfo) : 1
  let maxAmount = mintInfo
    ? getMintDecimalAmount(mintInfo, treasuryAmount)
    : new BigNumber(0)
  if (account.isSol) {
    maxAmount = maxAmount.minus(SOL_BUFFER)
  }
  const maxAmountFtm = maxAmount.toNumber().toFixed(4)
  const currentPrecision = precision(mintMinAmount)

  const schema = yup.object().shape({
    mangoAccount: yup
      .object()
      .nullable(true)
      .test(
        'is-not-undefined',
        'Please select an Account',
        (value) => value !== undefined
      ),
    accountName: yup.string().when('mangoAccount', {
      is: null,
      then: yup.string().required('Account name is required'),
      otherwise: yup.string().notRequired(),
    }),
    title: yup.string().required('Title is required'),
    amount: yup
      .number()
      .required('Amount is required')
      .min(mintMinAmount)
      .max(
        proposalType === ProposalType.DEPOSIT
          ? maxAmount.toNumber()
          : maxWithdrawBalance
      ),
    delegate: yup.boolean().required('Delegate is required'),
    delegateWallet: yup
      .string()
      .nullable()
      .when('delegate', {
        is: true,
        then: yup.string().required('Delegate Wallet is required'),
        otherwise: yup.string().notRequired(),
      }),
  })

  useEffect(() => {
    setMangoAccounts([])
  }, [programSelectorHook.program?.val])

  useEffect(() => {
    const getMangoAccounts = async () => {
      const accounts = await mangoClient?.getMangoAccountsForOwner(
        mangoGroup!,
        account.extensions.token!.account.owner!
      )

      if (accounts) {
        setMangoAccounts(accounts)
      }
    }
    if (mangoClient && mangoGroup) {
      setMangoAccounts([])
      setIsLoadingMangoAccount(true)
      getMangoAccounts().then(() => setIsLoadingMangoAccount(false))
    }
  }, [account.extensions.token, mangoClient, mangoGroup])

  useEffect(() => {
    if (proposalType === ProposalType.DEPOSIT) return
    if (!mangoGroup || !form.mangoAccount) return
    const bank = mangoGroup!.getFirstBankByMint(
      account.extensions.mint!.publicKey!
    )
    const maxWithdrawForBank = getMaxWithdrawForBank(
      mangoGroup,
      bank,
      form.mangoAccount
    )
    setMaxWithdrawBalance(maxWithdrawForBank.toNumber())
  }, [proposalType, mangoGroup, form])

  const handleCreateAccount = async () => {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    if (!isValid) return

    try {
      setIsProposing(true)
      const instructions: InstructionDataWithHoldUpTime[] = []
      let mangoAccountPk = form.mangoAccount?.publicKey
      const bank = mangoGroup!.getFirstBankByMint(
        account.extensions.mint!.publicKey!
      )

      if (form.mangoAccount === null) {
        const newAccountNum = getNextAccountNumber(mangoAccounts)
        const createAccIx = await mangoClient!.program.methods
          .accountCreate(
            newAccountNum,
            8,
            4,
            4,
            32,
            form.accountName || `Account ${newAccountNum + 1}`
          )
          .accounts({
            group: mangoGroup!.publicKey,
            owner: account.extensions.token!.account.owner!,
            payer: account.extensions.token!.account.owner!,
          })
          .instruction()

        const createAccInstData = {
          data: getInstructionDataFromBase64(
            serializeInstructionToBase64(createAccIx)
          ),
          holdUpTime:
            account?.governance.account?.config.minInstructionHoldUpTime,
          prerequisiteInstructions: [],
          chunkBy: 1,
        }

        instructions.push(createAccInstData)

        const acctNumBuffer = Buffer.alloc(4)
        acctNumBuffer.writeUInt32LE(newAccountNum)

        const [mangoAccount] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('MangoAccount'),
            mangoGroup!.publicKey.toBuffer(),
            account.extensions.token!.account.owner!.toBuffer(),
            acctNumBuffer,
          ],
          mangoClient!.programId
        )
        mangoAccountPk = mangoAccount
      }

      const tokens = toNative(
        form.amount,
        account.extensions.mint!.account!.decimals
      )

      if (proposalType === ProposalType.DEPOSIT) {
        const methodByProposal = mangoClient!.program.methods.tokenDeposit
        const methodByProposalInstruction = await methodByProposal(
          tokens,
          false
        )
          .accounts({
            group: mangoGroup!.publicKey,
            account: mangoAccountPk,
            owner: account.extensions.token!.account.owner!,
            bank: bank.publicKey,
            vault: bank.vault,
            oracle: bank.oracle,
            tokenAccount: account.pubkey,
            tokenAuthority: account.extensions.token!.account.owner!,
          })
          .remainingAccounts(
            [bank.publicKey, bank.oracle].map(
              (pk) =>
                ({
                  pubkey: pk,
                  isWritable: false,
                  isSigner: false,
                } as AccountMeta)
            )
          )
          .instruction()

        const depositAccInstData = {
          data: getInstructionDataFromBase64(
            serializeInstructionToBase64(methodByProposalInstruction!)
          ),
          holdUpTime:
            account?.governance.account?.config.minInstructionHoldUpTime,
          prerequisiteInstructions: [],
          chunkBy: 1,
        }

        instructions.push(depositAccInstData)
      }

      if (proposalType === ProposalType.WITHDRAW) {
        const withdrawTxs = await mangoClient!.tokenWithdrawNativeIx(
          mangoGroup!,
          form.mangoAccount!,
          account.extensions.mint!.publicKey!,
          tokens,
          false
        )

        for (const withdrawTx of withdrawTxs) {
          const withdrawAccInsData = {
            data: getInstructionDataFromBase64(
              serializeInstructionToBase64(withdrawTx)
            ),
            holdUpTime:
              account?.governance.account?.config.minInstructionHoldUpTime,
            prerequisiteInstructions: [],
            chunkBy: 1,
          }

          instructions.push(withdrawAccInsData)
        }
      }

      if (form.delegate) {
        const delegateIx = await mangoClient!.program.methods
          .accountEdit(null, new PublicKey(form.delegateWallet), null, null)
          .accounts({
            group: mangoGroup!.publicKey,
            account: mangoAccountPk,
            owner: account.extensions.token!.account.owner!,
          })
          .instruction()

        const delegateAccInstData = {
          data: getInstructionDataFromBase64(
            serializeInstructionToBase64(delegateIx!)
          ),
          holdUpTime:
            account?.governance.account?.config.minInstructionHoldUpTime,
          prerequisiteInstructions: [],
          chunkBy: 1,
        }

        instructions.push(delegateAccInstData)
      }

      const proposalAddress = await handleCreateProposal({
        title: form.title,
        description: form.description,
        voteByCouncil,
        instructionsData: instructions,
        governance: account.governance!,
      })
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )
      router.push(url)
    } catch (e) {
      console.log(e)
    }
    setIsProposing(false)
  }

  return (
    <div className="w-full inline-block ">
      <div className="border-b border-fgd-4 flex items-center pb-2 mb-4">
        <img
          src="https://mango.markets/logos/logo-mark.svg"
          className="w-10 h-10 mr-3"
        />
        <div className="flex justify-center items-center">
          <h3>Mango</h3>
        </div>
      </div>
      <div>
        <div className="pb-4">
          <ButtonGroup
            activeValue={proposalType}
            className="h-10"
            onChange={(v) => setProposalType(v)}
            values={tabs}
          />
        </div>
        {proposalType === ProposalType.WITHDRAW && (
          <div className="pt-2 space-y-4 w-full">
            {account.extensions.mint?.publicKey.toBase58() ===
              USDC_MINT.toBase58() && (
              <ProgramSelector
                programSelectorHook={programSelectorHook}
              ></ProgramSelector>
            )}

            <Select
              error={formErrors['mangoAccount']}
              label="Mango account"
              value={
                <MangoAccountItem
                  account={form.mangoAccount || null}
                  group={mangoGroup}
                ></MangoAccountItem>
              }
              placeholder={
                form.mangoAccount === undefined
                  ? 'Please select...'
                  : form.mangoAccount?.name || 'Create new account'
              }
              onChange={(value) =>
                handleSetForm({
                  propertyName: 'mangoAccount',
                  value,
                })
              }
            >
              {isLoadingMangoAccount && !mangoAccounts.length ? (
                <div className="text-center py-4">Loading accounts...</div>
              ) : (
                mangoAccounts.map((x) => (
                  <Select.Option key={x.publicKey.toBase58()} value={x}>
                    <MangoAccountItem
                      account={x}
                      group={mangoGroup}
                    ></MangoAccountItem>
                  </Select.Option>
                ))
              )}

              <Select.Option key={null} value={null}>
                <div>Create new account</div>
              </Select.Option>
            </Select>
            {form.mangoAccount === null && (
              <Input
                error={formErrors['accountName']}
                label="Account name"
                type="text"
                value={form.accountName}
                onChange={(e) =>
                  handleSetForm({
                    propertyName: 'accountName',
                    value: e.target.value,
                  })
                }
              />
            )}
            <div className="flex mb-1.5 text-sm">
              Amount
              <div className="ml-auto flex items-center text-xs">
                {maxWithdrawBalance}
                <LinkButton
                  className="font-bold ml-2 text-primary-light"
                  onClick={() => {
                    handleSetForm({
                      propertyName: 'amount',
                      value: maxWithdrawBalance,
                    })
                  }}
                >
                  Max
                </LinkButton>
              </div>
            </div>
            <Input
              error={formErrors['amount']}
              min={mintMinAmount}
              max={maxWithdrawBalance}
              type="number"
              step={mintMinAmount}
              value={form.amount}
              onChange={(e) =>
                handleSetForm({
                  propertyName: 'amount',
                  value: e.target.value,
                })
              }
              onBlur={() => {
                handleSetForm({
                  propertyName: 'amount',
                  value: parseFloat(
                    Math.max(
                      Number(mintMinAmount),
                      Math.min(
                        Number(Number.MAX_SAFE_INTEGER),
                        Number(form.amount)
                      )
                    ).toFixed(currentPrecision)
                  ),
                })
              }}
            />
            <div className="flex justify-end mb-1.5 text-sm">
              <p>Delegate</p>
              <Switch
                checked={form.delegate}
                onChange={() =>
                  handleSetForm({
                    propertyName: 'delegate',
                    value: !form.delegate,
                  })
                }
              />
            </div>
            {form.delegate && (
              <Input
                error={formErrors['delegateWallet']}
                label="Delegate Wallet"
                type="text"
                value={form.delegateWallet}
                onChange={(e) =>
                  handleSetForm({
                    propertyName: 'delegateWallet',
                    value: e.target.value,
                  })
                }
              />
            )}
            <AdditionalProposalOptions
              title={form.title}
              description={form.description}
              defaultTitle={form.title}
              defaultDescription={''}
              setTitle={(evt) => {
                handleSetForm({
                  propertyName: 'title',
                  value: evt.target.value,
                })
              }}
              setDescription={(evt) => {
                handleSetForm({
                  propertyName: 'description',
                  value: evt.target.value,
                })
              }}
              voteByCouncil={voteByCouncil}
              setVoteByCouncil={setVoteByCouncil}
            />
            <div className="mt-4 justify-end flex">
              <Button
                isLoading={isProposing}
                disabled={isProposing || !canUseTransferInstruction}
                onClick={handleCreateAccount}
                className="w-full"
              >
                <Tooltip
                  content={
                    !canUseTransferInstruction
                      ? 'You need to have connected wallet with ability to create token transfer proposals'
                      : ''
                  }
                >
                  <div>Propose withdraw</div>
                </Tooltip>
              </Button>
            </div>
          </div>
        )}
        {proposalType === ProposalType.DEPOSIT && (
          <div className="pt-2 space-y-4 w-full">
            {account.extensions.mint?.publicKey.toBase58() ===
              USDC_MINT.toBase58() && (
              <ProgramSelector
                programSelectorHook={programSelectorHook}
              ></ProgramSelector>
            )}

            <Select
              error={formErrors['mangoAccount']}
              label="Mango account"
              value={
                <MangoAccountItem
                  account={form.mangoAccount || null}
                  group={mangoGroup}
                ></MangoAccountItem>
              }
              placeholder={
                form.mangoAccount === undefined
                  ? 'Please select...'
                  : form.mangoAccount?.name || 'Create new account'
              }
              onChange={(value) =>
                handleSetForm({
                  propertyName: 'mangoAccount',
                  value,
                })
              }
            >
              {isLoadingMangoAccount && !mangoAccounts.length ? (
                <div className="text-center py-4">Loading accounts...</div>
              ) : (
                mangoAccounts.map((x) => (
                  <Select.Option key={x.publicKey.toBase58()} value={x}>
                    <MangoAccountItem
                      account={x}
                      group={mangoGroup}
                    ></MangoAccountItem>
                  </Select.Option>
                ))
              )}

              <Select.Option key={null} value={null}>
                <div>Create new account</div>
              </Select.Option>
            </Select>
            {form.mangoAccount === null && (
              <Input
                error={formErrors['accountName']}
                label="Account name"
                type="text"
                value={form.accountName}
                onChange={(e) =>
                  handleSetForm({
                    propertyName: 'accountName',
                    value: e.target.value,
                  })
                }
              />
            )}
            <div className="flex mb-1.5 text-sm">
              Amount
              <div className="ml-auto flex items-center text-xs">
                {maxAmountFtm}
                <LinkButton
                  className="font-bold ml-2 text-primary-light"
                  onClick={() => {
                    handleSetForm({
                      propertyName: 'amount',
                      value: maxAmount.toNumber(),
                    })
                  }}
                >
                  Max
                </LinkButton>
              </div>
            </div>
            <Input
              error={formErrors['amount']}
              min={mintMinAmount}
              max={maxAmount.toNumber()}
              type="number"
              step={mintMinAmount}
              value={form.amount}
              onChange={(e) =>
                handleSetForm({
                  propertyName: 'amount',
                  value: e.target.value,
                })
              }
              onBlur={() => {
                handleSetForm({
                  propertyName: 'amount',
                  value: parseFloat(
                    Math.max(
                      Number(mintMinAmount),
                      Math.min(
                        Number(Number.MAX_SAFE_INTEGER),
                        Number(form.amount)
                      )
                    ).toFixed(currentPrecision)
                  ),
                })
              }}
            />
            <div className="flex justify-end mb-1.5 text-sm">
              <p>Delegate</p>
              <Switch
                checked={form.delegate}
                onChange={() =>
                  handleSetForm({
                    propertyName: 'delegate',
                    value: !form.delegate,
                  })
                }
              />
            </div>
            {form.delegate && (
              <Input
                error={formErrors['delegateWallet']}
                label="Delegate Wallet"
                type="text"
                value={form.delegateWallet}
                onChange={(e) =>
                  handleSetForm({
                    propertyName: 'delegateWallet',
                    value: e.target.value,
                  })
                }
              />
            )}
            <AdditionalProposalOptions
              title={form.title}
              description={form.description}
              defaultTitle={form.title}
              defaultDescription={''}
              setTitle={(evt) => {
                handleSetForm({
                  propertyName: 'title',
                  value: evt.target.value,
                })
              }}
              setDescription={(evt) => {
                handleSetForm({
                  propertyName: 'description',
                  value: evt.target.value,
                })
              }}
              voteByCouncil={voteByCouncil}
              setVoteByCouncil={setVoteByCouncil}
            />
            <div className="mt-4 justify-end flex">
              <Button
                isLoading={isProposing}
                disabled={isProposing || !canUseTransferInstruction}
                onClick={handleCreateAccount}
                className="w-full"
              >
                <Tooltip
                  content={
                    !canUseTransferInstruction
                      ? 'You need to have connected wallet with ability to create token transfer proposals'
                      : ''
                  }
                >
                  <div>Propose deposit</div>
                </Tooltip>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const MangoAccountItem = ({
  account,
  group,
}: {
  account: MangoAccount | null
  group: Group | null
}) => {
  return account && group ? (
    <div>
      <div>Name: {account.name}</div>
      <div>{account.publicKey.toBase58()}</div>
      <div>
        Account Value: ${toUiDecimals(account.getAssetsValue(group), 6)}
      </div>
    </div>
  ) : (
    <div>Create new account</div>
  )
}

const getNextAccountNumber = (accounts: MangoAccount[]): number => {
  if (accounts.length > 1) {
    return (
      accounts
        .map((a) => a.accountNum)
        .reduce((a, b) => Math.max(a, b), -Infinity) + 1
    )
  } else if (accounts.length === 1) {
    return accounts[0].accountNum + 1
  }
  return 0
}

export default MangoModal
