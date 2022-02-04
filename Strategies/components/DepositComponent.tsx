import { PublicKey } from '@blockworks-foundation/mango-client'
import Button from '@components/Button'
import Input from '@components/inputs/Input'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { BN } from '@project-serum/anchor'
import { RpcContext } from '@solana/spl-governance'
import {
  fmtMintAmount,
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import tokenService from '@utils/services/token'
import { GovernedMultiTypeAccount, GovernedTokenAccount } from '@utils/tokens'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next-router-mock'
import GovernedAccountSelect from 'pages/dao/[symbol]/proposal/components/GovernedAccountSelect'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { HandleCreateProposalWithStrategy } from 'Strategies/types/types'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'

const DepositComponent = ({
  handledMint,
  currentPosition,
  createProposalFcn,
}: {
  handledMint: string
  currentPosition: BN
  createProposalFcn: HandleCreateProposalWithStrategy
}) => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const {
    realmInfo,
    realm,
    ownVoterWeight,
    mint,
    councilMint,
    symbol,
  } = useRealm()
  const { client } = useVoteRegistry()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const filteredTokenGov = governedTokenAccountsWithoutNfts.filter(
    (x) => x.mint?.publicKey.toBase58() === handledMint
  )
  const tokenInfo = tokenService.getTokenInfo(handledMint)
  const [matchedTreasuryAccount, setMatchedTreasuryAccount] = useState<
    GovernedTokenAccount | undefined
  >()
  const [hasMoreThenOneTreasury, setHasMoreThenOneTreasury] = useState(false)
  //TODO sol
  const treasuryAmount = matchedTreasuryAccount?.token
    ? matchedTreasuryAccount.token.account.amount
    : new BN(0)
  const mintInfo = matchedTreasuryAccount?.mint?.account
  const [amount, setAmount] = useState<number | undefined>()
  const mintMinAmount = mintInfo ? getMintMinAmountAsDecimal(mintInfo) : 1
  const maxAmount = mintInfo
    ? getMintDecimalAmount(mintInfo, treasuryAmount)
    : new BigNumber(0)
  const maxAmountFtm = fmtMintAmount(mintInfo, treasuryAmount)
  const currentPositionFtm = fmtMintAmount(mintInfo, currentPosition)
  const currentPrecision = precision(mintMinAmount)
  const validateAmountOnBlur = () => {
    setAmount(
      parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(amount))
        ).toFixed(currentPrecision)
      )
    )
  }
  useEffect(() => {
    if (filteredTokenGov.length) {
      setMatchedTreasuryAccount(filteredTokenGov[0])
      setHasMoreThenOneTreasury(filteredTokenGov.length > 1)
    }
  }, [filteredTokenGov.length])
  useEffect(() => {
    setAmount(undefined)
  }, [matchedTreasuryAccount])
  const handleDeposit = async () => {
    const rpcContext = new RpcContext(
      new PublicKey(realm!.owner.toString()),
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection.current,
      connection.endpoint
    )
    const mintAmount = parseMintNaturalAmountFromDecimal(
      amount!,
      matchedTreasuryAccount!.mint!.account.decimals
    )
    const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
      matchedTreasuryAccount!.governance!.account.config
    )
    const defaultProposalMint = !mint?.supply.isZero()
      ? realm!.account.communityMint
      : !councilMint?.supply.isZero()
      ? realm!.account.config.councilMint
      : undefined
    const proposalAddress = await createProposalFcn(
      rpcContext,
      handledMint,
      mintAmount,
      realm!,
      matchedTreasuryAccount!.governance!,
      ownTokenRecord.pubkey,
      `Deposit 100 tokens to mango protocol strategy`,
      `Deposit 100 tokens to mango protocol strategy`,
      defaultProposalMint!,
      matchedTreasuryAccount!.governance!.account!.proposalCount,
      false,
      client
    )
    const url = fmtUrlWithCluster(`/dao/${symbol}/proposal/${proposalAddress}`)
    router.push(url)
  }
  return (
    <div
      className={`p-6 border-fgd-4 border rounded-md w-4/5 mb-28 ${
        !filteredTokenGov.length && 'opacity-60 pointer-events-none'
      }`}
    >
      <h2 className="mb-12">
        Deposit
        {hasMoreThenOneTreasury && (
          <GovernedAccountSelect
            governedAccounts={filteredTokenGov as GovernedMultiTypeAccount[]}
            onChange={(selected) => {
              setMatchedTreasuryAccount(selected)
            }}
            value={matchedTreasuryAccount}
          ></GovernedAccountSelect>
        )}
      </h2>
      <div className="flex">
        Asset
        <div className="ml-auto flex items-center mb-2">
          <span className="text-fgd-3 text-xs mr-1">Bal:</span> {maxAmountFtm}
          <div
            onClick={() => setAmount(maxAmount.toNumber())}
            className="ml-1 bg-fgd-4 rounded-md px-2 py-1 text-xs cursor-pointer hover:bg-fgd-3"
          >
            Max
          </div>
        </div>
      </div>
      <Input
        min={mintMinAmount}
        placeholder={'Amount'}
        value={amount}
        type="number"
        onChange={(e) => setAmount(e.target.value)}
        step={mintMinAmount}
        onBlur={validateAmountOnBlur}
      />
      <div className="flex mt-10">
        <span>Your deposits</span>
        <span className="ml-auto">
          {currentPositionFtm} {tokenInfo?.symbol}
        </span>
      </div>
      <Button
        className="w-full mt-5"
        onClick={handleDeposit}
        disabled={!amount}
      >
        Deposit
      </Button>
    </div>
  )
}

export default DepositComponent
