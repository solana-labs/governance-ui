import { PublicKey } from '@solana/web3.js'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import {
  AccountMetaData,
  BPF_UPGRADE_LOADER_ID,
  Proposal,
  ProposalTransaction,
} from '@solana/spl-governance'
import {
  ALL_CASTLE_PROGRAMS,
  getAccountName,
  getInstructionDescriptor,
  InstructionDescriptor,
  WSOL_MINT,
} from './tools'
import React, { useEffect, useRef, useState } from 'react'
import useWalletStore from '../../stores/useWalletStore'
import { getExplorerUrl } from '../explorer/tools'
import { getProgramName, isNativeSolanaProgram } from './programs/names'
import { tryGetTokenAccount } from '@utils/tokens'
import { ExecuteInstructionButton, PlayState } from './ExecuteInstructionButton'
import { ProgramAccount } from '@solana/spl-governance'
import InspectorButton from '@components/explorer/inspectorButton'
import { FlagInstructionErrorButton } from './FlagInstructionErrorButton'
import axios from 'axios'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import tokenPriceService from '@utils/services/tokenPrice'
import InstructionOptionInput, {
  InstructionOption,
  InstructionOptions,
} from '@components/InstructionOptions'
import StreamCard from '@components/StreamCard'
import { Metaplex, findMetadataPda } from '@metaplex-foundation/js'
import { ConnectionContext } from '@utils/connection'
import { abbreviateAddress } from '@utils/formatting'

