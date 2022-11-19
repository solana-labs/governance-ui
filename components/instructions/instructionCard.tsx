import { PublicKey } from '@solana/web3.js'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import {
  AccountMetaData,
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
import React, { useEffect, useState } from 'react'
import useWalletStore from '../../stores/useWalletStore'
import { getExplorerUrl } from '../explorer/tools'
import { getProgramName } from './programs/names'
import { tryGetTokenAccount } from '@utils/tokens'
import { ExecuteInstructionButton, PlayState } from './ExecuteInstructionButton'
import { ProgramAccount } from '@solana/spl-governance'
import InspectorButton from '@components/explorer/inspectorButton'
import { FlagInstructionErrorButton } from './FlagInstructionErrorButton'
import axios from 'axios'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import tokenService from '@utils/services/token'
import InstructionOptionInput, {
  InstructionOption,
  InstructionOptions,
} from '@components/InstructionOptions'
import StreamCard from '@components/StreamCard'
import { Metaplex, findMetadataPda } from '@metaplex-foundation/js'

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
      proposalInstruction.account.getSingleInstruction()
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
        const info = tokenService.getTokenInfo(WSOL_MINT)
        const imgUrl = info?.logoURI ? info.logoURI : ''
        setTokenImgUrl(imgUrl)
        return
      }
      const mint = tokenAccount?.account.mint
      if (mint) {
        const info = tokenService.getTokenInfo(mint.toBase58())
        const imgUrl = info?.logoURI ? info.logoURI : ''
        setTokenImgUrl(imgUrl)
      }
      return
    }
    getAmountImg()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [proposalInstruction, governedTokenAccountsWithoutNfts.length])
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
        endpoint={connection.endpoint}
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
  endpoint,
  programId,
}: {
  endpoint: string
  programId: PublicKey
}) {
  const programLabel = getProgramName(programId)
  return (
    <div className="border-t border-bkg-4 flex flex-col lg:flex-row lg:items-center lg:justify-between py-3">
      <span className="font-bold text-fgd-1 text-sm">Program</span>
      <div className="flex items-center pt-1 lg:pt-0">
        <a
          className="text-sm hover:brightness-[1.15] focus:outline-none flex items-center"
          href={getExplorerUrl(endpoint, programId)}
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

  if (!accountLabel) {
    // Check if the account is SPL token account and if yes then display its owner
    tryGetTokenAccount(connection.current, accountMeta.pubkey).then((ta) => {
      if (ta) {
        setAccountLabel(`owner: ${ta?.account.owner.toBase58()}`)
      }
    })
    // TODO: Extend to other well known account types
  }

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
            <div className="text-primary-light">Writable</div>
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
