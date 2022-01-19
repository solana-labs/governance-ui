import Button from '@components/Button'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { BN } from '@project-serum/anchor'
import { RpcContext } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { voteRegistryDepositWithoutLockup } from 'VoteStakeRegistry/actions/voteRegistryDepositWithoutLockup'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

const DepositCommunityTokensBtn = ({ className = '' }) => {
  const { getDeposits } = useDepositStore()
  const {
    realm,
    realmInfo,
    realmTokenAccount,
    tokenRecords,
    ownTokenRecord,
  } = useRealm()
  const { client } = useVoteRegistry()
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const { fetchWalletTokenAccounts, fetchRealm } = useWalletStore(
    (s) => s.actions
  )

  const depositAllTokens = async function () {
    if (!realm) {
      throw 'No realm selected'
    }
    const currentTokenOwnerRecord = tokenRecords[wallet!.publicKey!.toBase58()]
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
    await voteRegistryDepositWithoutLockup({
      rpcContext,
      fromPk: realmTokenAccount!.publicKey,
      mintPk: realm.account.communityMint!,
      realmPk: realm.pubkey,
      programId: realm.owner,
      amount: realmTokenAccount!.account.amount,
      tokenOwnerRecordPk,
      client,
    })
    await getDeposits({
      realmPk: realm!.pubkey,
      communityMintPk: ownTokenRecord!.account.governingTokenMint,
      walletPk: wallet!.publicKey!,
      client: client!,
      connection,
    })
    await fetchWalletTokenAccounts()
    await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
  }

  const hasTokensInWallet =
    realmTokenAccount && realmTokenAccount.account.amount.gt(new BN(0))

  const depositTooltipContent = !connected
    ? 'Connect your wallet to deposit'
    : !hasTokensInWallet
    ? "You don't have any governance tokens in your wallet to deposit."
    : ''

  return (
    <Button
      tooltipMessage={depositTooltipContent}
      className={`sm:w-1/2 ${className}`}
      disabled={!connected || !hasTokensInWallet}
      onClick={depositAllTokens}
    >
      Deposit
    </Button>
  )
}

export default DepositCommunityTokensBtn
