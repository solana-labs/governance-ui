import { Proposal, ProposalTransaction } from '@solana/spl-governance'
import React, { useState } from 'react'
import { ExecuteInstructionButton, PlayState } from './ExecuteInstructionButton'
import { ProgramAccount } from '@solana/spl-governance'
import InspectorButton from '@components/explorer/inspectorButton'
import { FlagInstructionErrorButton } from './FlagInstructionErrorButton'

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
  const instructions = proposalTransaction.account.getAllInstructions()

  const [playing, setPlaying] = useState(
    proposalTransaction.account.executedAt
      ? PlayState.Played
      : PlayState.Unplayed
  )

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
            />
          </React.Fragment>
        )}
      </div>
    </div>
  )
}
