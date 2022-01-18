import Button from '@components/Button'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { RpcContext } from '@solana/spl-governance'
import { fmtMintAmount } from '@tools/sdk/units'
import useWalletStore from 'stores/useWalletStore'
import { voteRegistryWithdraw } from 'VoteStakeRegistry/actions/voteRegistryWithdraw'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'
import {
  DepositWithMintAccount,
  LockupType,
  SECS_PER_DAY,
} from 'VoteStakeRegistry/utils/voteRegistryTools'

const DepositCard = ({ deposit }: { deposit: DepositWithMintAccount }) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const {
    realm,
    realmInfo,
    realmTokenAccount,
    ownTokenRecord,
    tokenRecords,
  } = useRealm()
  const {
    client,
    calcMintMultiplier,
    communityMintRegistrar,
  } = useVoteRegistry()
  const depositTokenRecord = ownTokenRecord

  const depositTokenAccount = realmTokenAccount
  const handleWithDrawFromDeposit = async (
    depositEntry: DepositWithMintAccount
  ) => {
    const rpcContext = new RpcContext(
      realm!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection,
      endpoint
    )

    await voteRegistryWithdraw(
      rpcContext,
      depositTokenAccount!.publicKey!,
      depositTokenRecord!.account.governingTokenMint,
      realm!.pubkey!,
      depositEntry.amountDepositedNative,
      tokenRecords[wallet!.publicKey!.toBase58()].pubkey!,
      depositEntry.index,
      client
    )
    //getDeposits
  }
  const CardLabel = ({ label, value }) => {
    return (
      <div className="flex flex-col w-1/2 p-2">
        <div className="text-xs text-fgd-3">{label}</div>
        <div>{value}</div>
      </div>
    )
  }
  const availableTokens = fmtMintAmount(
    deposit.mint.account,
    deposit.amountDepositedNative
  )
  const type = Object.keys(deposit.lockup.kind)[0] as LockupType
  const typeName = type !== 'monthly' ? type : 'Vested'
  const isVest = type === 'monthly'
  const isRealmCommunityMint =
    deposit.mint.publicKey.toBase58() ===
    realm?.account.communityMint.toBase58()
  const isConstant = type === 'constant'
  return (
    <div className="border border-bkg-4 w-80 mr-3 rounded-lg mb-3 flex flex-col">
      <div className="bg-bkg-4 px-4 py-4 pr-16 rounded-md flex flex-col">
        <h3 className="mb-0">{availableTokens}</h3>
      </div>
      <div
        className="p-4 pb-6 bg-bkg-1 rounded-lg flex flex-col"
        style={{ height: '275px' }}
      >
        <div className="flex flex-row flex-wrap">
          <CardLabel label="Type" value={typeName} />
          {isVest && (
            <CardLabel
              label="Initial amount"
              value={fmtMintAmount(
                deposit.mint.account,
                deposit.amountInitiallyLockedNative
              )}
            />
          )}
          {isVest && <CardLabel label="Schedule" value="xxx p/m" />}
          {isRealmCommunityMint && (
            <CardLabel
              label="Vote multiplier"
              value={calcMintMultiplier(
                deposit.lockup.endTs.sub(deposit.lockup.startTs).toNumber(),
                communityMintRegistrar
              )}
            />
          )}
          <CardLabel
            label={isConstant ? 'Min. Duration' : 'Time left'}
            value={`${
              deposit.lockup.endTs.sub(deposit.lockup.startTs).toNumber() /
              SECS_PER_DAY
            } days`}
          />
          <CardLabel
            label="Available"
            value={fmtMintAmount(
              deposit.mint.account,
              deposit.amountDepositedNative
            )}
          />
        </div>
        {
          <Button
            style={{ marginTop: 'auto' }}
            className="w-full"
            onClick={() => handleWithDrawFromDeposit(deposit)}
          >
            {!isConstant ? 'Withdraw' : 'Start Unlock'}
          </Button>
        }
      </div>
    </div>
  )
}

export default DepositCard
