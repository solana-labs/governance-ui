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
  lendingUnlockDepositInstructionInputs,
  PoolName,
  LendingUnlockDepositSchemaComponents,
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
import { findLenderAddress } from '@maplelabs/syrup-sdk'

interface LendingUnlockDepositForm {
  governedAccount: AssetAccount | undefined
  poolName: { name: PoolName; value: number }
}

const LendingUnlockDeposit = ({
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
  const [form, setForm] = useState<LendingUnlockDepositForm>()
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
      const lenderUnlockDepositIxs: TransactionInstruction[] = []

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

      console.log('lenderUser', lenderUser.toBase58())

      const pool = await mapleFinance.WrappedPool.load(client, poolAddress)

      const [lenderAddress] = await findLenderAddress(poolAddress, lenderUser)

      const [lender, globals] = await Promise.all([
        mapleFinance.WrappedLender.load(client, lenderAddress),
        mapleFinance.WrappedGlobals.load(client, pool.data.globals),
      ])

      const txEnveloppe = await client.lenderActions().unlockShares({
        lender,
        lenderUser,
        globals,
      })

      lenderUnlockDepositIxs.push(...txEnveloppe.instructions)

      serializedInstructions = lenderUnlockDepositIxs.map(
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
  const schema = yup.object().shape(LendingUnlockDepositSchemaComponents)
  const inputs: InstructionInput[] = [
    governanceInstructionInput(
      realm,
      governance || undefined,
      assetAccounts,
      shouldBeGoverned
    ),
    lendingUnlockDepositInstructionInputs.poolName,
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

export default LendingUnlockDeposit
