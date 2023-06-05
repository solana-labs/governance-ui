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

/** @deprecated this needs to be rewritten */
export default function useProposalTransactions(
  allTransactions: ProgramAccount<ProposalTransaction>[] = [],
  proposal?: ProgramAccount<Proposal>
) {
  const [executed, setExecuted] = useState<
    ProgramAccount<ProposalTransaction>[]
  >([])
  const [ready, setReady] = useState<ProgramAccount<ProposalTransaction>[]>([])
  const [notReady, setNotReady] = useState<
    ProgramAccount<ProposalTransaction>[]
  >([])

  const [nextExecuteAt, setNextExecuteAt] = useState<number | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (allTransactions.length !== executed.length) {
      interval = setInterval(() => {
        if (!proposal) return

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
  }, [allTransactions, executed, proposal])

  if (!proposal) return null

  return {
    executed,
    ready,
    notReady,
    nextExecuteAt,
  }
}
