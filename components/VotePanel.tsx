import { castVote } from '../actions/castVote'
import useRealm from '../hooks/useRealm'
import { RpcContext } from '../models/core/api'

import { Vote } from '../models/instructions'
import useWalletStore from '../stores/useWalletStore'
import Button from './Button'

const VotePanel = () => {
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { realm, ownTokenRecord } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)

  const submitVote = async (vote: Vote) => {
    const rpcContext = new RpcContext(
      proposal.account.owner,
      wallet,
      connection.current,
      connection.endpoint
    )
    try {
      await castVote(
        rpcContext,
        realm.pubkey,
        proposal,
        ownTokenRecord.pubkey,
        vote
      )
    } catch (ex) {
      console.error("Can't cast vote", ex)
    }
  }

  return (
    <div className="bg-bkg-2 p-6 rounded-md space-y-6">
      <h2 className="mb-4 text-center">Cast your vote</h2>
      <div className="flex items-center justify-center">
        <Button className="mx-2 w-44" onClick={() => submitVote(Vote.Yes)}>
          Approve
        </Button>
        <Button className="mx-2 w-44" onClick={() => submitVote(Vote.No)}>
          Deny
        </Button>
      </div>
    </div>
  )
}

export default VotePanel
