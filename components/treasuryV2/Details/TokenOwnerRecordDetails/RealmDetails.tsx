import { PublicKey } from '@solana/web3.js'
import ProposalDetails from './ProposalDetails'
import { useTokenOwnerRecordByPubkeyQuery } from '@hooks/queries/tokenOwnerRecord'
import { useARealmProposalsQuery } from '@hooks/queries/proposal'
import { ProposalState } from '@solana/spl-governance'

interface Props {
  governance: PublicKey
  tokenOwnerRecord: PublicKey
}
export default function RealmDetails({ tokenOwnerRecord, governance }: Props) {
  const tor = useTokenOwnerRecordByPubkeyQuery(tokenOwnerRecord).data?.result

  const { data: proposals } = useARealmProposalsQuery(tor?.account.realm)
  const votingProposals = proposals?.filter(
    (x) => x.account.state === ProposalState.Voting
  )

  return tor === undefined || votingProposals === undefined ? null : (
    <div className="space-y-4">
      {votingProposals.map((p) => (
        <ProposalDetails
          key={p.pubkey.toString()}
          proposal={p}
          realmPk={tor.account.realm}
          owningGovernancePk={governance}
          tokenOwnerRecordPk={tokenOwnerRecord}
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
