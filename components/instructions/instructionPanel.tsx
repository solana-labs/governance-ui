import useProposal from '../../hooks/useProposal'
import InstructionCard from './instructionCard'

export function InstructionPanel() {
  const { instructions } = useProposal()

  return (
    <div>
      <div>Instructions</div>
      <div>
        {Object.values(instructions).map((pi, idx) => (
          <div key={pi.pubkey.toBase58()}>
            <InstructionCard
              index={idx + 1}
              proposalInstruction={pi.info}
            ></InstructionCard>
          </div>
        ))}
      </div>
    </div>
  )
}
