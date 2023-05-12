/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { SecondaryButton } from '@components/Button'
import Loading from '@components/Loading'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { BN } from '@coral-xyz/anchor'
import { RpcContext } from '@solana/spl-governance'
import { notify } from '@utils/notifications'
import { useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { voteRegistryDepositWithoutLockup } from 'VoteStakeRegistry/actions/voteRegistryDepositWithoutLockup'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'

const DepositCommunityTokensBtn = ({ className = '', inAccountDetails }) => {
  const { getOwnedDeposits } = useDepositStore()
  const realm = useRealmQuery().data?.result

  const { realmInfo, realmTokenAccount } = useRealm()
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const [isLoading, setIsLoading] = useState(false)
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const { fetchRealm, fetchWalletTokenAccounts } = useWalletStore(
    (s) => s.actions
  )
  const currentTokenOwnerRecord = useUserCommunityTokenOwnerRecord().data
    ?.result

  const depositAllTokens = async function () {
    if (!realm) {
      throw 'No realm selected'
    }
    setIsLoading(true)
    const tokenOwnerRecordPk =
      typeof currentTokenOwnerRecord !== 'undefined'
        ? currentTokenOwnerRecord.pubkey
        : null
    const rpcContext = new RpcContext(
      realm.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection,
      endpoint
    )
    try {
      await voteRegistryDepositWithoutLockup({
        rpcContext,
        fromPk: realmTokenAccount!.publicKey,
        mintPk: realm.account.communityMint!,
        realmPk: realm.pubkey,
        programId: realm.owner,
        programVersion: realmInfo?.programVersion!,
        amount: realmTokenAccount!.account.amount,
        tokenOwnerRecordPk,
        client: client,
        communityMintPk: realm.account.communityMint,
      })
      await getOwnedDeposits({
        realmPk: realm!.pubkey,
        communityMintPk: realm!.account.communityMint,
        walletPk: wallet!.publicKey!,
        client: client!,
        connection,
      })
      await fetchWalletTokenAccounts()
      await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
    } catch (e) {
      console.log(e)
      notify({ message: `Something went wrong ${e}`, type: 'error' })
    }
    setIsLoading(false)
  }

  const hasTokensInWallet =
    realmTokenAccount && realmTokenAccount.account.amount.gt(new BN(0))

  const depositTooltipContent = !connected
    ? 'Connect your wallet to deposit'
    : !hasTokensInWallet
    ? "You don't have any governance tokens in your wallet to deposit."
    : ''

  return hasTokensInWallet && !inAccountDetails ? (
    <SecondaryButton
      tooltipMessage={depositTooltipContent}
      className={`sm:w-1/2 ${className}`}
      disabled={!connected || !hasTokensInWallet || isLoading}
      onClick={depositAllTokens}
    >
      {isLoading ? <Loading></Loading> : 'Deposit'}
    </SecondaryButton>
  ) : inAccountDetails ? (
    <SecondaryButton
      tooltipMessage={depositTooltipContent}
      className={`sm:w-1/2 ${className}`}
      disabled={!connected || !hasTokensInWallet || isLoading}
      onClick={depositAllTokens}
    >
      {isLoading ? <Loading></Loading> : 'Deposit'}
    </SecondaryButton>
  ) : null
}

export default DepositCommunityTokensBtn
