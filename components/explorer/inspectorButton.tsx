import { dryRunInstruction } from '../../actions/dryRunInstruction'
import { InstructionData } from '../../models/accounts'
import useWalletStore from '../../stores/useWalletStore'
import { getExplorerInspectorUrl } from './tools'

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
      wallet,
      instructionData
    )

    const inspectUrl = getExplorerInspectorUrl(
      connection.endpoint,
      result.transaction
    )

    window.open(inspectUrl, '_blank')
  }

  return (
    <button
      disabled={!connected}
      className={`border border-fgd-4 default-transition font-normal pl-3 pr-2 py-2.5 rounded-md text-fgd-1 text-sm hover:bg-bkg-3 focus:outline-none`}
      onClick={() => showInspector()}
    >
      Inspect
    </button>
  )
}
