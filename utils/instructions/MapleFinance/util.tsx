import * as yup from 'yup'
import { Governance, ProgramAccount, Realm } from '@solana/spl-governance'
import { AssetAccount } from '@utils/uiTypes/assets'
import { InstructionInput } from 'pages/dao/[symbol]/proposal/components/instructions/FormCreator'
import { InstructionInputType } from 'pages/dao/[symbol]/proposal/components/instructions/inputInstructionType'
import { PublicKey } from '@solana/web3.js'

export const governanceInstructionInput = (
  realm: ProgramAccount<Realm> | undefined,
  governance: ProgramAccount<Governance> | undefined,
  assetAccounts: AssetAccount[],
  shouldBeGoverned: false | ProgramAccount<Governance> | null
): InstructionInput => ({
  label: 'Wallet',
  initialValue: null,
  name: 'governedAccount',
  type: InstructionInputType.GOVERNED_ACCOUNT,
  shouldBeGoverned: !!shouldBeGoverned,
  governance,
  options: assetAccounts.filter((x) => x.governance.nativeTreasuryAddress),
})

const poolName = ['CASH MANAGEMENT POOL'] as const

export type PoolName = typeof poolName[number]

export function getPoolPubkeyFromName(name: string): PublicKey {
  return ({
    'CASH MANAGEMENT POOL': new PublicKey(
      '7Vqn5fdwckZadYVoH312aErP8PqNGNUx8WDrvKAHYfMd'
    ),
  } as {
    [key in PoolName]: PublicKey
  })[name]
}

export const LendingDepositSchemaComponents = {
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  depositAmount: yup.number().required('depositAmount is required'),
  poolName: yup.object().shape({
    name: yup.string().required('Pool name is required'),
    value: yup.string().required('Pool name is required'),
  }),
}

export const lendingDepositInstructionInputs: Record<
  string,
  InstructionInput
> = {
  depositAmount: {
    label: 'Deposit Amount',
    initialValue: 0,
    inputType: 'number',
    name: 'depositAmount',
    type: InstructionInputType.INPUT,
  },
  poolName: {
    label: 'Pool Name',
    name: 'poolName',
    type: InstructionInputType.SELECT,
    initialValue: 'CASH MANAGEMENT POOL',
    options: [{ value: 0, name: 'CASH MANAGEMENT POOL' }],
  },
}

export const WithdrawRequestInitializeSchemaComponents = {
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  sharesAmount: yup.number().required('sharesAmount is required'),
  poolName: yup.object().shape({
    name: yup.string().required('Pool name is required'),
    value: yup.string().required('Pool name is required'),
  }),
}

export const withdrawRequestInitializeInstructionInputs: Record<
  string,
  InstructionInput
> = {
  poolName: {
    label: 'Pool Name',
    name: 'poolName',
    type: InstructionInputType.SELECT,
    initialValue: 'CASH MANAGEMENT POOL',
    options: [{ value: 0, name: 'CASH MANAGEMENT POOL' }],
  },
  sharesAmount: {
    label: 'Shares Amount',
    initialValue: 0,
    inputType: 'number',
    name: 'sharesAmount',
    type: InstructionInputType.INPUT,
  },
}

export const WithdrawRequestExecuteSchemaComponents = {
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.object().shape({
    name: yup.string().required('Pool name is required'),
    value: yup.string().required('Pool name is required'),
  }),
  withdrawalRequest: yup.string().required('withdrawalRequest is required'),
}

export const withdrawRequestExecuteInstructionInputs: Record<
  string,
  InstructionInput
> = {
  poolName: {
    label: 'Pool Name',
    name: 'poolName',
    type: InstructionInputType.SELECT,
    initialValue: 'CASH MANAGEMENT POOL',
    options: [{ value: 0, name: 'CASH MANAGEMENT POOL' }],
  },
  withdrawalRequest: {
    label: 'Withdrawal Request (Pubkey)',
    initialValue: '',
    inputType: 'string',
    name: 'withdrawalRequest',
    type: InstructionInputType.INPUT,
  },
}
