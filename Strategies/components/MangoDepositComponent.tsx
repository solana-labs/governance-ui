import {
  INFO_LEN,
  makeRegisterReferrerIdInstruction,
  MangoAccount,
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
import { abbreviateAddress, precision } from '@utils/formatting'
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
  MANGO_MINT,
  MANGO_MINT_DEVNET,
  tryGetMangoAccount,
} from 'Strategies/protocols/mango/tools'
import useMarketStore, { MarketStore } from 'Strategies/store/marketStore'
import { HandleCreateProposalWithStrategy } from 'Strategies/types/types'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
import ButtonGroup from '@components/ButtonGroup'
import Switch from '@components/Switch'
import Select from '@components/inputs/Select'
const DEPOSIT = 'Deposit'
const CREATE_REF_LINK = 'Create Referral Link'
const DELEGATE_ACCOUNT = 'Delegate'

const minMngoToCreateLink = 10000
const MangoDepositComponent = ({
  handledMint,
  currentPositionFtm,
  currentPosition,
  createProposalFcn,
  mangoAccounts,
}: {
  handledMint: string
  currentPositionFtm: string
  currentPosition: number
  createProposalFcn: HandleCreateProposalWithStrategy
  mangoAccounts: MangoAccount[]
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
  const [
    selectedMangoAccount,
    setSelectedMangoAccount,
  ] = useState<MangoAccount | null>(
    mangoAccounts.length ? mangoAccounts[0] : null
  )
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
  const [delegateDeposit, setDelegateDeposit] = useState(false)
  const [delegateAddress, setDelegateAddress] = useState('')
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
      const mangoAccountPk = selectedMangoAccount!.publicKey
      const account = await tryGetMangoAccount(market, mangoAccountPk)
      if (account) {
        const referrerIds = await client?.getReferrerIdsForMangoAccount(account)
        if (referrerIds) {
          setExistingLinks(referrerIds)
        }
      }
    }
    if (selectedMangoAccount) {
      getRefLinks()
    } else {
      setExistingLinks([])
    }
    if (selectedMangoAccount === null) {
      setProposalType(DEPOSIT)
    }
    setDelegateDeposit(false)
    setDelegateAddress('')
    setLinkName('')
    setAmount(undefined)
  }, [selectedMangoAccount])
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
      const mangoAccountPk = selectedMangoAccount?.publicKey || null
      if (!mangoAccountPk) {
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
        {
          mintAmount,
          delegateDeposit,
          delegateAddress,
          mangoAccountPk,
          mangoAccounts,
        },
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
      const instruction = makeRegisterReferrerIdInstruction(
        programId,
        mangoGroup!.publicKey,
        selectedMangoAccount!.publicKey,
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
  const group = market!.group!
  const depositIndex = group.tokens.findIndex(
    (x) => x.mint.toBase58() === handledMint
  )
  const tabs = [
    { val: DEPOSIT, isVisible: true },
    { val: CREATE_REF_LINK, isVisible: selectedMangoAccount !== null },
    { val: DELEGATE_ACCOUNT, isVisible: selectedMangoAccount !== null },
  ]
    .filter((x) => x.isVisible)
    .map((x) => x.val)
  return (
    <div>
      <Select
        className="mb-3"
        label="Mango account"
        value={
          <MangoAccountItem
            value={selectedMangoAccount}
            market={market}
            depositIndex={depositIndex}
          ></MangoAccountItem>
        }
        placeholder="Please select..."
        onChange={(val) => setSelectedMangoAccount(val)}
      >
        {mangoAccounts.map((value) => (
          <Select.Option key={value.publicKey.toBase58()} value={value}>
            <MangoAccountItem
              value={value}
              market={market}
              depositIndex={depositIndex}
            ></MangoAccountItem>
          </Select.Option>
        ))}
        <Select.Option key={null} value={null}>
          <div>Create new account</div>
        </Select.Option>
      </Select>
      {(matchedTreasuryAccount?.mint?.publicKey.toBase58() === MANGO_MINT ||
        matchedTreasuryAccount?.mint?.publicKey.toBase58() ===
          MANGO_MINT_DEVNET) &&
        currentPosition >= minMngoToCreateLink && (
          <div className="pb-4">
            <ButtonGroup
              activeValue={proposalType}
              className="h-10"
              onChange={(v) => setProposalType(v)}
              values={tabs}
            />
          </div>
        )}
      {proposalType === DELEGATE_ACCOUNT && (
        <div>
          <Input
            label={'Delegate address'}
            value={delegateAddress}
            type="text"
            onChange={(e) => setDelegateAddress(e.target.value)}
          />
          <Button
            className="w-full mt-6"
            onClick={handleDeposit}
            disabled={
              !delegateAddress || !canUseTransferInstruction || isDepositing
            }
          >
            <Tooltip
              content={
                !canUseTransferInstruction
                  ? 'Please connect wallet with enough voting power to create treasury proposals'
                  : !delegateAddress
                  ? 'Please input address'
                  : ''
              }
            >
              {!isDepositing ? 'Propose delegate' : <Loading></Loading>}
            </Tooltip>
          </Button>
        </div>
      )}
      {proposalType === CREATE_REF_LINK && (
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
      )}

      {proposalType === DEPOSIT && (
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
          {selectedMangoAccount === null && (
            <>
              <div className="flex items-center justify-between py-3 text-sm">
                Delegate deposit
                <Switch
                  checked={delegateDeposit}
                  onChange={(checked) => setDelegateDeposit(checked)}
                />
              </div>
              {delegateDeposit && (
                <Input
                  label={'Delegate address'}
                  value={delegateAddress}
                  type="text"
                  onChange={(e) => setDelegateAddress(e.target.value)}
                />
              )}
            </>
          )}
          <div className="border border-fgd-4 p-4 rounded-md mb-6 mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-fgd-3">Current Deposits</span>
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

const MangoAccountItem = ({
  value,
  market,
  depositIndex,
}: {
  value: MangoAccount | null
  market: MarketStore
  depositIndex: number
}) => {
  const group = market!.group!
  return value ? (
    <div className="flex flex-col">
      <div className="text-xs">{abbreviateAddress(value.publicKey)}</div>
      <div className="text-xs">
        Deposit:{' '}
        {new BigNumber(
          value
            .getUiDeposit(
              market.cache!.rootBankCache[depositIndex],
              group,
              depositIndex
            )
            .toNumber()
        ).toFormat()}
      </div>
      {value.delegate.toBase58() && (
        <div>Delegate: {abbreviateAddress(value.delegate)}</div>
      )}
    </div>
  ) : (
    <div>Create new account</div>
  )
}
