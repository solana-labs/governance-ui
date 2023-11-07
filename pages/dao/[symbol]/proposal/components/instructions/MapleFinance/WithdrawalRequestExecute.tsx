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
  withdrawRequestExecuteInstructionInputs,
  PoolName,
  WithdrawRequestExecuteSchemaComponents,
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
import { PublicKey, TransactionInstruction } from '@solana/web3.js'

interface WithdrawalRequestExecuteForm {
  governedAccount: AssetAccount | undefined
  poolName: { name: PoolName; value: number }
  withdrawalRequest: string
}

const WithdrawalRequestExecute = ({
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
  const [form, setForm] = useState<WithdrawalRequestExecuteForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { wallet } = useWalletDeprecated()

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

      const pool = await mapleFinance.WrappedPool.load(client, poolAddress)

      const withdrawalRequestAddress = new PublicKey(form!.withdrawalRequest)

      const withdrawalRequest = await mapleFinance.WrappedWithdrawalRequest.load(
        client,
        withdrawalRequestAddress
      )

      const lenderUser = form!.governedAccount?.pubkey

      const txEnveloppe = await client
        .lenderActions()
        .executeWithdrawalRequest({
          pool,
          withdrawalRequest,
          lenderUser,
        })

      // remove the last instruction which is the close account instruction
      // otherwise the transaction will fail due to Transaction too large: 1256 > 1232
      const ixs = txEnveloppe.instructions.slice(0, -1)

      withdrawalRequestIxs.push(...ixs)

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
  const schema = yup.object().shape(WithdrawRequestExecuteSchemaComponents)
  const inputs: InstructionInput[] = [
    governanceInstructionInput(
      realm,
      governance || undefined,
      assetAccounts,
      shouldBeGoverned
    ),
    withdrawRequestExecuteInstructionInputs.poolName,
    withdrawRequestExecuteInstructionInputs.withdrawalRequest,
  ]

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

export default WithdrawalRequestExecute
