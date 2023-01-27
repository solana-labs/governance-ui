/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import { buildIxGate } from '@blockworks-foundation/mango-v4/dist/types/src/clientIxParamBuilder'

interface IxGateSetForm {
  governedAccount: AssetAccount | null
  accountClose: boolean
  accountCreate: boolean
  accountEdit: boolean
  accountExpand: boolean
  accountToggleFreeze: boolean
  altExtend: boolean
  altSet: boolean
  flashLoan: boolean
  groupClose: boolean
  groupCreate: boolean
  groupToggleHalt: boolean
  healthRegion: boolean
  perpCancelAllOrders: boolean
  perpCancelAllOrdersBySide: boolean
  perpCancelOrder: boolean
  perpCancelOrderByClientOrderId: boolean
  perpCloseMarket: boolean
  perpConsumeEvents: boolean
  perpCreateMarket: boolean
  perpDeactivatePosition: boolean
  perpEditMarket: boolean
  perpLiqBasePosition: boolean
  perpLiqForceCancelOrders: boolean
  perpLiqQuoteAndBankruptcy: boolean
  perpPlaceOrder: boolean
  perpSettleFees: boolean
  perpSettlePnl: boolean
  perpUpdateFunding: boolean
  serum3CancelAllOrders: boolean
  serum3CancelOrder: boolean
  serum3CloseOpenOrders: boolean
  serum3CreateOpenOrders: boolean
  serum3DeregisterMarket: boolean
  serum3EditMarket: boolean
  serum3LiqForceCancelOrders: boolean
  serum3PlaceOrder: boolean
  serum3RegisterMarket: boolean
  serum3SettleFunds: boolean
  stubOracleClose: boolean
  stubOracleCreate: boolean
  stubOracleSet: boolean
  tokenAddBank: boolean
  tokenDeposit: boolean
  tokenDeregister: boolean
  tokenEdit: boolean
  tokenLiqBankruptcy: boolean
  tokenLiqWithToken: boolean
  tokenRegister: boolean
  tokenRegisterTrustless: boolean
  tokenUpdateIndexAndRate: boolean
  tokenWithdraw: boolean
}