export default function InstructionCard({
  index,
  proposal,
  proposalInstruction,
}: {
  index: number
  proposal: ProgramAccount<Proposal>
  proposalInstruction: ProgramAccount<ProposalTransaction>
}) {
  const {
    nftsGovernedTokenAccounts,
    governedTokenAccountsWithoutNfts,
  } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const realm = useWalletStore((s) => s.selectedRealm.realm)
  const [descriptor, setDescriptor] = useState<InstructionDescriptor>()
  const [instructionOption, setInstructionOption] = useState<InstructionOption>(
    InstructionOptions.none
  )

  const [playing, setPlaying] = useState(
    proposalInstruction.account.executedAt
      ? PlayState.Played
      : PlayState.Unplayed
  )
  const [nftImgUrl, setNftImgUrl] = useState('')
  const [tokenImgUrl, setTokenImgUrl] = useState('')

  const allProposalPrograms = proposalInstruction.account.instructions
    ?.map((i) => i.programId.toBase58())
    .flat()

  useEffect(() => {
    getInstructionDescriptor(
      connection,
      proposalInstruction.account.getSingleInstruction(),
      realm
    ).then((d) => setDescriptor(d))
    const getAmountImg = async () => {
      const sourcePk = proposalInstruction.account.getSingleInstruction()
        .accounts[0].pubkey
      const tokenAccount = await tryGetTokenAccount(
        connection.current,
        sourcePk
      )
      const isSol = governedTokenAccountsWithoutNfts.find(
        (x) => x.extensions.transferAddress?.toBase58() === sourcePk.toBase58()
      )?.isSol
      const isNFTAccount = nftsGovernedTokenAccounts.find(
        (x) =>
          x.extensions.transferAddress?.toBase58() ===
            tokenAccount?.account.owner.toBase58() ||
          x.governance.pubkey.toBase58() ===
            tokenAccount?.account.owner.toBase58()
      )
      if (isNFTAccount) {
        const mint = tokenAccount?.account.mint
        if (mint) {
          try {
            const metaplex = new Metaplex(connection.current)
            const metadataPDA = findMetadataPda(mint)
            const tokenMetadata = await metaplex.nfts().findByMetadata({
              metadata: metadataPDA,
            })

            const url = (await axios.get(tokenMetadata.uri)).data
            setNftImgUrl(url.image)
          } catch (e) {
            console.log(e)
          }
        }
        return
      }

      if (isSol) {
        const info = tokenPriceService.getTokenInfo(WSOL_MINT)
        const imgUrl = info?.logoURI ? info.logoURI : ''
        setTokenImgUrl(imgUrl)
        return
      }
      const mint = tokenAccount?.account.mint
      if (mint) {
        const info = tokenPriceService.getTokenInfo(mint.toBase58())
        const imgUrl = info?.logoURI ? info.logoURI : ''
        setTokenImgUrl(imgUrl)
      }
      return
    }
    getAmountImg()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    proposalInstruction,
    governedTokenAccountsWithoutNfts.length,
    realm?.pubkey.toBase58(),
  ])
  const isSol = tokenImgUrl.includes(WSOL_MINT)

  return (
    <div className="break-all">
      <h3 className="mb-4 flex">
        {`Instruction ${index} `}
        {descriptor?.name && `– ${descriptor.name}`}{' '}
        {tokenImgUrl && (
          <img
            className={`w-5 h-5 ml-2 ${isSol && 'rounded-full'}`}
            src={tokenImgUrl}
          ></img>
        )}
      </h3>
      <InstructionProgram
        connection={connection}
        programId={proposalInstruction.account.getSingleInstruction().programId}
      ></InstructionProgram>
      <div className="border-b border-bkg-4 mb-6">
        {proposalInstruction.account
          .getSingleInstruction()
          .accounts.map((am, idx) => (
            <InstructionAccount
              endpoint={connection.endpoint}
              key={idx}
              index={idx}
              accountMeta={am}
              descriptor={descriptor}
            />
          ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        {descriptor?.dataUI.props ? (
          <div className="font-bold text-sm">Data</div>
        ) : (
          ''
        )}
      </div>

      {nftImgUrl ? (
        <div className="flex justify-between mb-2">
          <div
            style={{ width: '150px', height: '150px' }}
            className="flex items-center overflow-hidden"
          >
            <img src={nftImgUrl}></img>
          </div>
          <InstructionData descriptor={descriptor}></InstructionData>
        </div>
      ) : (
        <InstructionData descriptor={descriptor}></InstructionData>
      )}
      {descriptor?.name == 'Streamflow: Create' && (
        <StreamCard
          connection={connection.current}
          accounts={proposalInstruction.account.getSingleInstruction().accounts}
        />
      )}
      <div className="flex justify-end items-center gap-x-4 mt-6 mb-8">
        <InspectorButton proposalInstruction={proposalInstruction} />

        <FlagInstructionErrorButton
          playState={playing}
          proposal={proposal}
          proposalInstruction={proposalInstruction}
        />

        {proposal && (
          <React.Fragment>
            <ExecuteInstructionButton
              proposal={proposal}
              proposalInstruction={proposalInstruction}
              playing={playing}
              setPlaying={setPlaying}
              instructionOption={instructionOption}
            />
            {/* Show execution option if the proposal contains a specified program id and
                proposal has not executed already. */}
            {allProposalPrograms?.filter((a) =>
              ALL_CASTLE_PROGRAMS.map((a) => a.toBase58()).includes(a)
            ).length > 0 &&
              playing != PlayState.Played && (
                <InstructionOptionInput
                  value={instructionOption}
                  setValue={setInstructionOption}
                />
              )}
          </React.Fragment>
        )}
      </div>
    </div>
  )
}

export function InstructionProgram({
  connection,
  programId,
}: {
  connection: ConnectionContext
  programId: PublicKey
}) {
  const isNativeSolProgram = isNativeSolanaProgram(programId)
  const [isAnchorVerified, setIsAnchorVerified] = useState(false)
  const [isUpgradeable, setIsUpgradeable] = useState(false)
  const [authority, setAuthority] = useState('')
  const programLabel = getProgramName(programId)
  useEffect(() => {
    const tryGetProgramInfo = async (programId: PublicKey) => {
      try {
        const programAccount = await connection.current.getParsedAccountInfo(
          programId
        )
        const programInfo = await connection.current.getParsedAccountInfo(
          new PublicKey(programAccount.value?.data['parsed']?.info?.programData)
        )
        const info = programInfo.value?.data['parsed']?.info
        const authority = info.authority
        const isUpgradeable =
          programInfo.value?.owner?.equals(BPF_UPGRADE_LOADER_ID) && authority
        setIsUpgradeable(isUpgradeable)
        setAuthority(authority)
        const deploymentSlot = info.slot
        tryGetAnchorInfo(programId, deploymentSlot)
        // eslint-disable-next-line no-empty
      } catch {}
    }
    const tryGetAnchorInfo = async (
      programId: PublicKey,
      lastDeploymentSlot: number
    ) => {
      try {
        const apiUrl = `https://api.apr.dev/api/v0/program/${programId.toBase58()}/latest?limit=5`
        const resp = await axios.get(apiUrl)
        const isLastVersionVerified = resp.data[0].verified === 'Verified'
        const lastDeploymentSlotMatch =
          resp.data[0].verified_slot === lastDeploymentSlot
        setIsAnchorVerified(isLastVersionVerified && lastDeploymentSlotMatch)
        // eslint-disable-next-line no-empty
      } catch {}
    }
    if (connection.cluster === 'mainnet' && !isNativeSolProgram) {
      tryGetProgramInfo(programId)
    }
  }, [programId, connection, isNativeSolProgram])
  return (
    <div className="border-t border-bkg-4 flex flex-col lg:flex-row lg:items-center lg:justify-between py-3">
      <span className="font-bold text-fgd-1 text-sm">
        <div>Program</div>
        {authority && (
          <a
            href={`https://explorer.solana.com/address/${authority}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="text-[10px] text-link">
              Authority: {abbreviateAddress(authority)}
            </div>
            <div className="text-[10px]">
              Upgradeable: {isUpgradeable ? 'Yes' : 'No'}
            </div>
          </a>
        )}
        {!isNativeSolProgram && (
          <div className="text-primary-light text-[10px]">
            Anchor: {isAnchorVerified ? 'Verified' : 'Unverified'}
          </div>
        )}
      </span>
      <div className="flex items-center pt-1 lg:pt-0">
        <a
          className="text-sm hover:brightness-[1.15] focus:outline-none flex items-center"
          href={getExplorerUrl(connection.endpoint, programId)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div>
            {programId.toBase58()}
            {programLabel && (
              <div className="mt-1 text-fgd-3 lg:text-right text-xs">
                {programLabel}
              </div>
            )}
            <div></div>
          </div>
          <ExternalLinkIcon
            className={`flex-shrink-0 h-4 w-4 ml-2 text-primary-light`}
          />
        </a>
      </div>
    </div>
  )
}

export function InstructionAccount({
  endpoint,
  index,
  accountMeta,
  descriptor,
}: {
  endpoint: string
  index: number
  accountMeta: AccountMetaData
  descriptor: InstructionDescriptor | undefined
}) {
  const connection = useWalletStore((s) => s.connection)
  const [accountLabel, setAccountLabel] = useState(
    getAccountName(accountMeta.pubkey)
  )
  const isFetching = useRef(false)

  useEffect(() => {
    if (!accountLabel && !isFetching.current) {
      isFetching.current = true
      // Check if the account is SPL token account and if yes then display its owner
      tryGetTokenAccount(connection.current, accountMeta.pubkey).then((ta) => {
        if (ta) {
          setAccountLabel(`owner: ${ta?.account.owner.toBase58()}`)
        }
        isFetching.current = false
      })
      // TODO: Extend to other well known account types
    }
  }, [accountLabel, accountMeta.pubkey, connection])

  return (
    <div className="border-t border-bkg-4 flex flex-col lg:flex-row lg:items-center lg:justify-between py-3">
      <div className="pb-1 lg:pb-0">
        <p className="font-bold text-fgd-1">{`Account ${index + 1}`}</p>
        {descriptor?.accounts && (
          <div className="my-0.5 text-fgd-3 text-xs">
            {descriptor.accounts[index]?.name}
          </div>
        )}
        <div className="text-[10px] flex space-x-3">
          {accountMeta.isSigner && (
            <div className="text-primary-light">Signer</div>
          )}{' '}
          {accountMeta.isWritable && (
            <div className="text-[#b45be1]">Writable</div>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <a
          className="text-sm hover:brightness-[1.15] focus:outline-none flex items-center"
          href={getExplorerUrl(endpoint, accountMeta.pubkey)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div>
            <div>{accountMeta.pubkey.toBase58()}</div>
            <div></div>
            {accountLabel && (
              <div className="mt-0.5 text-fgd-3 text-right text-xs">
                {accountLabel}
              </div>
            )}
          </div>
          <ExternalLinkIcon
            className={`flex-shrink-0 h-4 w-4 ml-2 text-primary-light`}
          />
        </a>
      </div>
    </div>
  )
}

export function InstructionData({
  descriptor,
}: {
  descriptor: InstructionDescriptor | undefined
}) {
  return (
    <div>
      <span className="break-all font-display text-fgd-1 text-xs">
        {descriptor?.dataUI}
      </span>
    </div>
  )
}
