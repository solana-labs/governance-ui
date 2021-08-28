import { PublicKey } from '@solana/web3.js'
import { AccountMetaData, ProposalInstruction } from '../../models/accounts'
import {
  getAccountName,
  getInstructionDescriptor,
  getProgramName,
  InstructionDescriptor,
} from './tools'

export default function InstructionCard({
  index,
  proposalInstruction,
}: {
  index: number
  proposalInstruction: ProposalInstruction
}) {
  const instructionId = proposalInstruction.instruction.data[0]
  const descriptor = getInstructionDescriptor(
    proposalInstruction.instruction.programId,
    instructionId
  )

  return (
    <div>
      <div>
        <span>{`Instruction #${index}`}</span>
        {descriptor && <span>{` (${descriptor.name})`}</span>}
      </div>
      <InstructionProgram
        programId={proposalInstruction.instruction.programId}
      ></InstructionProgram>
      <div>Accounts:</div>
      {proposalInstruction.instruction.accounts.map((am, idx) => (
        <InstructionAccount
          key={idx}
          index={idx}
          accountMeta={am}
          descriptor={descriptor}
        />
      ))}
      <div>Data:</div>
      <InstructionData
        data={proposalInstruction.instruction.data}
        descriptor={descriptor}
        accounts={proposalInstruction.instruction.accounts}
      ></InstructionData>
    </div>
  )
}

export function InstructionProgram({ programId }: { programId: PublicKey }) {
  const programLabel = getProgramName(programId)
  return (
    <div>
      <div>
        <span>ProgramID:</span>
        <span> {programId.toBase58()}</span>
        {programLabel && <span>{` (${programLabel})`}</span>}
      </div>
    </div>
  )
}

export function InstructionAccount({
  index,
  accountMeta,
  descriptor,
}: {
  index: number
  accountMeta: AccountMetaData
  descriptor: InstructionDescriptor | undefined
}) {
  const accountLabel = getAccountName(accountMeta.pubkey)

  return (
    <div>
      <span>{`Account #${index}`}</span>
      {descriptor && <span>{` (${descriptor.accounts[index].name})`}</span>}
      <span> {accountMeta.pubkey.toBase58()}</span>
      {accountLabel && <span>{` (${accountLabel})`}</span>}
    </div>
  )
}

export function InstructionData({
  data,
  descriptor,
  accounts,
}: {
  data: Uint8Array
  descriptor: InstructionDescriptor | undefined
  accounts: AccountMetaData[]
}) {
  const getDataUI =
    descriptor?.getDataUI ?? ((data, _accounts) => <>{JSON.stringify(data)}</>)

  return (
    <div>
      <span> {getDataUI(data, accounts)}</span>
    </div>
  )
}
