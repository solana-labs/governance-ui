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
import dayjs from 'dayjs'

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
      <div className="flex flex-col w-1/2 py-2">
        <p className="text-xs text-fgd-2">{label}</p>
        <p className="font-bold text-fgd-1">{value}</p>
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
    <div className="border border-fgd-4 rounded-lg flex flex-col">
      <div className="bg-bkg-1 px-4 py-4 pr-16 rounded-md flex items-center">
        {img && <img className="w-8 h-8 mr-2" src={img}></img>}
        <h3 className="flex flex-items hero-text items-center mb-0">
          {lockedTokens} {!img && abbreviateAddress(deposit.mint.publicKey)}
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
        {price ? (
          <div className="flex font-bold items-center text-xs ml-3 rounded-full bg-bkg-3 px-2 py-1">
            <span className="text-fgd-3">≈</span>${formatter.format(price)}
          </div>
        ) : null}
      </div>
      <div
        className="p-4 rounded-lg flex flex-col h-full"
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
          {isVest && deposit.nextVestingTimestamp !== null && (
            <CardLabel
              label="Next vesting"
              value={dayjs(
                deposit.nextVestingTimestamp?.toNumber() * 1000
              ).format('DD-MM-YYYY')}
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
