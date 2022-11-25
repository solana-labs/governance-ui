import {
  ProgramAccount,
  Proposal,
  ProposalTransaction,
} from '@solana/spl-governance'
import { useEffect, useState } from 'react'

function parseTransactions(
  transactions: ProgramAccount<ProposalTransaction>[],
  proposal: ProgramAccount<Proposal>
) {
  const executed: ProgramAccount<ProposalTransaction>[] = []
  const ready: ProgramAccount<ProposalTransaction>[] = []
  const notReady: ProgramAccount<ProposalTransaction>[] = []

  let nextExecuteAt: number | null = null

  for (const transaction of transactions) {
    const holdUpTime = transaction.account.holdUpTime

    // already executed
    if (transaction.account.executedAt) {
      executed.push(transaction)
    }
    // doesn't have a hold up time
    else if (!holdUpTime || holdUpTime <= 0) {
      ready.push(transaction)
    }
    // has a hold up time, so check if it's ready
    else {
      const votingCompletedAt = proposal.account.votingCompletedAt
      if (votingCompletedAt) {
        const canExecuteAt = votingCompletedAt.toNumber() + holdUpTime
        const now = new Date().getTime() / 1000 // unix timestamp in seconds

        // ready to execute
        if (now > canExecuteAt) {
          ready.push(transaction)
        }
        // not ready to execute
        else {
          notReady.push(transaction)
          // find the soonest transaction to execute
          if (!nextExecuteAt || canExecuteAt < nextExecuteAt)
            nextExecuteAt = canExecuteAt
        }
      }
    }
  }

  return {
    executed,
    // Order instructions by instruction index
    ready: ready.sort(
      (a, b) => a.account.instructionIndex - b.account.instructionIndex
    ),
    notReady,
    nextExecuteAt,
  }
}

export default function useProposalTransactions(
  allTransactions: ProgramAccount<ProposalTransaction>[],
  proposal?: ProgramAccount<Proposal>
) {
  if (!proposal) return null

  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const [executed, setExecuted] = useState<
    ProgramAccount<ProposalTransaction>[]
  >([])
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const [ready, setReady] = useState<ProgramAccount<ProposalTransaction>[]>([])
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const [notReady, setNotReady] = useState<
    ProgramAccount<ProposalTransaction>[]
  >([])

  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const [nextExecuteAt, setNextExecuteAt] = useState<number | null>(null)

  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (allTransactions.length !== executed.length) {
      interval = setInterval(() => {
        const { executed, ready, notReady, nextExecuteAt } = parseTransactions(
          allTransactions,
          proposal
        )
        setExecuted(executed)
        setReady(ready)
        setNotReady(notReady)
        setNextExecuteAt(nextExecuteAt)
      }, 1000)
    } else {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [executed])

  return {
    executed,
    ready,
    notReady,
    nextExecuteAt,
  }
}
