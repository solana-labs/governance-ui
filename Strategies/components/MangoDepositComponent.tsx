import {
  INFO_LEN,
  makeRegisterReferrerIdInstruction,
  MangoAccountLayout,
  MangoGroup,
  PublicKey,
  ReferrerIdRecord,
} from '@blockworks-foundation/mango-client'
import Button, { LinkButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Loading from '@components/Loading'
import Tooltip from '@components/Tooltip'
import { DuplicateIcon } from '@heroicons/react/outline'
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
import { notify } from '@utils/notifications'
import { sendTransaction } from '@utils/send'
import tokenService from '@utils/services/token'
import { GovernedMultiTypeAccount, GovernedTokenAccount } from '@utils/tokens'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/router'
import GovernedAccountSelect from 'pages/dao/[symbol]/proposal/components/GovernedAccountSelect'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import {
  accountNumBN,
  MANGO_MINT,
  MANGO_MINT_DEVNET,
  tryGetMangoAccount,
} from 'Strategies/protocols/mango/tools'
import useMarketStore from 'Strategies/store/marketStore'
import { HandleCreateProposalWithStrategy } from 'Strategies/types/types'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
import ButtonGroup from '@components/ButtonGroup'
const minMngoToCreateLink = 10000
const MangoDepositComponent = ({
  handledMint,
  currentPositionFtm,
  currentPosition,
  createProposalFcn,
}: {
  handledMint: string
  currentPositionFtm: string
  currentPosition: number
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
  const [isDepositing, setIsDepositing] = useState(false)
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
  const [existingLinks, setExistingLinks] = useState<ReferrerIdRecord[]>([])
  const [amount, setAmount] = useState<number | undefined>()
  const [linkName, setLinkName] = useState('')
  const [linkGenerated, setLinkGenerated] = useState(false)
  const [proposalType, setProposalType] = useState('Deposit')
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
    const getRefLinks = async () => {
      const client = market.client
      const [mangoAccountPk] = await PublicKey.findProgramAddress(
        [
          market.group!.publicKey.toBytes(),
          matchedTreasuryAccount!.governance!.pubkey.toBytes(),
          accountNumBN.toArrayLike(Buffer, 'le', 8),
        ],
        market.groupConfig!.mangoProgramId
      )
      const account = await tryGetMangoAccount(market, mangoAccountPk)
      if (account) {
        const referrerIds = await client?.getReferrerIdsForMangoAccount(account)
        if (referrerIds) {
          setExistingLinks(referrerIds)
        }
      }
    }
    if (matchedTreasuryAccount) {
      getRefLinks()
    }

    setAmount(undefined)
  }, [matchedTreasuryAccount])
  const handleSolPayment = async () => {
    const instructions: TransactionInstruction[] = []
    const toAddress = await getNativeTreasuryAddress(
      realm!.owner,
      matchedTreasuryAccount!.governance!.pubkey
    )
    const hasSolAccount = await connection.current.getParsedAccountInfo(
      toAddress
    )
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
    return instructions
  }
  const handleDeposit = async () => {
    try {
      setIsDepositing(true)
      const prerequisiteInstructions: TransactionInstruction[] = []
      const group = market.group!
      const groupConfig = market.groupConfig!
      const [mangoAccountPk] = await PublicKey.findProgramAddress(
        [
          group.publicKey.toBytes(),
          matchedTreasuryAccount!.governance!.pubkey.toBytes(),
          accountNumBN.toArrayLike(Buffer, 'le', 8),
        ],
        groupConfig.mangoProgramId
      )
      const acc = await connection.current.getAccountInfo(
        mangoAccountPk,
        'processed'
      )
      if (!acc) {
        const solAccountInstruction = await handleSolPayment()
        prerequisiteInstructions.push(...solAccountInstruction)
      }
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
        prerequisiteInstructions,
        false,
        market,
        client
      )
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )
      router.push(url)
    } catch (e) {
      console.log(e)
    }
    setIsDepositing(false)
  }
  const getReferrerPda = async (
    mangoGroup: MangoGroup,
    referrerId: string,
    programId: PublicKey
  ): Promise<{ referrerPda: PublicKey; encodedReferrerId: Buffer }> => {
    const encoded = Buffer.from(referrerId, 'utf8')
    if (encoded.length > INFO_LEN) {
      throw new Error(
        `info string too long. Must be less than or equal to ${INFO_LEN} bytes`
      )
    }

    const encodedReferrerId = Buffer.concat([
      encoded,
      Buffer.alloc(INFO_LEN - encoded.length, 0),
    ])

    // Generate the PDA pubkey
    const [referrerIdRecordPk] = await PublicKey.findProgramAddress(
      [
        mangoGroup.publicKey.toBytes(),
        new Buffer('ReferrerIdRecord', 'utf-8'),
        encodedReferrerId,
      ],
      programId
    )

    return { referrerPda: referrerIdRecordPk, encodedReferrerId }
  }
  const handleCreateLink = async () => {
    setLinkGenerated(false)
    try {
      const signers = []
      const programId = market.client!.programId
      const mangoGroup = market.group
      const { referrerPda, encodedReferrerId } = await getReferrerPda(
        mangoGroup!,
        linkName,
        programId
      )
      const [mangoAccountPk] = await PublicKey.findProgramAddress(
        [
          mangoGroup!.publicKey.toBytes(),
          matchedTreasuryAccount!.governance!.pubkey.toBytes(),
          accountNumBN.toArrayLike(Buffer, 'le', 8),
        ],
        market.groupConfig!.mangoProgramId
      )
      const instruction = makeRegisterReferrerIdInstruction(
        programId,
        mangoGroup!.publicKey,
        mangoAccountPk,
        referrerPda,
        wallet!.publicKey!,
        encodedReferrerId
      )

      const transaction = new Transaction()
      transaction.add(instruction)
      await sendTransaction({
        transaction,
        wallet,
        connection: connection.current,
        signers,
        sendingMessage: 'Creating ref link',
        successMessage: 'Ref link created',
      })
      setLinkGenerated(true)
    } catch (e) {
      setLinkGenerated(false)
      notify({ type: 'error', message: "Can't generate link" })
    }
  }
  const link =
    connection.cluster === 'devnet'
      ? `http://devnet.mango.markets/?ref=`
      : `https://trade.mango.markets/?ref`
  return (
    <div className="">
      {(matchedTreasuryAccount?.mint?.publicKey.toBase58() === MANGO_MINT ||
        matchedTreasuryAccount?.mint?.publicKey.toBase58() ===
          MANGO_MINT_DEVNET) && (
        // currentPosition >= minMngoToCreateLink &&
        <div className="pb-4">
          <ButtonGroup
            activeValue={proposalType}
            className="h-10"
            onChange={(v) => setProposalType(v)}
            values={['Deposit', 'Create Referral Link']}
          />
        </div>
      )}
      {proposalType === 'Create Referral Link' ? (
        <div
          className={` ${
            !filteredTokenGov.length && 'opacity-60 pointer-events-none'
          }`}
        >
          {hasMoreThenOneTreasury && (
            <div className="pb-4">
              <GovernedAccountSelect
                label="Account"
                governedAccounts={
                  filteredTokenGov as GovernedMultiTypeAccount[]
                }
                onChange={(selected) => {
                  setMatchedTreasuryAccount(selected)
                }}
                value={matchedTreasuryAccount}
              />
            </div>
          )}
          <Input
            label="Referral ID"
            value={linkName}
            type="text"
            onChange={(e) => setLinkName(e.target.value)}
          />
          <Button
            className="w-full mt-6"
            onClick={handleCreateLink}
            disabled={
              currentPosition < minMngoToCreateLink ||
              !connected ||
              !linkName.length ||
              !canUseTransferInstruction
            }
          >
            <Tooltip
              content={
                !canUseTransferInstruction
                  ? 'Please connect wallet with enough voting power to create treasury proposals'
                  : currentPosition < minMngoToCreateLink
                  ? 'Please deposit at least 10000 MNGO to create link'
                  : !linkName.length
                  ? 'Please type link name'
                  : ''
              }
            >
              Create Referral Link
            </Tooltip>
          </Button>
          {linkGenerated || existingLinks.length > 0 ? (
            <div className="pt-6">
              {linkGenerated && (
                <div className="border border-fgd-4 px-4 py-2 rounded-md w-full break-all flex items-center">
                  <div>
                    <div className="text-xs text-fgd-1">
                      {link}
                      {linkName}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <LinkButton
                      className="ml-4 text-primary-light"
                      onClick={() => {
                        navigator.clipboard.writeText(`${link}${linkName}`)
                      }}
                    >
                      <DuplicateIcon className="w-5 h-5 mt-1" />
                    </LinkButton>
                  </div>
                </div>
              )}
              {existingLinks.map((x) => (
                <div
                  key={x.referrerId}
                  className="border border-fgd-4 px-4 py-2 rounded-md w-full break-all flex items-center"
                >
                  <div>
                    <div className="text-xs text-fgd-1">
                      {link}
                      {x.referrerId}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <LinkButton
                      className="ml-4 text-primary-light"
                      onClick={() => {
                        navigator.clipboard.writeText(`${link}${x.referrerId}`)
                      }}
                    >
                      <DuplicateIcon className="w-5 h-5 mt-1" />
                    </LinkButton>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={`${
            !filteredTokenGov.length && 'opacity-60 pointer-events-none'
          }`}
        >
          {hasMoreThenOneTreasury && (
            <div className="pb-4">
              <GovernedAccountSelect
                label="Account"
                governedAccounts={
                  filteredTokenGov as GovernedMultiTypeAccount[]
                }
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
            suffix="MNGO"
            onBlur={validateAmountOnBlur}
          />
          <div className="border border-fgd-4 p-4 rounded-md mb-6 mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-fgd-3">Current Deposit</span>
              <span className="font-bold text-fgd-1">
                {currentPositionFtm || 0}{' '}
                <span className="font-normal text-fgd-3">
                  {tokenInfo?.symbol}
                </span>
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
          <Button
            className="w-full"
            onClick={handleDeposit}
            disabled={!amount || !canUseTransferInstruction || isDepositing}
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
              {!isDepositing ? 'Propose deposit' : <Loading></Loading>}
            </Tooltip>
          </Button>
        </div>
      )}
    </div>
  )
}

export default MangoDepositComponent
