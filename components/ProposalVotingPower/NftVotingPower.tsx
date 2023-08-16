/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import classNames from 'classnames'
import { BigNumber } from 'bignumber.js'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  SYSTEM_PROGRAM_ID,
  withCreateTokenOwnerRecord,
} from '@solana/spl-governance'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'

import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useRealm from '@hooks/useRealm'
import Button from '@components/Button'
import { getVoterWeightRecord } from '@utils/plugin/accounts'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { sendTransaction } from '@utils/send'

import VotingPowerPct from './VotingPowerPct'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

interface Props {
  className?: string
  inAccountDetails?: boolean
  children?: React.ReactNode
}

export default function NftVotingPower(props: Props) {
  const nfts = useNftPluginStore((s) => s.state.votingNfts)
  const votingPower = useNftPluginStore((s) => s.state.votingPower)
  const maxWeight = useNftPluginStore((s) => s.state.maxVoteRecord)
  const isLoading = useNftPluginStore((s) => s.state.isLoadingNfts)
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const connection = useLegacyConnectionContext()
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const { realmInfo } = useRealm()
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
    if (!realm || !wallet?.publicKey || !client.client || !realmInfo)
      throw new Error()
    const instructions: TransactionInstruction[] = []
    const { voterWeightPk } = await getVoterWeightRecord(
      realm.pubkey,
      realm.account.communityMint,
      wallet.publicKey,
      client.client.program.programId
    )
    const createVoterWeightRecordIx = await (client.client as NftVoterClient).program.methods
      .createVoterWeightRecord(wallet.publicKey)
      .accounts({
        voterWeightRecord: voterWeightPk,
        governanceProgramId: realm.owner,
        realm: realm.pubkey,
        realmGoverningTokenMint: realm.account.communityMint,
        payer: wallet.publicKey,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .instruction()
    instructions.push(createVoterWeightRecordIx)
    await withCreateTokenOwnerRecord(
      instructions,
      realm.owner,
      realmInfo.programVersion!,
      realm.pubkey,
      wallet.publicKey,
      realm.account.communityMint,
      wallet.publicKey
    )
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      transaction: transaction,
      wallet: wallet,
      connection: connection.current,
      signers: [],
      sendingMessage: `Registering`,
      successMessage: `Registered`,
    })
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
      <Wrapper inAccountDetails={props.inAccountDetails}>
        <div
          className={classNames(props.className, 'text-xs', 'text-white/50')}
        >
          You do not have any voting power in this dao.
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper inAccountDetails={props.inAccountDetails}>
      <div className={props.className}>
        <div className={classNames('p-3', 'rounded-md', 'bg-bkg-1')}>
          <div className="text-white/50 text-xs">My NFT Votes</div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-white flex items-center gap-1">
              {displayNfts.slice(0, 3).map((nft, index) => (
                <div
                  className="h-12 w-12 rounded-sm bg-bkg-2 bg-cover"
                  key={nft.content.metadata.name + index}
                  style={{
                    backgroundImage: `url("${nft.content.links.image}")`,
                  }}
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
    </Wrapper>
  )
}

const Wrapper = (props: Props) => {
  if (props.inAccountDetails) {
    return <div className="my-4 space-y-4 w-1/2">{props.children}</div>
  } else {
    return <>{props.children}</>
  }
}
