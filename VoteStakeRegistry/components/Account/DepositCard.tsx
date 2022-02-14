import Button from '@components/Button'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { RpcContext } from '@solana/spl-governance'
import {
  fmtMintAmount,
  getMintDecimalAmount,
  getMintDecimalAmountFromNatural,
} from '@tools/sdk/units'
import useWalletStore from 'stores/useWalletStore'
import { voteRegistryWithdraw } from 'VoteStakeRegistry/actions/voteRegistryWithdraw'
import {
  DepositWithMintAccount,
  LockupType,
} from 'VoteStakeRegistry/sdk/accounts'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import tokenService from '@utils/services/token'
import LockTokensModal from './LockTokensModal'
import { useState } from 'react'
import {
  getMinDurationFmt,
  getTimeLeftFromNowFmt,
} from 'VoteStakeRegistry/tools/dateTools'
import { XIcon } from '@heroicons/react/outline'
import Tooltip from '@components/Tooltip'
import { closeDeposit } from 'VoteStakeRegistry/actions/closeDeposit'
import { abbreviateAddress } from '@utils/formatting'
import { notify } from '@utils/notifications'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
import { calcMintMultiplier } from 'VoteStakeRegistry/tools/deposits'

const DepositCard = ({ deposit }: { deposit: DepositWithMintAccount }) => {
  const { getOwnedDeposits } = useDepositStore()
  const { realm, realmInfo, tokenRecords, ownTokenRecord } = useRealm()
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
  const communityMintRegistrar = useVoteStakeRegistryClientStore(
    (s) => s.state.communityMintRegistrar
  )
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)
  const { fetchRealm, fetchWalletTokenAccounts } = useWalletStore(
    (s) => s.actions
  )

  const handleWithDrawFromDeposit = async (
    depositEntry: DepositWithMintAccount
  ) => {
    if (
      ownTokenRecord!.account!.unrelinquishedVotesCount &&
      realm!.account.communityMint.toBase58() ===
        deposit.mint.publicKey.toBase58()
    ) {
      notify({
        type: 'error',
        message:
          "You can't withdraw community tokens when you have active proposals",
      })
      return
    }
    const rpcContext = new RpcContext(
      realm!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection,
      endpoint
    )
    await voteRegistryWithdraw({
      rpcContext,
      mintPk: depositEntry!.mint.publicKey,
      realmPk: realm!.pubkey!,
      amount: depositEntry.available,
      communityMintPk: realm!.account.communityMint,
      closeDepositAfterOperation: depositEntry.currentlyLocked.isZero(),
      tokenOwnerRecordPubKey: tokenRecords[wallet!.publicKey!.toBase58()]
        .pubkey!,
      depositIndex: depositEntry.index,
      client: client,
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
  }
  const handleStartUnlock = () => {
    setIsUnlockModalOpen(true)
  }
  const handleCloseDeposit = async () => {
    const rpcContext = new RpcContext(
      realm!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection,
      endpoint
    )
    await closeDeposit({
      rpcContext,
      realmPk: realm!.pubkey!,
      depositIndex: deposit.index,
      communityMintPk: realm!.account.communityMint,
      client,
    })
    await getOwnedDeposits({
      realmPk: realm!.pubkey,
      communityMintPk: realm!.account.communityMint,
      walletPk: wallet!.publicKey!,
      client: client!,
      connection,
    })
  }

  const lockedTokens = fmtMintAmount(
    deposit.mint.account,
    deposit.currentlyLocked
  )
  const type = Object.keys(deposit.lockup.kind)[0] as LockupType
  const typeName = type !== 'monthly' ? type : 'Vested'
  const isVest = type === 'monthly'
  const isRealmCommunityMint =
    deposit.mint.publicKey.toBase58() ===
    realm?.account.communityMint.toBase58()
  const isConstant = type === 'constant'
  const CardLabel = ({ label, value }) => {
    return (
      <div className="flex flex-col w-1/2 p-2">
        <div className="text-xs text-fgd-3">{label}</div>
        <div className="break-all">{value}</div>
      </div>
    )
  }
  const price =
    getMintDecimalAmountFromNatural(
      deposit.mint.account,
      deposit.currentlyLocked
    ).toNumber() *
    tokenService.getUSDTokenPrice(deposit.mint.publicKey.toBase58())
  const img = tokenService.getTokenInfo(deposit.mint.publicKey.toBase58())
    ?.logoURI
  const formatter = Intl.NumberFormat('en', { notation: 'compact' })
  return (
    <div className="border border-bkg-4 rounded-lg flex flex-col">
      <div className="bg-bkg-4 px-4 py-4 pr-16 rounded-md flex flex-col">
        <h3 className="mb-0 flex flex-items items-center">
          {img && <img className="w-6 h-6 mr-2" src={img}></img>}
          {lockedTokens} {!img && abbreviateAddress(deposit.mint.publicKey)}
          {price ? (
            <span className="text-xs opacity-70 font-light ml-1">
              =${formatter.format(price)}
            </span>
          ) : null}
          {deposit?.available?.isZero() && deposit?.currentlyLocked?.isZero() && (
            <Tooltip
              content="Close deposit - used to close unused deposit"
              contentClassName="ml-auto"
            >
              <XIcon
                onClick={handleCloseDeposit}
                className="w-5 h-5 text-primary-light cursor-pointer"
              ></XIcon>
            </Tooltip>
          )}
        </h3>
      </div>
      <div
        className="p-4 pb-6 bg-bkg-1 rounded-lg flex flex-col h-full"
        style={{ minHeight: '290px' }}
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
          {isVest && (
            <CardLabel
              label="Schedule"
              value={
                deposit.vestingRate &&
                `${getMintDecimalAmount(
                  deposit.mint.account,
                  deposit.vestingRate
                ).toFormat(2)} p/mo`
              }
            />
          )}
          {isRealmCommunityMint && (
            <CardLabel
              label="Vote multiplier"
              value={calcMintMultiplier(
                deposit.lockup.endTs.sub(deposit.lockup.startTs).toNumber(),
                communityMintRegistrar,
                realm
              )}
            />
          )}
          <CardLabel
            label={isConstant ? 'Min. Duration' : 'Time left'}
            value={
              isConstant
                ? getMinDurationFmt(deposit)
                : getTimeLeftFromNowFmt(deposit)
            }
          />
          <CardLabel
            label="Available"
            value={fmtMintAmount(deposit.mint.account, deposit.available)}
          />
        </div>
        <Button
          disabled={!isConstant && deposit.available.isZero()}
          style={{ marginTop: 'auto' }}
          className="w-full"
          onClick={() =>
            !isConstant
              ? handleWithDrawFromDeposit(deposit)
              : handleStartUnlock()
          }
        >
          {!isConstant ? 'Withdraw' : 'Start Unlock'}
        </Button>
      </div>
      {isUnlockModalOpen && (
        <LockTokensModal
          depositToUnlock={deposit}
          isOpen={isUnlockModalOpen}
          onClose={() => setIsUnlockModalOpen(false)}
        ></LockTokensModal>
      )}
    </div>
  )
}

export default DepositCard
