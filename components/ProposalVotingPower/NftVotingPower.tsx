import classNames from 'classnames'
import { BigNumber } from 'bignumber.js'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  SYSTEM_PROGRAM_ID,
  withCreateTokenOwnerRecord,
} from '@solana/spl-governance'
import { NftVoterClient } from '@solana/governance-program-library'

import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import Button from '@components/Button'
import { getVoterWeightRecord } from '@utils/plugin/accounts'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { sendTransaction } from '@utils/send'

import VotingPowerPct from './VotingPowerPct'

interface Props {
  className?: string
}

export default function NftVotingPower(props: Props) {
  const nfts = useNftPluginStore((s) => s.state.votingNfts)
  const votingPower = useNftPluginStore((s) => s.state.votingPower)
  const maxWeight = useNftPluginStore((s) => s.state.maxVoteRecord)
  const isLoading = useNftPluginStore((s) => s.state.isLoadingNfts)
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const fetchRealm = useWalletStore((s) => s.actions.fetchRealm)
  const { ownTokenRecord, realm } = useRealm()
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )

  const displayNfts = nfts.slice(0, 3)
  const remainingCount = Math.max(nfts.length - 3, 0)
  const max = maxWeight
    ? new BigNumber(maxWeight.account.maxVoterWeight.toString())
    : null
  const amount = new BigNumber(votingPower.toString())

  const handleRegister = async () => {
    const instructions: TransactionInstruction[] = []
    const { voterWeightPk } = await getVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      wallet!.publicKey!,
      client.client!.program.programId
    )
    const createVoterWeightRecordIx = await (client.client as NftVoterClient).program.methods
      .createVoterWeightRecord(wallet!.publicKey!)
      .accounts({
        voterWeightRecord: voterWeightPk,
        governanceProgramId: realm!.owner,
        realm: realm!.pubkey,
        realmGoverningTokenMint: realm!.account.communityMint,
        payer: wallet!.publicKey!,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .instruction()
    instructions.push(createVoterWeightRecordIx)
    await withCreateTokenOwnerRecord(
      instructions,
      realm!.owner!,
      realm!.pubkey,
      wallet!.publicKey!,
      realm!.account.communityMint,
      wallet!.publicKey!
    )
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      transaction: transaction,
      wallet: wallet!,
      connection: connection.current,
      signers: [],
      sendingMessage: `Registering`,
      successMessage: `Registered`,
    })
    await fetchRealm(realm?.owner, realm?.pubkey)
  }

  if (isLoading) {
    return (
      <div
        className={classNames(props.className, 'rounded-md bg-bkg-1 h-[76px]')}
      />
    )
  }

  if (nfts.length === 0) {
    return (
      <div className={classNames(props.className, 'text-xs', 'text-white/50')}>
        You do not have any voting power in this realm.
      </div>
    )
  }

  return (
    <div className={props.className}>
      <div className={classNames('p-3', 'rounded-md', 'bg-bkg-1')}>
        <div className="text-white/50 text-xs">My NFT Votes</div>
        <div className="flex items-center justify-between mt-1">
          <div className="text-white flex items-center gap-1">
            {displayNfts.slice(0, 3).map((nft, index) => (
              <div
                className="h-12 w-12 rounded-sm bg-bkg-2 bg-cover"
                key={nft.mintAddress + index}
                style={{ backgroundImage: `url("${nft.image}")` }}
              />
            ))}
            {!!remainingCount && (
              <div className="text-sm text-white ml-2">
                +{remainingCount} more
              </div>
            )}
          </div>
          {max && !max.isZero() && (
            <VotingPowerPct amount={amount} total={max} />
          )}
        </div>
      </div>
      {connected && !ownTokenRecord && (
        <Button className="w-full mt-3" onClick={handleRegister}>
          Join
        </Button>
      )}
    </div>
  )
}
