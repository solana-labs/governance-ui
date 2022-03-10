import { PublicKey } from '@blockworks-foundation/mango-client'
import Button, { LinkButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Tooltip from '@components/Tooltip'
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
import { useRouter } from 'next/router'
import GovernedAccountSelect from 'pages/dao/[symbol]/proposal/components/GovernedAccountSelect'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useMarketStore from 'Strategies/store/marketStore'
import { HandleCreateProposalWithStrategy } from 'Strategies/types/types'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'

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
  const { realmInfo, realm, ownVoterWeight, mint, councilMint, symbol } =
    useRealm()
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
  const connection = useWalletStore((s) => s.connection)
  const market = useMarketStore((s) => s)
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const filteredTokenGov = governedTokenAccountsWithoutNfts.filter(
    (x) => x.mint?.publicKey.toBase58() === handledMint
  )
  const tokenInfo = tokenService.getTokenInfo(handledMint)
  const [matchedTreasuryAccount, setMatchedTreasuryAccount] = useState<
    GovernedTokenAccount | undefined
  >()
  const { canUseTransferInstruction } = useGovernanceAssets()
  const [hasMoreThenOneTreasury, setHasMoreThenOneTreasury] = useState(false)
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
      matchedTreasuryAccount!,
      ownTokenRecord.pubkey,
      defaultProposalMint!,
      matchedTreasuryAccount!.governance!.account!.proposalCount,
      [],
      false,
      market,
      client
    )
    const url = fmtUrlWithCluster(`/dao/${symbol}/proposal/${proposalAddress}`)
    router.push(url)
  }

  return (
    <div
      className={`${
        !filteredTokenGov.length && 'opacity-60 pointer-events-none'
      }`}
    >
      {hasMoreThenOneTreasury && (
        <div className="pb-4">
          <GovernedAccountSelect
            label="Account"
            governedAccounts={filteredTokenGov as GovernedMultiTypeAccount[]}
            onChange={(selected) => {
              setMatchedTreasuryAccount(selected)
            }}
            value={matchedTreasuryAccount}
          />
        </div>
      )}
      <div className="flex mb-1.5 text-sm">
        Amount
        <div className="ml-auto flex items-center text-xs">
          <span className="text-fgd-3 mr-1">Bal:</span> {maxAmountFtm}
          <LinkButton
            onClick={() => setAmount(maxAmount.toNumber())}
            className="font-bold ml-2 text-primary-light"
          >
            Max
          </LinkButton>
        </div>
      </div>
      <Input
        min={mintMinAmount}
        value={amount}
        type="number"
        onChange={(e) => setAmount(e.target.value)}
        step={mintMinAmount}
        suffix={tokenInfo?.symbol}
        onBlur={validateAmountOnBlur}
      />
      <div className="border border-fgd-4 p-4 rounded-md mb-6 mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-fgd-3">Current Deposit</span>
          <span className="font-bold text-fgd-1">
            {currentPositionFtm || 0}{' '}
            <span className="font-normal text-fgd-3">{tokenInfo?.symbol}</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-fgd-3">Proposed Deposit</span>
          <span className="font-bold text-fgd-1">
            {amount?.toLocaleString() || (
              <span className="font-normal text-red">Enter an amount</span>
            )}{' '}
            <span className="font-normal text-fgd-3">
              {amount && tokenInfo?.symbol}
            </span>
          </span>
        </div>
      </div>
      <Tooltip
        content={
          !canUseTransferInstruction
            ? 'Please connect wallet with enough voting power to create treasury proposals'
            : !amount
            ? 'Please input the amount'
            : ''
        }
      >
        <Button
          className="w-full"
          onClick={handleDeposit}
          disabled={!amount || !connected}
        >
          Propose deposit
        </Button>
      </Tooltip>
    </div>
  )
}

export default DepositComponent
