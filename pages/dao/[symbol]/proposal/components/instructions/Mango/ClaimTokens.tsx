/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  Governance,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { Config } from '@blockworks-foundation/mango-client'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { MangoV3ReimbursementClient } from '@blockworks-foundation/mango-v3-reimbursement-lib/dist'
import { AnchorProvider, BN } from '@project-serum/anchor'
import { NodeWallet } from '@project-serum/common'
import { notify } from '@utils/notifications'
import ClaimMangoTokensTableRow, {
  MintInfo,
  ReimbursementAccount,
  TableInfo,
} from '@components/ClaimMangoTokenTableRow'
import { ExclamationCircleIcon } from '@heroicons/react/solid'
import { AssetAccount } from '@utils/uiTypes/assets'
import Button from '@components/Button'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { isExistingTokenAccount } from '@utils/validations'

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

export interface MangoClaimTokens {
  governedAccount: AssetAccount | null
  tokensDestination: AssetAccount | null
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
  const { governedTokenAccounts, assetAccounts } = useGovernanceAssets()
  const tokenAccounts = governedTokenAccounts.filter((x) => x.isToken)
  const [table, setTable] = useState<TableInfo[]>([])
  const connection = useWalletStore((s) => s.connection)
  const groupName = connection.cluster === 'devnet' ? 'devnet.2' : 'mainnet.1'
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MangoClaimTokens>({
    governedAccount: null,
    tokensDestination: null,
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
          form.governedAccount?.governance!.pubkey!.toBuffer(),
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
      const preqTransactions: TransactionInstruction[] = []
      const group = await getCurrentGroup()
      const isExistingReimbursementAccount = reimbursementAccount
      if (!isExistingReimbursementAccount) {
        const instruction = await reimbursementClient!.program.methods
          .createReimbursementAccount()
          .accounts({
            group: (group as any).publicKey,
            mangoAccountOwner: form.governedAccount!.governance!.pubkey!,
            payer: wallet.publicKey!,
          })
          .instruction()
        preqTransactions.push(instruction)
      }
      const table = await tryDecodeTable(reimbursementClient, group)
      const reimbursementAccountPk = (
        await PublicKey.findProgramAddress(
          [
            Buffer.from('ReimbursementAccount'),
            group!.publicKey.toBuffer()!,
            form.governedAccount!.governance!.pubkey!.toBuffer(),
          ],
          reimbursementClient!.program.programId
        )
      )[0]
      for (const availableMintPk of Object.keys(mintsForAvailableAmounts)) {
        const mintIndex = group?.account.mints.findIndex(
          (x) => x.toBase58() === availableMintPk
        )
        const mintPk = group?.account.mints[mintIndex!]
        const claimMintPk = group?.account.claimMints[mintIndex!]
        const tableIndex = table.findIndex((row) =>
          row.owner.equals(form.governedAccount!.governance!.pubkey!)
        )
        const isTokenClaimed = reimbursementAccount
          ? await reimbursementClient!.reimbursed(
              reimbursementAccount,
              mintIndex
            )
          : false

        if (!isTokenClaimed) {
          const [ataPk, daoAtaPk] = await Promise.all([
            Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
              TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
              mintPk!, // mint
              form.tokensDestination!.extensions.transferAddress!, // owner
              true
            ),
            Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
              TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
              claimMintPk!,
              group!.account.claimTransferDestination!,
              true
            ),
          ])

          const isExistingAta = await isExistingTokenAccount(connection, ataPk)
          if (!isExistingAta) {
            preqTransactions.push(
              Token.createAssociatedTokenAccountInstruction(
                ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
                TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
                mintPk!, // mint
                ataPk, // ata
                form.tokensDestination!.extensions.transferAddress!, // owner of token account
                wallet.publicKey // fee payer
              )
            )
          }
          const ix = await reimbursementClient!.program.methods
            .reimburse(new BN(mintIndex!), new BN(tableIndex), true)
            .accounts({
              group: (group as any).publicKey,
              vault: group?.account.vaults[mintIndex!],
              tokenAccount: ataPk,
              claimMint: claimMintPk,
              claimMintTokenAccount: daoAtaPk,
              reimbursementAccount: reimbursementAccountPk!,
              mangoAccountOwner: form.governedAccount!.governance!.pubkey!,
              table: group?.account.table,
            })
            .instruction()
          serializedInstructions.push(serializeInstructionToBase64(ix))
        }
      }
    }
    const obj: UiInstruction = {
      serializedInstruction: '',
      additionalSerializedInstructions: serializedInstructions,
      prerequisiteInstructions: [],
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
    tokensDestination: yup
      .object()
      .nullable()
      .required('Tokens destination is required'),
  })
  const claimText = `By recovering funds, [_____] Decentralized Autonomous Entity (DAO)
  represents and agrees that it, and any of its contributors, agents,
  affiliates, officers, employees, and principals hereby irrevocably sell,
  convey, transfer and assign to Mango Labs, LLC all of its right, title
  and interest in, to and under all claims arising out of or related to
  the October 2022 incident, including, without limitation, all of its
  causes of action or other rights with respect to such claims, all rights
  to receive any amounts or property or other distribution in respect of
  or in connection with such claims, and any and all proceeds of any of
  the foregoing (including proceeds of proceeds). [_____] DAO further
  irrevocably and unconditionally releases all claims it may have against
  Mango Labs, LLC, the Mango DAO, its core contributors, and any of their
  agents, affiliates, officers, employees, or principals related to this
  matter. This release constitutes an express, informed, knowing and
  voluntary waiver and relinquishment to the fullest extent permitted by
  law.`
  const copyClaimText = () => {
    copy(claimText)
  }
  return (
    <>
      <GovernedAccountSelect
        label="Mango account owner"
        governedAccounts={tokenAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <div className="max-w-lg">
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
      <GovernedAccountSelect
        label="Tokens destination (SOL wallet)"
        governedAccounts={assetAccounts.filter((x) => x.isSol)}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'tokensDestination' })
        }}
        value={form.tokensDestination}
        error={formErrors['tokensDestination']}
      ></GovernedAccountSelect>
      <div>
        While reimbursing, transfer of end-user claims to mango dao is
        mandatory, in case you are reclaiming DAO funds, we would ask you to
        pass a DAO proposal including waiver together with the executable
        instruction.
      </div>
      <div className="border p-4 border-fgd-4">
        {claimText}
        <div className="pt-4 flex justify-end">
          <Button onClick={copyClaimText}>Copy</Button>
        </div>
      </div>
    </>
  )
}

export default MangoClaimTokens

function copy(text) {
  const input = document.createElement('input')
  input.setAttribute('value', text)
  document.body.appendChild(input)
  input.select()
  const result = document.execCommand('copy')
  document.body.removeChild(input)
  return result
}
