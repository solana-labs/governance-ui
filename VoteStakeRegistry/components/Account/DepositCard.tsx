import Button from '@components/Button'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { RpcContext } from '@solana/spl-governance'
import { fmtMintAmount, getMintDecimalAmount } from '@tools/sdk/units'
import useWalletStore from 'stores/useWalletStore'
import { voteRegistryWithdraw } from 'VoteStakeRegistry/actions/voteRegistryWithdraw'
import {
  DepositWithMintAccount,
  LockupType,
} from 'VoteStakeRegistry/sdk/accounts'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import tokenPriceService from '@utils/services/tokenPrice'
import LockTokensModal from './LockTokensModal'
import { useState } from 'react'
import { closeDeposit } from 'VoteStakeRegistry/actions/closeDeposit'
import { abbreviateAddress } from '@utils/formatting'
import { notify } from '@utils/notifications'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import dayjs from 'dayjs'
import {
  getMinDurationFmt,
  getTimeLeftFromNowFmt,
  getFormattedStringFromDays,
  SECS_PER_DAY,
} from '@utils/dateTools'
import { BN } from '@coral-xyz/anchor'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'
import useWalletOnePointOh from '@hooks/useWallet'

const DepositCard = ({
  deposit,
  vsrClient,
}: {
  deposit: DepositWithMintAccount
  vsrClient?: VsrClient | undefined
}) => {
  const { getOwnedDeposits } = useDepositStore()
  const { realm, realmInfo, tokenRecords, ownTokenRecord } = useRealm()
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const actualClient = vsrClient || client
  const wallet = useWalletOnePointOh()
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)
  const {
    fetchRealm,
    fetchWalletTokenAccounts,
    fetchOwnVoteRecords,
  } = useWalletStore((s) => s.actions)
  const handleWithDrawFromDeposit = async (
    depositEntry: DepositWithMintAccount
  ) => {
    if (
      ownTokenRecord?.account?.unrelinquishedVotesCount &&
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
      tokenOwnerRecordPubKey:
        tokenRecords[wallet!.publicKey!.toBase58()]?.pubkey,
      depositIndex: depositEntry.index,
      client: actualClient,
      splProgramId: realm!.owner!,
      splProgramVersion: getProgramVersionForRealm(realmInfo!),
    })
    await getOwnedDeposits({
      realmPk: realm!.pubkey,
      communityMintPk: realm!.account.communityMint,
      walletPk: wallet!.publicKey!,
      client: actualClient!,
      connection,
    })
    await fetchWalletTokenAccounts()
    await fetchOwnVoteRecords()
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
      client: actualClient,
    })
    await getOwnedDeposits({
      realmPk: realm!.pubkey,
      communityMintPk: realm!.account.communityMint,
      walletPk: wallet!.publicKey!,
      client: actualClient!,
      connection,
    })
  }

  const lockedTokens = fmtMintAmount(
    deposit.mint.account,
    deposit.currentlyLocked.add(deposit.available)
  )
  const type = Object.keys(deposit.lockup.kind)[0] as LockupType
  const isVest = type === 'monthly' || type === 'daily'
  const typeName = !isVest ? type : 'Vested'
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
  const tokenInfo = tokenPriceService.getTokenInfo(
    deposit.mint.publicKey.toBase58()
  )
  return (
    <div className="border border-fgd-4 rounded-lg flex flex-col">
      <div className="bg-bkg-3 px-4 py-4 pr-16 rounded-md rounded-b-none flex items-center">
        {tokenInfo?.logoURI && (
          <img className="w-8 h-8 mr-2" src={tokenInfo?.logoURI}></img>
        )}
        <h3 className="hero-text mb-0">
          {lockedTokens}{' '}
          {!tokenInfo?.logoURI && abbreviateAddress(deposit.mint.publicKey)}
          <span className="font-normal text-xs text-fgd-3">
            {tokenInfo?.symbol}
          </span>
        </h3>
      </div>
      <div
        className="p-4 rounded-lg flex flex-col h-full"
        style={{ minHeight: '290px' }}
      >
        <div className="flex flex-wrap">
          <CardLabel
            label="Lockup Type"
            value={`${typeName.charAt(0).toUpperCase() + typeName.slice(1)} ${
              isVest ? `(${type})` : ''
            }`}
          />
          <CardLabel
            label="Allow dao to clawback"
            value={deposit.allowClawback ? 'Yes' : 'No'}
          />
          {isVest && (
            <CardLabel
              label="Initial Amount"
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
                ).toFormat(0)} ${
                  typeof deposit.lockup.kind.monthly !== 'undefined'
                    ? 'p/mo'
                    : 'p/d'
                }`
              }
            />
          )}
          {isVest && deposit.nextVestingTimestamp !== null && (
            <CardLabel
              label="Next Vesting in"
              value={getFormattedStringFromDays(
                deposit!.nextVestingTimestamp
                  .sub(new BN(dayjs().unix()))
                  .toNumber() / SECS_PER_DAY
              )}
            />
          )}
          {isRealmCommunityMint && (
            <CardLabel
              label="Vote Multiplier"
              value={(deposit.votingPower.isZero() ||
              deposit.votingPowerBaseline.isZero()
                ? 0
                : deposit.votingPower.toNumber() /
                  deposit.votingPowerBaseline.toNumber()
              ).toFixed(2)}
            />
          )}
          <CardLabel
            label={isConstant ? 'Min. Duration' : 'Time left'}
            value={
              isConstant
                ? getMinDurationFmt(
                    deposit.lockup.startTs,
                    deposit.lockup.endTs
                  )
                : getTimeLeftFromNowFmt(deposit.lockup.endTs)
            }
          />
          <CardLabel
            label="Available"
            value={fmtMintAmount(deposit.mint.account, deposit.available)}
          />
        </div>
        {deposit?.available?.isZero() && deposit?.currentlyLocked?.isZero() ? (
          <Button
            style={{ marginTop: 'auto' }}
            className="w-full"
            onClick={handleCloseDeposit}
          >
            Close Deposit
          </Button>
        ) : (
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
        )}
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
