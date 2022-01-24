import Button from '@components/Button'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { RpcContext } from '@solana/spl-governance'
import {
  fmtMintAmount,
  getMintDecimalAmountFromNatural,
} from '@tools/sdk/units'
import useWalletStore from 'stores/useWalletStore'
import { voteRegistryWithdraw } from 'VoteStakeRegistry/actions/voteRegistryWithdraw'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'
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

const DepositCard = ({ deposit }: { deposit: DepositWithMintAccount }) => {
  const { getDeposits } = useDepositStore()
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
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)

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
    //TODO withdraw to ATA
    await voteRegistryWithdraw({
      rpcContext,
      toPubKey: depositTokenAccount!.publicKey!,
      mintPk: depositTokenRecord!.account.governingTokenMint,
      realmPk: realm!.pubkey!,
      amount: depositEntry.available,
      amountAfterOperation: depositEntry.currentlyLocked.sub(
        depositEntry.available
      ),
      tokenOwnerRecordPubKey: tokenRecords[wallet!.publicKey!.toBase58()]
        .pubkey!,
      depositIndex: depositEntry.index,
      client: client,
    })
    if (ownTokenRecord) {
      await getDeposits({
        realmPk: realm!.pubkey,
        communityMintPk: ownTokenRecord!.account.governingTokenMint,
        walletPk: wallet!.publicKey!,
        client: client!,
        connection,
      })
    }
  }
  const handleStartUnlock = () => {
    setIsUnlockModalOpen(true)
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
        <div>{value}</div>
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
    <div className="border border-bkg-4 w-80 mr-3 rounded-lg mb-3 flex flex-col">
      <div className="bg-bkg-4 px-4 py-4 pr-16 rounded-md flex flex-col">
        <h3 className="mb-0 flex flex-items items-center">
          {img && <img className="w-6 h-6 mr-2" src={img}></img>}
          {lockedTokens}
          {price ? (
            <span className="text-xs opacity-70 font-light ml-1">
              =${formatter.format(price)}
            </span>
          ) : null}
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
                `${fmtMintAmount(
                  deposit.mint.account,
                  deposit.vestingRate
                )} p/mo`
              }
            />
          )}
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
          <CardLabel
            label="Lock from"
            value={new Date(
              deposit.lockup.startTs.toNumber() * 1000
            ).toDateString()}
          />
          <CardLabel
            label="Lock to"
            value={new Date(
              deposit.lockup.endTs.toNumber() * 1000
            ).toDateString()}
          />
        </div>
        {
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
        }
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
