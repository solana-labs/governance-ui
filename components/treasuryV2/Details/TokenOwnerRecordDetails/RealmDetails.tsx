import useRealmProposals from '@hooks/useRealmProposals'
import { TokenOwnerRecordAsset } from '@models/treasury/Asset'
import { Governance, ProgramAccount, Realm } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import ProposalDetails from './ProposalDetails'

interface Props {
  className?: string
  currentGovernance?: ProgramAccount<Governance>
  tokenOwnerRecordAsset: TokenOwnerRecordAsset
  realmAccount: ProgramAccount<Realm>
  programId?: PublicKey | null
}
export default function RealmDetails(props: Props) {
  const { votingProposals, governances, voteRecords } = useRealmProposals(
    props.tokenOwnerRecordAsset,
    props.realmAccount.pubkey,
    props.programId
  )

  return (
    <div className="space-y-4">
      {votingProposals.map((p) => (
        <ProposalDetails
          key={p[0]}
          voteRecord={voteRecords[p[0]]}
          proposal={p[1]}
          realm={props.realmAccount}
          proposalGovernance={governances[p[1].account.governance.toBase58()]}
          currentGovernance={props.currentGovernance}
          tokenOwnerRecord={props.tokenOwnerRecordAsset.tokenOwnerRecordAccount}
          programId={props.programId}
        />
      ))}
      {votingProposals.length <= 0 && (
        <div className="w-full p-4 text-fgd-3 text-center">
          No proposals to vote on in this realm.
        </div>
      )}
    </div>
  )
}
