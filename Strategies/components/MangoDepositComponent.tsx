import {
  MangoAccountLayout,
  PublicKey,
} from '@blockworks-foundation/mango-client'
import Button from '@components/Button'
import Input from '@components/inputs/Input'
import Tooltip from '@components/Tooltip'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { BN } from '@project-serum/anchor'
import {
  getNativeTreasuryAddress,
  RpcContext,
  withCreateNativeTreasury,
} from '@solana/spl-governance'
import {
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  fmtMintAmount,
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import { sendTransaction } from '@utils/send'
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

const MangoDepositComponent = ({
  handledMint,
  currentPosition,
  createProposalFcn,
}: {
  handledMint: string
  currentPosition: string
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
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
  const market = useMarketStore((s) => s)
  const connection = useWalletStore((s) => s.connection)
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
  const createNativeSolTreasury = async () => {
    const instructions: TransactionInstruction[] = []
    const signers: Keypair[] = []
    const toAddress = await getNativeTreasuryAddress(
      realm!.owner,
      matchedTreasuryAccount!.governance!.pubkey
    )
    const hasSolAccount = await connection.current.getParsedAccountInfo(
      toAddress
    )
    console.log(hasSolAccount)
    if (!hasSolAccount.value) {
      await withCreateNativeTreasury(
        instructions,
        realm!.owner,
        matchedTreasuryAccount!.governance!.pubkey,
        wallet!.publicKey!
      )
    }

    const minRentAmount = await connection.current.getMinimumBalanceForRentExemption(
      MangoAccountLayout.span
    )

    const transferIx = SystemProgram.transfer({
      fromPubkey: wallet!.publicKey!,
      toPubkey: toAddress,
      lamports: minRentAmount,
    })
    instructions.push(transferIx)
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      transaction,
      wallet,
      connection: connection.current,
      signers,
      sendingMessage: 'Creating treasury account',
      successMessage: 'Treasury account has been created',
    })
  }
  const handleDeposit = async () => {
    await createNativeSolTreasury()
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
      false,
      market,
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
          {currentPosition} {tokenInfo?.symbol}
        </span>
      </div>
      <Button
        className="w-full mt-5"
        onClick={handleDeposit}
        disabled={!amount || !connected}
      >
        <Tooltip
          content={
            !canUseTransferInstruction
              ? 'Please connect wallet with enough voting power to create treasury proposals'
              : !amount
              ? 'Please input the amount'
              : ''
          }
        >
          Deposit
        </Tooltip>
      </Button>
    </div>
  )
}

export default MangoDepositComponent
