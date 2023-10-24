import * as yup from 'yup'
import { Governance, ProgramAccount, Realm } from '@solana/spl-governance'
import { AssetAccount } from '@utils/uiTypes/assets'
import { InstructionInput } from 'pages/dao/[symbol]/proposal/components/instructions/FormCreator'
import { InstructionInputType } from 'pages/dao/[symbol]/proposal/components/instructions/inputInstructionType'
import { PublicKey } from '@solana/web3.js'

export const SchemaComponents = {
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

export const instructionInputs: Record<string, InstructionInput> = {
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

export function getPoolPubkeyFromName(name: string): PublicKey {
  return ({
    'CASH MANAGEMENT POOL': new PublicKey(
      '7Vqn5fdwckZadYVoH312aErP8PqNGNUx8WDrvKAHYfMd'
    ),
  } as {
    [key in PoolName]: PublicKey
  })[name]
}
