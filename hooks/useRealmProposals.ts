import { HIDDEN_PROPOSALS } from '@components/instructions/tools'
import {
  getGovernanceAccount,
  getGovernanceAccounts,
  getVoteRecordAddress,
  Governance,
  ProgramAccount,
  Proposal,
  pubkeyFilter,
  VoteRecord,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { accountsToPubkeyMap } from '@tools/sdk/accounts'
import { filterProposals } from '@utils/proposals'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { Filters } from '@components/ProposalFilter'
import { TokenOwnerRecordAsset } from '@models/treasury/Asset'
import { arrayToRecord } from '@tools/core/script'
import { InitialSorting } from '@components/ProposalSorting'
import useRealm from './useRealm'

const VotingFilter: Filters = {
  Cancelled: false,
  Completed: false,
  Defeated: false,
  Draft: false,
  Executable: false,
  ExecutingWithErrors: false,
  SigningOff: false,
  Voting: true,
  Vetoed: false,
  withoutQuorum: false,
}

export default function useRealmProposals(
  tokenOwnerRecordAsset: TokenOwnerRecordAsset,
  realmId: PublicKey,
  programId?: PublicKey | null
) {
  const router = useRouter()
  const { cluster } = router.query
  const { realm, mint, councilMint } = useRealm()
  //Small hack to prevent race conditions with cluster change until we remove connection from store and move it to global dep.
  const routeHasClusterInPath = router.asPath.includes('cluster')

  const connection = useWalletStore((s) => s.connection)

  const [governances, setGovernances] = useState<
    Record<string, ProgramAccount<Governance>>
  >({})
  const [allProposals, setAllProposals] = useState<
    [string, ProgramAccount<Proposal>][]
  >([])

  const [votingProposals, setVotingProposals] = useState<
    [string, ProgramAccount<Proposal>][]
  >([])

  const [voteRecords, setVoteRecords] = useState<
    Record<string, ProgramAccount<VoteRecord> | undefined>
  >({})

  useEffect(() => {
    let active = true
    fetchProposals()
    return () => {
      active = false
    }

    async function fetchProposals() {
      setGovernances({})
      setAllProposals([])
      setVotingProposals([])
      setVoteRecords({})
      if (
        connection &&
        ((routeHasClusterInPath && cluster) || !routeHasClusterInPath) &&
        programId
      ) {
        console.log('[serum_gov]: fetching realm proposals')

        const governances = await getGovernanceAccounts(
          connection.current,
          programId,
          Governance,
          [pubkeyFilter(1, realmId)!]
        )
        const proposalsByGovernance = await Promise.all(
          governances.map((g) =>
            getGovernanceAccounts(connection.current, programId, Proposal, [
              pubkeyFilter(1, g.pubkey)!,
              pubkeyFilter(33, tokenOwnerRecordAsset.communityMint.publicKey)!,
            ])
          )
        )
        const proposals = accountsToPubkeyMap(
          proposalsByGovernance
            .flatMap((p) => p)
            .filter((p) => !HIDDEN_PROPOSALS.has(p.pubkey.toBase58()))
        )

        // VoteRecords mapped by proposal
        const voteRecords = arrayToRecord(
          (await Promise.all(
            proposalsByGovernance
              .flatMap((p) => p)
              .map(async (p) => {
                const voteRecordAddress = await getVoteRecordAddress(
                  programId,
                  p.pubkey,
                  tokenOwnerRecordAsset.address
                )
                try {
                  const voteRecordAccount = await getGovernanceAccount(
                    connection.current,
                    voteRecordAddress,
                    VoteRecord
                  )
                  return voteRecordAccount
                } catch (e) {
                  console.error('Unable to fetch vote record: ', e)
                  return null
                }
              })
          ).then((records) =>
            records.filter((r) => r !== null)
          )) as ProgramAccount<VoteRecord>[],
          (record) => record.account.proposal.toBase58()
        )

        const votingProposals = filterProposals(
          Object.entries(proposals),
          VotingFilter,
          InitialSorting,
          realm,
          accountsToPubkeyMap(governances),
          mint,
          councilMint
        )

        if (!active) return

        setGovernances(accountsToPubkeyMap(governances))
        setAllProposals(Object.entries(proposals))
        setVotingProposals(votingProposals)
        setVoteRecords(voteRecords)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [connection.current.rpcEndpoint, realmId.toBase58()])

  return { governances, allProposals, votingProposals, voteRecords }
}
