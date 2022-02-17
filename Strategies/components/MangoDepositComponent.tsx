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
import Tooltip from '@components/Tooltip'
import { Tab } from '@headlessui/react'
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
} from 'Strategies/protocols/mango/tools'
import useMarketStore from 'Strategies/store/marketStore'
import { HandleCreateProposalWithStrategy } from 'Strategies/types/types'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
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
  const [isDepositMode, setIsDepositMode] = useState(true)
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
      const dexProgramid = market.group?.dexProgramId
      const account = await market.client?.getMangoAccount(
        mangoAccountPk,
        dexProgramid!
      )
      const referrerIds = await client?.getReferrerIdsForMangoAccount(account!)
      if (referrerIds) {
        setExistingLinks(referrerIds)
      }
    }
    try {
      if (matchedTreasuryAccount) {
        getRefLinks()
      }
    } catch (e) {
      console.log(e)
    }

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
  const changeMode = (val) => {
    setIsDepositMode(!val)
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
      ? `http://www.devnet.mango.markets/?ref=`
      : `https://www.trade.mango.markets/?ref=`
  return (
    <div className="flex flex-col  w-4/5">
      {matchedTreasuryAccount?.mint?.publicKey.toBase58() === MANGO_MINT ||
        (matchedTreasuryAccount?.mint?.publicKey.toBase58() ===
          MANGO_MINT_DEVNET && (
          <Tab.Group onChange={changeMode}>
            <Tab.List className="flex">
              <Tab
                className={`w-full default-transition font-bold px-4 py-2.5 text-sm focus:outline-none bg-bkg-4 hover:bg-primary-dark rounded-tl-md ${
                  isDepositMode ? 'bg-primary-light text-bkg-2' : ''
                }`}
              >
                Deposit
              </Tab>
              <Tab
                className={`w-full default-transition font-bold px-4 py-2.5 text-sm focus:outline-none bg-bkg-4 hover:bg-primary-dark rounded-tr-md ${
                  !isDepositMode ? 'bg-primary-light text-bkg-2' : ''
                }`}
              >
                Ref link
              </Tab>
            </Tab.List>
          </Tab.Group>
        ))}
      {!isDepositMode ? (
        <div
          className={`p-6 border-fgd-4 border rounded-b-md mb-28 ${
            !filteredTokenGov.length && 'opacity-60 pointer-events-none'
          }`}
        >
          <h2 className="mb-12">
            Create mango referrer link
            {hasMoreThenOneTreasury && (
              <GovernedAccountSelect
                governedAccounts={
                  filteredTokenGov as GovernedMultiTypeAccount[]
                }
                onChange={(selected) => {
                  setMatchedTreasuryAccount(selected)
                }}
                value={matchedTreasuryAccount}
              ></GovernedAccountSelect>
            )}
          </h2>
          <Input
            placeholder={'Link name'}
            value={linkName}
            type="text"
            onChange={(e) => setLinkName(e.target.value)}
          />
          <div className="flex mt-10">
            <span>Your deposits</span>
            <span className="ml-auto">
              {currentPositionFtm} {tokenInfo?.symbol}
            </span>
          </div>
          <Button
            className="w-full mt-5"
            onClick={handleCreateLink}
            disabled={
              currentPosition < minMngoToCreateLink ||
              !connected ||
              !linkName.length
            }
          >
            <Tooltip
              content={
                !connected
                  ? 'Please connect wallet'
                  : currentPosition < minMngoToCreateLink
                  ? 'Please deposit at least 10000 MNGO to create link'
                  : ''
              }
            >
              Create link
            </Tooltip>
          </Button>
          {linkGenerated && (
            <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex items-center mt-3">
              <div>
                <div className="text-xs text-fgd-3">Link</div>
                <div className="text-xs text-fgd-3">
                  {link}
                  {linkName}
                </div>
              </div>
              <div className="ml-auto">
                <LinkButton
                  className="ml-4 text-th-fgd-1"
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
              className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex items-center mt-3"
            >
              <div>
                <div className="text-xs text-fgd-3">Link</div>
                <div className="text-xs text-fgd-3">
                  {link}
                  {x.referrerId}
                </div>
              </div>
              <div className="ml-auto">
                <LinkButton
                  className="ml-4 text-th-fgd-1"
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
      ) : (
        <div
          className={`p-6 border-fgd-4 border rounded-b-md mb-28 ${
            !filteredTokenGov.length && 'opacity-60 pointer-events-none'
          }`}
        >
          <h2 className="mb-12">
            Deposit
            {hasMoreThenOneTreasury && (
              <GovernedAccountSelect
                governedAccounts={
                  filteredTokenGov as GovernedMultiTypeAccount[]
                }
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
              <span className="text-fgd-3 text-xs mr-1">Bal:</span>{' '}
              {maxAmountFtm}
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
      )}
    </div>
  )
}

export default MangoDepositComponent
