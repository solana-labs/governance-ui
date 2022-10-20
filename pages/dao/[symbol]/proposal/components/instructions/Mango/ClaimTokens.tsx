/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { Connection, PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  MangoDepositToMangoAccountFormCsv,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import {
  Config,
  MangoClient,
  makeDepositInstruction,
  BN,
} from '@blockworks-foundation/mango-client'
import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { tryParseKey } from '@tools/validators/pubkey'
import { MangoV3ReimbursementClient } from '@blockworks-foundation/mango-v3-reimbursement-lib/dist'
import { AnchorProvider } from '@project-serum/anchor'
import { NodeWallet } from '@project-serum/common'
import { notify } from '@utils/notifications'
import ClaimMangoTokensTableRow, {
  MintInfo,
  ReimbursementAccount,
  TableInfo,
} from '@components/ClaimMangoTokenTableRow'
import { ExclamationCircleIcon } from '@heroicons/react/solid'

const GROUP_NUM = 1

async function tryDecodeTable(reimbursementClient, group) {
  try {
    const table = await reimbursementClient.decodeTable(group.account)
    return table
  } catch (e) {
    return null
    //silent error
  }
}

async function tryGetReimbursedAccounts(
  reimbursementClient,
  reimbursementAccount: PublicKey
) {
  try {
    const ra = await reimbursementClient!.program.account.reimbursementAccount.fetch(
      reimbursementAccount
    )
    return ra
  } catch (e) {
    return null
  }
}

const MangoClaimTokens = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { governedTokenAccounts } = useGovernanceAssets()
  const tokenAccounts = governedTokenAccounts.filter((x) => x.isToken)
  const [table, setTable] = useState<TableInfo[]>([])
  const connection = useWalletStore((s) => s.connection)
  const groupName = connection.cluster === 'devnet' ? 'devnet.2' : 'mainnet.1'
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MangoDepositToMangoAccountFormCsv>({
    governedAccount: null,
    data: [],
  })
  const [mintsForAvailableAmounts, setMintsForAvailableAmounts] = useState<{
    [key: string]: MintInfo
  }>({})
  const [
    reimbursementAccount,
    setReimbursementAccount,
  ] = useState<ReimbursementAccount | null>(null)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const [
    reimbursementClient,
    setReimbursementClient,
  ] = useState<MangoV3ReimbursementClient | null>(null)
  const getCurrentGroup = async () => {
    const result = await reimbursementClient!.program.account.group.all()
    const group = result.find((group) => group.account.groupNum === GROUP_NUM)
    return group
  }
  const handleSetReimbursementAccount = async (group) => {
    const reimbursementAccount = (
      await PublicKey.findProgramAddress(
        [
          Buffer.from('ReimbursementAccount'),
          group!.publicKey.toBuffer()!,
          wallet!.publicKey!.toBuffer(),
        ],
        reimbursementClient!.program.programId
      )
    )[0]
    const ra = await tryGetReimbursedAccounts(
      reimbursementClient,
      reimbursementAccount
    )
    setReimbursementAccount(ra)
  }
  const getAccountAmountsInfo = async (accountPk: PublicKey) => {
    try {
      const group = await getCurrentGroup()
      const config = Config.ids()
      const groupIds = config.getGroup(connection.cluster, groupName)
      const table = await tryDecodeTable(reimbursementClient, group)
      const balancesForUser = table.find((row) => row.owner.equals(accountPk))
        ?.balances
      if (balancesForUser) {
        const indexesToUse: number[] = []
        for (const i in balancesForUser) {
          const isZero = balancesForUser[i].isZero()
          if (!isZero) {
            indexesToUse.push(Number(i))
          }
        }
        const tableInfo = [
          ...indexesToUse.map((idx) => {
            return {
              nativeAmount: balancesForUser[idx],
              mintPubKey: group!.account.mints[idx],
              index: idx,
            }
          }),
        ]
        const mintPks = tableInfo.map((x) => x.mintPubKey)
        const mints = await Promise.all(
          mintPks.map((x) => connection.current.getParsedAccountInfo(x))
        )
        const mintInfos = {}
        for (let i = 0; i < mintPks.length; i++) {
          const mintPk = mintPks[i]
          mintInfos[mintPk.toBase58()] = {
            decimals: (mints[i].value?.data as any).parsed.info.decimals,
            symbol: groupIds!.tokens.find(
              (x) => x.mintKey.toBase58() === mintPk.toBase58()
            )?.symbol,
          }
        }
        setMintsForAvailableAmounts(mintInfos)
        setTable(tableInfo)
        await handleSetReimbursementAccount(group)
      } else {
        resetAmountState()
      }
    } catch (e) {
      notify({
        type: 'error',
        message: 'Failed to get account reimbursement amount',
        description: `${e}`,
      })
    }
  }
  const resetAmountState = () => {
    setMintsForAvailableAmounts({})
    setTable([])
    setReimbursementAccount(null)
  }
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    const serializedInstructions: string[] = []
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const mangoConnection =
        connection.cluster === 'localnet'
          ? new Connection(Config.ids().cluster_urls.mainnet)
          : connection.current
      const GROUP = connection.cluster === 'devnet' ? 'devnet.2' : 'mainnet.1'
      const groupConfig = Config.ids().getGroupWithName(GROUP)!
      const client = new MangoClient(
        connection.current,
        groupConfig.mangoProgramId
      )
      const group = await client.getMangoGroup(groupConfig.publicKey)
      const rootBanks = await group.loadRootBanks(mangoConnection)
      const rootBank = group.tokens.find(
        (x) =>
          x.mint.toBase58() ===
          form.governedAccount?.extensions.mint?.publicKey.toBase58()
      )?.rootBank
      const quoteRootBank = rootBanks[group.getRootBankIndex(rootBank!)]
      const quoteNodeBank = quoteRootBank?.nodeBankAccounts[0]
      for (const deposit of form.data) {
        const mangoAccountPk = tryParseKey(deposit.mango_account)
          ? new PublicKey(deposit.mango_account)
          : null
        if (mangoAccountPk) {
          const mintAmount = parseMintNaturalAmountFromDecimal(
            deposit.token_amount!,
            form.governedAccount.extensions.mint!.account.decimals
          )
          //Mango instruction call and serialize
          const depositIx = makeDepositInstruction(
            groupConfig.mangoProgramId,
            groupConfig.publicKey,
            form.governedAccount.extensions.token!.account.owner,
            group.mangoCache,
            mangoAccountPk,
            quoteRootBank!.publicKey,
            quoteNodeBank!.publicKey,
            quoteNodeBank!.vault,
            form.governedAccount.extensions.transferAddress!,
            new BN(mintAmount)
          )
          serializedInstructions.push(serializeInstructionToBase64(depositIx))
        }
      }
    }
    const obj: UiInstruction = {
      serializedInstruction: '',
      additionalSerializedInstructions: serializedInstructions,
      isValid,
      governance: form.governedAccount?.governance,
      chunkSplitByDefault: true,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [JSON.stringify(form)])
  useEffect(() => {
    const govPk = form?.governedAccount?.governance?.pubkey
    if (govPk) {
      getAccountAmountsInfo(govPk)
    }
  }, [form.governedAccount])
  useEffect(() => {
    console.log('connection', connection.current)

    if (wallet?.connected && wallet?.publicKey?.toBase58()) {
      const options = AnchorProvider.defaultOptions()
      const provider = new AnchorProvider(
        connection.current,
        (wallet as unknown) as NodeWallet,
        options
      )
      const mangoV3ReimbursementClient = new MangoV3ReimbursementClient(
        provider
      )
      setReimbursementClient(mangoV3ReimbursementClient)
    }
  }, [
    wallet?.connected,
    wallet?.publicKey?.toBase58(),
    connection.current.rpcEndpoint,
  ])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
  })
  return (
    <>
      <GovernedAccountSelect
        label="Token account"
        governedAccounts={tokenAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <div>
        <div className="mb-2 grid grid-cols-12 gap-3 px-4 text-xs text-th-fgd-3">
          <div className="col-span-5">Token</div>
          <div className="col-span-4 text-right">Amount</div>
          <div className="col-span-3 text-right">Claimed</div>
        </div>
        {table.length ? (
          <div className="space-y-2">
            {reimbursementClient &&
              table.map((x) => (
                <ClaimMangoTokensTableRow
                  reimbursementClient={reimbursementClient}
                  reimbursementAccount={reimbursementAccount}
                  key={x.mintPubKey.toBase58()}
                  mintsForAvailableAmounts={mintsForAvailableAmounts}
                  item={x}
                ></ClaimMangoTokensTableRow>
              ))}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-md border border-th-bkg-3 p-4">
            <ExclamationCircleIcon className="mr-2 w-5"></ExclamationCircleIcon>{' '}
            No tokens to recover for your connected wallet
          </div>
        )}
      </div>
    </>
  )
}

export default MangoClaimTokens
