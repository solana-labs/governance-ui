import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import { NewProposalContext } from '../../../new'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  getPoolPubkeyFromName,
  governanceInstructionInput,
  withdrawRequestInitializeInstructionInputs,
  PoolName,
  WithdrawRequestInitializeSchemaComponents,
} from '@utils/instructions/MapleFinance/util'
import { useRealmQuery } from '@hooks/queries/realm'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import * as mapleFinance from '@maplelabs/syrup-sdk'
import useWalletDeprecated from '@hooks/useWalletDeprecated'
import {
  SolanaProvider,
  SolanaAugmentedProvider,
  SignerWallet,
} from '@saberhq/solana-contrib'
import { TransactionInstruction } from '@solana/web3.js'
import {
  fmtBnMintDecimals,
  parseMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { tryGetMint } from '@utils/tokens'
import { findLenderAddress } from '@maplelabs/syrup-sdk'
import { tryGetAta } from '@utils/validations'

interface WithdrawalRequestInitializeForm {
  governedAccount: AssetAccount | undefined
  sharesAmount: number
  poolName: { name: PoolName; value: number }
}

const WithdrawalRequestInitialize = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const realm = useRealmQuery().data?.result
  const { assetAccounts } = useGovernanceAssets()
  const connection = useLegacyConnectionContext()
  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<WithdrawalRequestInitializeForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { wallet } = useWalletDeprecated()
  const [sharesAmountAvailable, setSharesAmountAvailable] = useState<
    string | null
  >(null)

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })

    // getInstruction must return something, even if it is an invalid instruction
    let serializedInstructions = ['']

    if (
      isValid &&
      form!.governedAccount?.governance?.pubkey &&
      connection?.current
    ) {
      const withdrawalRequestIxs: TransactionInstruction[] = []

      const client = mapleFinance.SyrupClient.load({
        provider: new SolanaAugmentedProvider(
          SolanaProvider.init({
            connection: connection.current,
            wallet: (wallet as unknown) as SignerWallet,
          })
        ),
      })

      const poolAddress = getPoolPubkeyFromName(form!.poolName.name)
      const lenderUser = form!.governedAccount?.pubkey

      const pool = await mapleFinance.WrappedPool.load(client, poolAddress)

      const shareMintInfo = await tryGetMint(
        connection.current,
        pool.data.sharesMint
      )

      if (!shareMintInfo) throw new Error('Cannot load info about share mint')

      const nativeSharesAmount = parseMintNaturalAmountFromDecimalAsBN(
        form!.sharesAmount,
        shareMintInfo.account.decimals
      )

      const [lenderAddress] = await findLenderAddress(poolAddress, lenderUser)

      const lender = await mapleFinance.WrappedLender.load(
        client,
        lenderAddress
      )

      const txEnveloppe = await client
        .lenderActions()
        .initializeWithdrawalRequest({
          sharesAmount: nativeSharesAmount,
          pool,
          lender,
          lenderUser,
        })

      console.info(
        'withdrawal request',
        txEnveloppe.withdrawalRequest.toBase58()
      )
      console.info(
        'withdrawal request locker',
        txEnveloppe.withdrawalRequestLocker.toBase58()
      )

      withdrawalRequestIxs.push(...txEnveloppe.tx.instructions)

      serializedInstructions = withdrawalRequestIxs.map(
        serializeInstructionToBase64
      )
    }

    // Realms appears to put additionalSerializedInstructions first, so reverse the order of the instructions
    // to ensure the resize function comes first.
    const [
      serializedInstruction,
      ...additionalSerializedInstructions
    ] = serializedInstructions.reverse()

    return {
      serializedInstruction,
      additionalSerializedInstructions,
      isValid,
      governance: form!.governedAccount?.governance,
    }
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form?.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape(WithdrawRequestInitializeSchemaComponents)
  const inputs: InstructionInput[] = [
    governanceInstructionInput(
      realm,
      governance || undefined,
      assetAccounts,
      shouldBeGoverned
    ),
    {
      ...withdrawRequestInitializeInstructionInputs.sharesAmount,
      additionalComponent: (
        <div className="text-xs">
          Shares available:{' '}
          {sharesAmountAvailable === null ? '-' : sharesAmountAvailable}
        </div>
      ),
    },
    withdrawRequestInitializeInstructionInputs.poolName,
  ]

  useEffect(() => {
    ;(async () => {
      try {
        if (!form!.poolName.name || !form!.governedAccount?.pubkey)
          return setSharesAmountAvailable(null)

        console.log('Load amount')

        const poolAddress = getPoolPubkeyFromName(form!.poolName.name)
        const lenderUser = form!.governedAccount?.pubkey

        const client = mapleFinance.SyrupClient.load({
          provider: new SolanaAugmentedProvider(
            SolanaProvider.init({
              connection: connection.current,
              wallet: (wallet as unknown) as SignerWallet,
            })
          ),
        })

        const pool = await mapleFinance.WrappedPool.load(client, poolAddress)

        const ata = await tryGetAta(
          connection.current,
          pool.data.sharesMint,
          lenderUser
        )

        if (typeof ata === 'undefined') return

        const shareMintInfo = await tryGetMint(
          connection.current,
          pool.data.sharesMint
        )

        if (!shareMintInfo) return

        console.log('ata', ata, ata.account.amount)

        const sharesAmount = fmtBnMintDecimals(
          ata.account.amount,
          shareMintInfo.account.decimals
        )

        setSharesAmountAvailable(sharesAmount)
      } catch {
        // ignore errors
      }
    })()
  }, [connection, form, form?.poolName, wallet])

  return (
    <>
      <InstructionForm
        outerForm={form}
        setForm={setForm}
        inputs={inputs}
        setFormErrors={setFormErrors}
        formErrors={formErrors}
      ></InstructionForm>
    </>
  )
}

export default WithdrawalRequestInitialize
