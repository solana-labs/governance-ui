import { PublicKey } from '@solana/web3.js'
import { AccountMetaData, ProposalInstruction } from '../../models/accounts'
import { getAccountName, getProgramName } from './tools'

export default function InstructionCard({
  index,
  proposalInstruction,
}: {
  index: number
  proposalInstruction: ProposalInstruction
}) {
  return (
    <div>
      <div>{`Instruction #${index}`}</div>
      <InstructionProgram
        programId={proposalInstruction.instruction.programId}
      ></InstructionProgram>
      {proposalInstruction.instruction.accounts.map((am, idx) => (
        <InstructionAccount key={idx} index={idx} accountMeta={am} />
      ))}
      <InstructionData
        data={proposalInstruction.instruction.data}
      ></InstructionData>
    </div>
  )
}

export function InstructionProgram({ programId }: { programId: PublicKey }) {
  const programLabel = getProgramName(programId)
  return (
    <div>
      <div>ProgramID:</div>
      <div>
        <span> {programId.toBase58()}</span>
        {programLabel && <span>{` (${programLabel})`}</span>}
      </div>
    </div>
  )
}

export function InstructionAccount({
  index,
  accountMeta,
}: {
  index: number
  accountMeta: AccountMetaData
}) {
  const accountLabel = getAccountName(accountMeta.pubkey)

  return (
    <div>
      <span>{`Account #${index}`}</span>
      <span> {accountMeta.pubkey.toBase58()}</span>
      {accountLabel && <span>{` (${accountLabel})`}</span>}
    </div>
  )
}

export function InstructionData({ data }: { data: Uint8Array }) {
  return (
    <div>
      <span>Data:</span>
      <span> {JSON.stringify(data)}</span>
    </div>
  )
}