const IxGateSet = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { getClient, GROUP } = UseMangoV4()
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const governedProgramAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.SOL
  )
  const { connection } = useWalletStore()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<IxGateSetForm>({
    governedAccount: null,
    accountClose: false,
    accountCreate: false,
    accountEdit: false,
    accountExpand: false,
    accountToggleFreeze: false,
    altExtend: false,
    altSet: false,
    flashLoan: false,
    groupClose: false,
    groupCreate: false,
    groupToggleHalt: false,
    healthRegion: false,
    perpCancelAllOrders: false,
    perpCancelAllOrdersBySide: false,
    perpCancelOrder: false,
    perpCancelOrderByClientOrderId: false,
    perpCloseMarket: false,
    perpConsumeEvents: false,
    perpCreateMarket: false,
    perpDeactivatePosition: false,
    perpEditMarket: false,
    perpLiqBasePosition: false,
    perpLiqForceCancelOrders: false,
    perpLiqQuoteAndBankruptcy: false,
    perpPlaceOrder: false,
    perpSettleFees: false,
    perpSettlePnl: false,
    perpUpdateFunding: false,
    serum3CancelAllOrders: false,
    serum3CancelOrder: false,
    serum3CloseOpenOrders: false,
    serum3CreateOpenOrders: false,
    serum3DeregisterMarket: false,
    serum3EditMarket: false,
    serum3LiqForceCancelOrders: false,
    serum3PlaceOrder: false,
    serum3RegisterMarket: false,
    serum3SettleFunds: false,
    stubOracleClose: false,
    stubOracleCreate: false,
    stubOracleSet: false,
    tokenAddBank: false,
    tokenDeposit: false,
    tokenDeregister: false,
    tokenEdit: false,
    tokenLiqBankruptcy: false,
    tokenLiqWithToken: false,
    tokenRegister: false,
    tokenRegisterTrustless: false,
    tokenUpdateIndexAndRate: false,
    tokenWithdraw: false,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
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
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const client = await getClient(connection, wallet)
      const group = await client.getGroup(GROUP)
      const builderTypedIxGate: any = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [
          k.charAt(0).toUpperCase() + k.slice(1),
          v,
        ])
      )

      const ix = await client.program.methods
        .ixGateSet(buildIxGate(builderTypedIxGate))
        .accounts({
          group: group.publicKey,
          admin: form.governedAccount.extensions.transferAddress,
        })
        .instruction()

      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realmInfo?.programId])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: governedProgramAccounts,
    },
    {
      label: 'Account Close',
      initialValue: form.accountClose,
      type: InstructionInputType.SWITCH,
      name: 'accountClose',
    },
    {
      label: 'Account Create',
      initialValue: form.accountCreate,
      type: InstructionInputType.SWITCH,
      name: 'accountCreate',
    },
    {
      label: 'Account Edit',
      initialValue: form.accountEdit,
      type: InstructionInputType.SWITCH,
      name: 'accountEdit',
    },
    {
      label: 'Account Expand',
      initialValue: form.accountExpand,
      type: InstructionInputType.SWITCH,
      name: 'accountExpand',
    },
    {
      label: 'Account Toggle Freeze',
      initialValue: form.accountToggleFreeze,
      type: InstructionInputType.SWITCH,
      name: 'accountToggleFreeze',
    },
    {
      label: 'Alt Extend',
      initialValue: form.altExtend,
      type: InstructionInputType.SWITCH,
      name: 'altExtend',
    },
    {
      label: 'Alt Set',
      initialValue: form.altSet,
      type: InstructionInputType.SWITCH,
      name: 'altSet',
    },
    {
      label: 'Flash Loan',
      initialValue: form.flashLoan,
      type: InstructionInputType.SWITCH,
      name: 'flashLoan',
    },
    {
      label: 'Group Close',
      initialValue: form.groupClose,
      type: InstructionInputType.SWITCH,
      name: 'groupClose',
    },
    {
      label: 'Group Create',
      initialValue: form.groupCreate,
      type: InstructionInputType.SWITCH,
      name: 'groupCreate',
    },
    {
      label: 'Group Toggle Halt',
      initialValue: form.groupToggleHalt,
      type: InstructionInputType.SWITCH,
      name: 'groupToggleHalt',
    },
    {
      label: 'Health Region',
      initialValue: form.healthRegion,
      type: InstructionInputType.SWITCH,
      name: 'healthRegion',
    },
    {
      label: 'Perp Cancel All Orders',
      initialValue: form.perpCancelAllOrders,
      type: InstructionInputType.SWITCH,
      name: 'perpCancelAllOrders',
    },
    {
      label: 'Perp Cancel All Orders By Side',
      initialValue: form.perpCancelAllOrdersBySide,
      type: InstructionInputType.SWITCH,
      name: 'perpCancelAllOrdersBySide',
    },
    {
      label: 'Perp Cancel Order',
      initialValue: form.perpCancelOrder,
      type: InstructionInputType.SWITCH,
      name: 'perpCancelOrder',
    },
    {
      label: 'Perp Cancel Order By Client Order Id',
      initialValue: form.perpCancelOrderByClientOrderId,
      type: InstructionInputType.SWITCH,
      name: 'perpCancelOrderByClientOrderId',
    },
    {
      label: 'Perp Close Market',
      initialValue: form.perpCloseMarket,
      type: InstructionInputType.SWITCH,
      name: 'perpCloseMarket',
    },
    {
      label: 'Perp Consume Events',
      initialValue: form.perpConsumeEvents,
      type: InstructionInputType.SWITCH,
      name: 'perpConsumeEvents',
    },
    {
      label: 'Perp Create Market',
      initialValue: form.perpCreateMarket,
      type: InstructionInputType.SWITCH,
      name: 'perpCreateMarket',
    },
    {
      label: 'Perp Deactivate Position',
      initialValue: form.perpDeactivatePosition,
      type: InstructionInputType.SWITCH,
      name: 'perpDeactivatePosition',
    },
    {
      label: 'Perp Edit Market',
      initialValue: form.perpEditMarket,
      type: InstructionInputType.SWITCH,
      name: 'perpEditMarket',
    },
    {
      label: 'Perp Liq Base Position',
      initialValue: form.perpLiqBasePosition,
      type: InstructionInputType.SWITCH,
      name: 'perpLiqBasePosition',
    },
    {
      label: 'Perp Liq Force Cancel Orders',
      initialValue: form.perpLiqForceCancelOrders,
      type: InstructionInputType.SWITCH,
      name: 'perpLiqForceCancelOrders',
    },
    {
      label: 'Perp Liq Quote And Bankruptcy',
      initialValue: form.perpLiqQuoteAndBankruptcy,
      type: InstructionInputType.SWITCH,
      name: 'perpLiqQuoteAndBankruptcy',
    },
    {
      label: 'Perp Place Order',
      initialValue: form.perpPlaceOrder,
      type: InstructionInputType.SWITCH,
      name: 'perpPlaceOrder',
    },
    {
      label: 'Perp Settle Fees',
      initialValue: form.perpSettleFees,
      type: InstructionInputType.SWITCH,
      name: 'perpSettleFees',
    },
    {
      label: 'Perp Settle Pnl',
      initialValue: form.perpSettlePnl,
      type: InstructionInputType.SWITCH,
      name: 'perpSettlePnl',
    },
    {
      label: 'Perp Update Funding',
      initialValue: form.perpUpdateFunding,
      type: InstructionInputType.SWITCH,
      name: 'perpUpdateFunding',
    },
    {
      label: 'Serum 3 Cancel All Orders',
      initialValue: form.serum3CancelAllOrders,
      type: InstructionInputType.SWITCH,
      name: 'serum3CancelAllOrders',
    },
    {
      label: 'Serum 3 Cancel Order',
      initialValue: form.serum3CancelOrder,
      type: InstructionInputType.SWITCH,
      name: 'serum3CancelOrder',
    },
    {
      label: 'Serum 3 Close Open Orders',
      initialValue: form.serum3CloseOpenOrders,
      type: InstructionInputType.SWITCH,
      name: 'serum3CloseOpenOrders',
    },
    {
      label: 'Serum 3 Create Open Orders',
      initialValue: form.serum3CreateOpenOrders,
      type: InstructionInputType.SWITCH,
      name: 'serum3CreateOpenOrders',
    },
    {
      label: 'Serum 3 Deregister Market',
      initialValue: form.serum3DeregisterMarket,
      type: InstructionInputType.SWITCH,
      name: 'serum3DeregisterMarket',
    },
    {
      label: 'Serum 3 Edit Market',
      initialValue: form.serum3EditMarket,
      type: InstructionInputType.SWITCH,
      name: 'serum3EditMarket',
    },
    {
      label: 'Serum 3 Liq Force Cancel Orders',
      initialValue: form.serum3LiqForceCancelOrders,
      type: InstructionInputType.SWITCH,
      name: 'serum3LiqForceCancelOrders',
    },
    {
      label: 'Serum 3 Place Order',
      initialValue: form.serum3PlaceOrder,
      type: InstructionInputType.SWITCH,
      name: 'serum3PlaceOrder',
    },
    {
      label: 'Serum 3 Register Market',
      initialValue: form.serum3RegisterMarket,
      type: InstructionInputType.SWITCH,
      name: 'serum3RegisterMarket',
    },
    {
      label: 'Serum 3 Settle Funds',
      initialValue: form.serum3SettleFunds,
      type: InstructionInputType.SWITCH,
      name: 'serum3SettleFunds',
    },
    {
      label: 'Stub Oracle Close',
      initialValue: form.stubOracleClose,
      type: InstructionInputType.SWITCH,
      name: 'stubOracleClose',
    },
    {
      label: 'Stub Oracle Create',
      initialValue: form.stubOracleCreate,
      type: InstructionInputType.SWITCH,
      name: 'stubOracleCreate',
    },
    {
      label: 'Stub Oracle Set',
      initialValue: form.stubOracleSet,
      type: InstructionInputType.SWITCH,
      name: 'stubOracleSet',
    },
    {
      label: 'Token Add Bank',
      initialValue: form.tokenAddBank,
      type: InstructionInputType.SWITCH,
      name: 'tokenAddBank',
    },
    {
      label: 'Token Deposit',
      initialValue: form.tokenDeposit,
      type: InstructionInputType.SWITCH,
      name: 'tokenDeposit',
    },
    {
      label: 'Token Deregister',
      initialValue: form.tokenDeregister,
      type: InstructionInputType.SWITCH,
      name: 'tokenDeregister',
    },
    {
      label: 'Token Edit',
      initialValue: form.tokenEdit,
      type: InstructionInputType.SWITCH,
      name: 'tokenEdit',
    },
    {
      label: 'Token Liq Bankruptcy',
      initialValue: form.tokenLiqBankruptcy,
      type: InstructionInputType.SWITCH,
      name: 'tokenLiqBankruptcy',
    },
    {
      label: 'Token Liq With Token',
      initialValue: form.tokenLiqWithToken,
      type: InstructionInputType.SWITCH,
      name: 'tokenLiqWithToken',
    },
    {
      label: 'Token Register',
      initialValue: form.tokenRegister,
      type: InstructionInputType.SWITCH,
      name: 'tokenRegister',
    },
    {
      label: 'Token Register Trustless',
      initialValue: form.tokenRegisterTrustless,
      type: InstructionInputType.SWITCH,
      name: 'tokenRegisterTrustless',
    },
    {
      label: 'Token Update Index And Rate',
      initialValue: form.tokenUpdateIndexAndRate,
      type: InstructionInputType.SWITCH,
      name: 'tokenUpdateIndexAndRate',
    },
    {
      label: 'Token Withdraw',
      initialValue: form.tokenWithdraw,
      type: InstructionInputType.SWITCH,
      name: 'tokenWithdraw',
    },
  ]

  return (
    <>
      {form && (
        <InstructionForm
          outerForm={form}
          setForm={setForm}
          inputs={inputs}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
        ></InstructionForm>
      )}
    </>
  )
}

export default IxGateSet
