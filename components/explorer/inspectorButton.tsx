import { dryRunInstruction } from '../../actions/dryRunInstruction'
import {
  InstructionExecutionStatus,
  ProgramAccount,
  ProposalTransaction,
} from '@solana/spl-governance'
import useWalletStore from '../../stores/useWalletStore'
import { getExplorerInspectorUrl, getExplorerUrl } from './tools'
import { SecondaryButton } from '../Button'
import { notify } from '@utils/notifications'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import dayjs from 'dayjs'

export default function InspectorButton({
  proposalInstruction,
}: {
  proposalInstruction: ProgramAccount<ProposalTransaction>
}) {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const wasExecuted =
    proposalInstruction.account.executionStatus ===
    InstructionExecutionStatus.Success
  const executedAtFormatted = dayjs(
    proposalInstruction.account.executedAt!.toNumber() * 1000
  ).format('DD-MM-YYYY HH:mm')

  const showInspector = async () => {
    let inspectUrl = ''
    if (!wasExecuted) {
      const instructionData = proposalInstruction.account.getAllInstructions()
      const result = await dryRunInstruction(
        connection.current,
        wallet!,
        null,
        [],
        [...instructionData]
      )

      inspectUrl = await getExplorerInspectorUrl(connection, result.transaction)
    } else {
      try {
        const recentActivity = await connection.current.getConfirmedSignaturesForAddress2(
          proposalInstruction.pubkey,
          {
            limit: 5,
          },
          'confirmed'
        )
        inspectUrl = getExplorerUrl(
          connection.cluster,
          recentActivity[0].signature,
          'tx'
        )
      } catch (e) {
        console.log(e)
      }
    }
    if (inspectUrl) {
      window.open(inspectUrl, '_blank')
    } else {
      notify({ type: 'error', message: 'Something went wrong url not found' })
    }
  }

  return (
    <SecondaryButton
      small
      disabled={!connected && !wasExecuted}
      onClick={() => showInspector()}
    >
      {!wasExecuted
        ? 'Inspect'
        : `Execution date: ${executedAtFormatted} - View transaction`}
    </SecondaryButton>
  )
}
