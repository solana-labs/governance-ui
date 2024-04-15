/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import classNames from 'classnames'
import { BigNumber } from 'bignumber.js'
import { Transaction } from '@solana/web3.js'
import Button from '@components/Button'
import { sendTransaction } from '@utils/send'

import VotingPowerPct from './VotingPowerPct'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import useUserOrDelegator from '@hooks/useUserOrDelegator'
import { useConnection } from '@solana/wallet-adapter-react'
import { useVotingNfts } from '@hooks/queries/plugins/nftVoter'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import {useJoinRealm} from "@hooks/useJoinRealm";

interface Props {
  className?: string
  inAccountDetails?: boolean
  children?: React.ReactNode
}

const Join = () => {
  const { connection } = useConnection()
  const actingAsWalletPk = useUserOrDelegator()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const realm = useRealmQuery().data?.result
  const { userNeedsTokenOwnerRecord, userNeedsVoterWeightRecords, handleRegister } = useJoinRealm();

  const join = async () => {
    if (!realm || !wallet?.publicKey) throw new Error()

    const instructions = await handleRegister();
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      transaction,
      wallet: wallet,
      connection: connection,
      signers: [],
      sendingMessage: `Registering`,
      successMessage: `Registered`,
    })
  }

  return (
    (actingAsWalletPk?.toString() === wallet?.publicKey?.toString() &&
      connected &&
        (userNeedsTokenOwnerRecord || userNeedsVoterWeightRecords) && (
        <Button className="w-full mt-3" onClick={join}>
          Join
        </Button>
      )) ||
    null
  )
}

export default function NftVotingPower(props: Props) {
  const userPk = useUserOrDelegator()
  const nfts = useVotingNfts(userPk)

  const { isReady, totalCalculatedVoterWeight, calculatedMaxVoterWeight } = useRealmVoterWeightPlugins(
    'community',
  )

  const displayNfts = (nfts ?? []).slice(0, 3)
  const remainingCount = Math.max((nfts ?? []).length - 3, 0)
  const max = calculatedMaxVoterWeight?.value
    ? new BigNumber(calculatedMaxVoterWeight.value.toString())
    : null
  const amount = new BigNumber((totalCalculatedVoterWeight?.value ?? 0).toString())

  if (!isReady || nfts === undefined) {
    return (
      <div
        className={classNames(
          props.className,
          'rounded-md bg-bkg-1 h-[76px] animate-pulse'
        )}
      />
    )
  }

  if (nfts.length === 0) {
    return (
      <div className={classNames(props.className, 'text-xs', 'text-white/50')}>
        You do not have any voting power in this dao.
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
      <Join />
    </div>
  )
}
