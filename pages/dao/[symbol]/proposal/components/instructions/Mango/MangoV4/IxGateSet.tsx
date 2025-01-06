/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, { InstructionInput } from '../../FormCreator'
import { InstructionInputType } from '../../inputInstructionType'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import { buildIxGate } from '@blockworks-foundation/mango-v4'
import { IxGateParams } from '@blockworks-foundation/mango-v4/dist/types/src/clientIxParamBuilder'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useProgramSelector from '@components/Mango/useProgramSelector'
import ProgramSelector from '@components/Mango/ProgramSelector'

type IxGateSetForm = IxGateParams & {
  governedAccount: AssetAccount | null
  holdupTime: number
}

const IxGateSet = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletOnePointOh()
  const programSelectorHook = useProgramSelector()
  const { mangoClient, mangoGroup } = UseMangoV4(
    programSelectorHook.program?.val,
    programSelectorHook.program?.group
  )
  const { assetAccounts } = useGovernanceAssets()
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      ((mangoGroup?.admin &&
        x.extensions.transferAddress?.equals(mangoGroup.admin)) ||
        (mangoGroup?.securityAdmin &&
          x.extensions.transferAddress?.equals(mangoGroup.securityAdmin)))
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<IxGateSetForm>({
    governedAccount: null,
    holdupTime: 0,
    AccountClose: true,
    AccountCreate: true,
    AccountEdit: true,
    AccountExpand: true,
    AccountToggleFreeze: true,
    AltExtend: true,
    AltSet: true,
    FlashLoan: true,
    GroupClose: true,
    GroupCreate: true,
    GroupToggleHalt: true,
    HealthRegion: true,
    PerpCancelAllOrders: true,
    PerpCancelAllOrdersBySide: true,
    PerpCancelOrder: true,
    PerpCancelOrderByClientOrderId: true,
    PerpCloseMarket: true,
    PerpConsumeEvents: true,
    PerpCreateMarket: true,
    PerpDeactivatePosition: true,
    PerpEditMarket: true,
    PerpLiqBaseOrPositivePnl: true,
    PerpLiqForceCancelOrders: true,
    PerpLiqNegativePnlOrBankruptcy: true,
    PerpPlaceOrder: true,
    PerpSettleFees: true,
    PerpSettlePnl: true,
    PerpUpdateFunding: true,
    Serum3CancelAllOrders: true,
    Serum3CancelOrder: true,
    Serum3CloseOpenOrders: true,
    Serum3CreateOpenOrders: true,
    Serum3DeregisterMarket: true,
    Serum3EditMarket: true,
    Serum3LiqForceCancelOrders: true,
    Serum3PlaceOrder: true,
    Serum3RegisterMarket: true,
    Serum3SettleFunds: true,
    StubOracleClose: true,
    StubOracleCreate: true,
    StubOracleSet: true,
    TokenAddBank: true,
    TokenDeposit: true,
    TokenDeregister: true,
    TokenEdit: true,
    TokenLiqBankruptcy: true,
    TokenLiqWithToken: true,
    TokenRegister: true,
    TokenRegisterTrustless: true,
    TokenUpdateIndexAndRate: true,
    TokenWithdraw: true,
    AccountBuybackFeesWithMngo: true,
    TokenForceCloseBorrowsWithToken: true,
    PerpForceClosePosition: true,
    GroupWithdrawInsuranceFund: true,
    TokenConditionalSwapCreate: true,
    TokenConditionalSwapTrigger: true,
    TokenConditionalSwapCancel: true,
    OpenbookV2CancelOrder: true,
    OpenbookV2CloseOpenOrders: true,
    OpenbookV2CreateOpenOrders: true,
    OpenbookV2DeregisterMarket: true,
    OpenbookV2EditMarket: true,
    OpenbookV2LiqForceCancelOrders: true,
    OpenbookV2PlaceOrder: true,
    OpenbookV2PlaceTakeOrder: true,
    OpenbookV2RegisterMarket: true,
    OpenbookV2SettleFunds: true,
    AdminTokenWithdrawFees: true,
    AdminPerpWithdrawFees: true,
    AccountSizeMigration: true,
    TokenConditionalSwapStart: true,
    TokenConditionalSwapCreatePremiumAuction: true,
    TokenConditionalSwapCreateLinearAuction: true,
    Serum3PlaceOrderV2: true,
    TokenForceWithdraw: true,
    SequenceCheck: true,
    HealthCheck: true,
    GroupChangeInsuranceFund: true,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

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
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const ix = await mangoClient!.program.methods
        .ixGateSet(buildIxGate(form))
        .accounts({
          group: mangoGroup!.publicKey,
          admin: form.governedAccount.extensions.transferAddress,
        })
        .instruction()

      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdupTime,
    }
    return obj
  }

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
      options: solAccounts,
    },
    {
      label: 'Instruction hold up time (days)',
      initialValue: form.holdupTime,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'holdupTime',
    },
    {
      label: 'Account Close',
      initialValue: form.AccountClose,
      type: InstructionInputType.SWITCH,
      name: 'AccountClose',
    },
    {
      label: 'Account Create',
      initialValue: form.AccountCreate,
      type: InstructionInputType.SWITCH,
      name: 'AccountCreate',
    },
    {
      label: 'Account Edit',
      initialValue: form.AccountEdit,
      type: InstructionInputType.SWITCH,
      name: 'AccountEdit',
    },
    {
      label: 'Account Expand',
      initialValue: form.AccountExpand,
      type: InstructionInputType.SWITCH,
      name: 'AccountExpand',
    },
    {
      label: 'Account Toggle Freeze',
      initialValue: form.AccountToggleFreeze,
      type: InstructionInputType.SWITCH,
      name: 'AccountToggleFreeze',
    },
    {
      label: 'Alt Extend',
      initialValue: form.AltExtend,
      type: InstructionInputType.SWITCH,
      name: 'AltExtend',
    },
    {
      label: 'Alt Set',
      initialValue: form.AltSet,
      type: InstructionInputType.SWITCH,
      name: 'AltSet',
    },
    {
      label: 'Flash Loan',
      initialValue: form.FlashLoan,
      type: InstructionInputType.SWITCH,
      name: 'FlashLoan',
    },
    {
      label: 'Group Close',
      initialValue: form.GroupClose,
      type: InstructionInputType.SWITCH,
      name: 'GroupClose',
    },
    {
      label: 'Group Create',
      initialValue: form.GroupCreate,
      type: InstructionInputType.SWITCH,
      name: 'GroupCreate',
    },
    {
      label: 'Group Toggle Halt',
      initialValue: form.GroupToggleHalt,
      type: InstructionInputType.SWITCH,
      name: 'GroupToggleHalt',
    },
    {
      label: 'Health Region',
      initialValue: form.HealthRegion,
      type: InstructionInputType.SWITCH,
      name: 'HealthRegion',
    },
    {
      label: 'Perp Cancel All Orders',
      initialValue: form.PerpCancelAllOrders,
      type: InstructionInputType.SWITCH,
      name: 'PerpCancelAllOrders',
    },
    {
      label: 'Perp Cancel All Orders By Side',
      initialValue: form.PerpCancelAllOrdersBySide,
      type: InstructionInputType.SWITCH,
      name: 'PerpCancelAllOrdersBySide',
    },
    {
      label: 'Perp Cancel Order',
      initialValue: form.PerpCancelOrder,
      type: InstructionInputType.SWITCH,
      name: 'PerpCancelOrder',
    },
    {
      label: 'Perp Cancel Order By Client Order Id',
      initialValue: form.PerpCancelOrderByClientOrderId,
      type: InstructionInputType.SWITCH,
      name: 'PerpCancelOrderByClientOrderId',
    },
    {
      label: 'Perp Close Market',
      initialValue: form.PerpCloseMarket,
      type: InstructionInputType.SWITCH,
      name: 'PerpCloseMarket',
    },
    {
      label: 'Perp Consume Events',
      initialValue: form.PerpConsumeEvents,
      type: InstructionInputType.SWITCH,
      name: 'PerpConsumeEvents',
    },
    {
      label: 'Perp Create Market',
      initialValue: form.PerpCreateMarket,
      type: InstructionInputType.SWITCH,
      name: 'PerpCreateMarket',
    },
    {
      label: 'Perp Deactivate Position',
      initialValue: form.PerpDeactivatePosition,
      type: InstructionInputType.SWITCH,
      name: 'PerpDeactivatePosition',
    },
    {
      label: 'Perp Edit Market',
      initialValue: form.PerpEditMarket,
      type: InstructionInputType.SWITCH,
      name: 'PerpEditMarket',
    },
    {
      label: 'Perp Liq Base Or Positive Pnl',
      initialValue: form.PerpLiqBaseOrPositivePnl,
      type: InstructionInputType.SWITCH,
      name: 'PerpLiqBaseOrPositivePnl',
    },
    {
      label: 'Perp Liq Negative Pnl Or Bankruptcy',
      initialValue: form.PerpLiqNegativePnlOrBankruptcy,
      type: InstructionInputType.SWITCH,
      name: 'PerpLiqNegativePnlOrBankruptcy',
    },
    {
      label: 'Perp Liq Force Cancel Orders',
      initialValue: form.PerpLiqForceCancelOrders,
      type: InstructionInputType.SWITCH,
      name: 'PerpLiqForceCancelOrders',
    },
    {
      label: 'Perp Place Order',
      initialValue: form.PerpPlaceOrder,
      type: InstructionInputType.SWITCH,
      name: 'PerpPlaceOrder',
    },
    {
      label: 'Perp Settle Fees',
      initialValue: form.PerpSettleFees,
      type: InstructionInputType.SWITCH,
      name: 'PerpSettleFees',
    },
    {
      label: 'Perp Settle Pnl',
      initialValue: form.PerpSettlePnl,
      type: InstructionInputType.SWITCH,
      name: 'PerpSettlePnl',
    },
    {
      label: 'Perp Update Funding',
      initialValue: form.PerpUpdateFunding,
      type: InstructionInputType.SWITCH,
      name: 'PerpUpdateFunding',
    },
    {
      label: 'Serum 3 Cancel All Orders',
      initialValue: form.Serum3CancelAllOrders,
      type: InstructionInputType.SWITCH,
      name: 'Serum3CancelAllOrders',
    },
    {
      label: 'Serum 3 Cancel Order',
      initialValue: form.Serum3CancelOrder,
      type: InstructionInputType.SWITCH,
      name: 'Serum3CancelOrder',
    },
    {
      label: 'Serum 3 Close Open Orders',
      initialValue: form.Serum3CloseOpenOrders,
      type: InstructionInputType.SWITCH,
      name: 'Serum3CloseOpenOrders',
    },
    {
      label: 'Serum 3 Create Open Orders',
      initialValue: form.Serum3CreateOpenOrders,
      type: InstructionInputType.SWITCH,
      name: 'Serum3CreateOpenOrders',
    },
    {
      label: 'Serum 3 Deregister Market',
      initialValue: form.Serum3DeregisterMarket,
      type: InstructionInputType.SWITCH,
      name: 'Serum3DeregisterMarket',
    },
    {
      label: 'Serum 3 Edit Market',
      initialValue: form.Serum3EditMarket,
      type: InstructionInputType.SWITCH,
      name: 'Serum3EditMarket',
    },
    {
      label: 'Serum 3 Liq Force Cancel Orders',
      initialValue: form.Serum3LiqForceCancelOrders,
      type: InstructionInputType.SWITCH,
      name: 'Serum3LiqForceCancelOrders',
    },
    {
      label: 'Serum 3 Place Order',
      initialValue: form.Serum3PlaceOrder,
      type: InstructionInputType.SWITCH,
      name: 'Serum3PlaceOrder',
    },
    {
      label: 'Serum 3 Register Market',
      initialValue: form.Serum3RegisterMarket,
      type: InstructionInputType.SWITCH,
      name: 'Serum3RegisterMarket',
    },
    {
      label: 'Serum 3 Settle Funds',
      initialValue: form.Serum3SettleFunds,
      type: InstructionInputType.SWITCH,
      name: 'Serum3SettleFunds',
    },
    {
      label: 'Stub Oracle Close',
      initialValue: form.StubOracleClose,
      type: InstructionInputType.SWITCH,
      name: 'StubOracleClose',
    },
    {
      label: 'Stub Oracle Create',
      initialValue: form.StubOracleCreate,
      type: InstructionInputType.SWITCH,
      name: 'StubOracleCreate',
    },
    {
      label: 'Stub Oracle Set',
      initialValue: form.StubOracleSet,
      type: InstructionInputType.SWITCH,
      name: 'StubOracleSet',
    },
    {
      label: 'Token Add Bank',
      initialValue: form.TokenAddBank,
      type: InstructionInputType.SWITCH,
      name: 'TokenAddBank',
    },
    {
      label: 'Token Deposit',
      initialValue: form.TokenDeposit,
      type: InstructionInputType.SWITCH,
      name: 'TokenDeposit',
    },
    {
      label: 'Token Deregister',
      initialValue: form.TokenDeregister,
      type: InstructionInputType.SWITCH,
      name: 'TokenDeregister',
    },
    {
      label: 'Token Edit',
      initialValue: form.TokenEdit,
      type: InstructionInputType.SWITCH,
      name: 'TokenEdit',
    },
    {
      label: 'Token Liq Bankruptcy',
      initialValue: form.TokenLiqBankruptcy,
      type: InstructionInputType.SWITCH,
      name: 'TokenLiqBankruptcy',
    },
    {
      label: 'Token Liq With Token',
      initialValue: form.TokenLiqWithToken,
      type: InstructionInputType.SWITCH,
      name: 'TokenLiqWithToken',
    },
    {
      label: 'Token Register',
      initialValue: form.TokenRegister,
      type: InstructionInputType.SWITCH,
      name: 'TokenRegister',
    },
    {
      label: 'Token Register Trustless',
      initialValue: form.TokenRegisterTrustless,
      type: InstructionInputType.SWITCH,
      name: 'TokenRegisterTrustless',
    },
    {
      label: 'Token Update Index And Rate',
      initialValue: form.TokenUpdateIndexAndRate,
      type: InstructionInputType.SWITCH,
      name: 'TokenUpdateIndexAndRate',
    },
    {
      label: 'Token Withdraw',
      initialValue: form.TokenWithdraw,
      type: InstructionInputType.SWITCH,
      name: 'TokenWithdraw',
    },
    {
      label: 'Account Buyback Fees With Mngo',
      initialValue: form.AccountBuybackFeesWithMngo,
      type: InstructionInputType.SWITCH,
      name: 'AccountBuybackFeesWithMngo',
    },
    {
      label: 'Token Force Close Borrows With Token',
      initialValue: form.TokenForceCloseBorrowsWithToken,
      type: InstructionInputType.SWITCH,
      name: 'TokenForceCloseBorrowsWithToken',
    },
    {
      label: 'Perp Force Close Position',
      initialValue: form.PerpForceClosePosition,
      type: InstructionInputType.SWITCH,
      name: 'PerpForceClosePosition',
    },
    {
      label: 'Group Withdraw Insurance Fund',
      initialValue: form.GroupWithdrawInsuranceFund,
      type: InstructionInputType.SWITCH,
      name: 'GroupWithdrawInsuranceFund',
    },
    {
      label: 'Token Conditional Swap Create',
      initialValue: form.TokenConditionalSwapCreate,
      type: InstructionInputType.SWITCH,
      name: 'TokenConditionalSwapCreate',
    },
    {
      label: 'Token Conditional Swap Trigger',
      initialValue: form.TokenConditionalSwapTrigger,
      type: InstructionInputType.SWITCH,
      name: 'TokenConditionalSwapTrigger',
    },
    {
      label: 'Token Conditional Swap Cancel',
      initialValue: form.TokenConditionalSwapCancel,
      type: InstructionInputType.SWITCH,
      name: 'TokenConditionalSwapCancel',
    },
    {
      label: 'Openbook V2 Cancel Order',
      initialValue: form.OpenbookV2CancelOrder,
      type: InstructionInputType.SWITCH,
      name: 'OpenbookV2CancelOrder',
    },
    {
      label: 'Openbook V2 Close Open Orders',
      initialValue: form.OpenbookV2CloseOpenOrders,
      type: InstructionInputType.SWITCH,
      name: 'OpenbookV2CloseOpenOrders',
    },
    {
      label: 'Openbook V2 Create Open Orders',
      initialValue: form.OpenbookV2CreateOpenOrders,
      type: InstructionInputType.SWITCH,
      name: 'OpenbookV2CreateOpenOrders',
    },
    {
      label: 'Openbook V2 Deregister Market',
      initialValue: form.OpenbookV2DeregisterMarket,
      type: InstructionInputType.SWITCH,
      name: 'OpenbookV2DeregisterMarket',
    },
    {
      label: 'Openbook V2 Edit Market',
      initialValue: form.OpenbookV2EditMarket,
      type: InstructionInputType.SWITCH,
      name: 'OpenbookV2EditMarket',
    },
    {
      label: 'Openbook V2 Liq Force Cancel Orders',
      initialValue: form.OpenbookV2LiqForceCancelOrders,
      type: InstructionInputType.SWITCH,
      name: 'OpenbookV2LiqForceCancelOrders',
    },
    {
      label: 'Openbook V2 Place Order',
      initialValue: form.OpenbookV2PlaceOrder,
      type: InstructionInputType.SWITCH,
      name: 'OpenbookV2PlaceOrder',
    },
    {
      label: 'Openbook V2 Place Take Order',
      initialValue: form.OpenbookV2PlaceTakeOrder,
      type: InstructionInputType.SWITCH,
      name: 'OpenbookV2PlaceTakeOrder',
    },
    {
      label: 'Openbook V2 Register Market',
      initialValue: form.OpenbookV2RegisterMarket,
      type: InstructionInputType.SWITCH,
      name: 'OpenbookV2RegisterMarket',
    },
    {
      label: 'Openbook V2 Settle Funds',
      initialValue: form.OpenbookV2SettleFunds,
      type: InstructionInputType.SWITCH,
      name: 'OpenbookV2SettleFunds',
    },
    {
      label: 'Admin Token Withdraw Fees',
      initialValue: form.AdminTokenWithdrawFees,
      type: InstructionInputType.SWITCH,
      name: 'AdminTokenWithdrawFees',
    },
    {
      label: 'Admin Perp Withdraw Fees',
      initialValue: form.AdminPerpWithdrawFees,
      type: InstructionInputType.SWITCH,
      name: 'AdminPerpWithdrawFees',
    },
    {
      label: 'Account Size Migration',
      initialValue: form.AccountSizeMigration,
      type: InstructionInputType.SWITCH,
      name: 'AccountSizeMigration',
    },
    {
      label: 'Token Conditional Swap Start',
      initialValue: form.TokenConditionalSwapStart,
      type: InstructionInputType.SWITCH,
      name: 'TokenConditionalSwapStart',
    },
    {
      label: 'Token Conditional Swap Create Premium Auction',
      initialValue: form.TokenConditionalSwapCreatePremiumAuction,
      type: InstructionInputType.SWITCH,
      name: 'TokenConditionalSwapCreatePremiumAuction',
    },
    {
      label: 'Token Conditional Swap Create Linear Auction',
      initialValue: form.TokenConditionalSwapCreateLinearAuction,
      type: InstructionInputType.SWITCH,
      name: 'TokenConditionalSwapCreateLinearAuction',
    },
    {
      label: 'Serum 3 Place Order V2',
      initialValue: form.Serum3PlaceOrderV2,
      type: InstructionInputType.SWITCH,
      name: 'Serum3PlaceOrderV2',
    },
    {
      label: 'Token Force withdraw',
      initialValue: form.TokenForceWithdraw,
      type: InstructionInputType.SWITCH,
      name: 'TokenForceWithdraw',
    },
    {
      label: 'Sequence Check',
      initialValue: form.SequenceCheck,
      type: InstructionInputType.SWITCH,
      name: 'SequenceCheck',
    },
    {
      label: 'Health Check',
      initialValue: form.HealthCheck,
      type: InstructionInputType.SWITCH,
      name: 'HealthCheck',
    },
    {
      label: 'Group Change Insurance Fund',
      initialValue: form.GroupChangeInsuranceFund,
      type: InstructionInputType.SWITCH,
      name: 'GroupChangeInsuranceFund',
    },
  ]

  return (
    <>
      <ProgramSelector
        programSelectorHook={programSelectorHook}
      ></ProgramSelector>
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
