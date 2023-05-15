import { Proposal, ProposalTransaction } from '@solana/spl-governance'
import { ALL_CASTLE_PROGRAMS } from './tools'
import React, { useState } from 'react'
import { ExecuteInstructionButton, PlayState } from './ExecuteInstructionButton'
import { ProgramAccount } from '@solana/spl-governance'
import InspectorButton from '@components/explorer/inspectorButton'
import { FlagInstructionErrorButton } from './FlagInstructionErrorButton'
import InstructionOptionInput, {
  InstructionOption,
  InstructionOptions,
} from '@components/InstructionOptions'
import TransactionInstructionCard from './TransactionInstructionCard'

export default function TransactionCard({
  index,
  proposal,
  proposalTransaction,
}: {
  index: number
  proposal: ProgramAccount<Proposal>
  proposalTransaction: ProgramAccount<ProposalTransaction>
}) {
  const [instructionOption, setInstructionOption] = useState<InstructionOption>(
    InstructionOptions.none
  )
  const instructions = proposalTransaction.account.getAllInstructions()

  const [playing, setPlaying] = useState(
    proposalTransaction.account.executedAt
      ? PlayState.Played
      : PlayState.Unplayed
  )

  const allProposalPrograms = proposalTransaction.account.instructions
    ?.map((i) => i.programId.toBase58())
    .flat()

  return (
    <div className="break-all">
      <h3 className="mb-4 flex">{`Transaction ${index} `}</h3>
      {instructions.map((x, idx) => (
        <TransactionInstructionCard
          key={idx}
          index={idx}
          instructionData={x}
        ></TransactionInstructionCard>
      ))}
      <div className="flex justify-end items-center gap-x-4 mt-6 mb-8">
        <InspectorButton proposalInstruction={proposalTransaction} />

        <FlagInstructionErrorButton
          playState={playing}
          proposal={proposal}
          proposalInstruction={proposalTransaction}
        />

        {proposal && (
          <React.Fragment>
            <ExecuteInstructionButton
              proposal={proposal}
              proposalInstruction={proposalTransaction}
              playing={playing}
              setPlaying={setPlaying}
              instructionOption={instructionOption}
            />
            {/* Show execution option if the proposal contains a specified program id and
                proposal has not executed already. */}
            {allProposalPrograms?.filter((a) =>
              ALL_CASTLE_PROGRAMS.map((a) => a.toBase58()).includes(a)
            ).length > 0 &&
              playing != PlayState.Played && (
                <InstructionOptionInput
                  value={instructionOption}
                  setValue={setInstructionOption}
                />
              )}
          </React.Fragment>
        )}
      </div>
    </div>
  )
}
