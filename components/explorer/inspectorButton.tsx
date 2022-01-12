import { dryRunInstruction } from '../../actions/dryRunInstruction'
import { InstructionData } from '@solana/spl-governance'
import useWalletStore from '../../stores/useWalletStore'
import { getExplorerInspectorUrl } from './tools'
import { SecondaryButton } from '../Button'

export default function InspectorButton({
  instructionData,
}: {
  instructionData: InstructionData
}) {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)

  const showInspector = async () => {
    const result = await dryRunInstruction(
      connection.current,
      wallet!,
      instructionData
    )

    const inspectUrl = getExplorerInspectorUrl(
      connection.endpoint,
      result.transaction
    )

    window.open(inspectUrl, '_blank')
  }

  return (
    <SecondaryButton
      small
      disabled={!connected}
      onClick={() => showInspector()}
    >
      Inspect
    </SecondaryButton>
  )
}
