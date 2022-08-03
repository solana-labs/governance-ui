import { getExplorerUrl } from '@components/explorer/tools';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  LogoutIcon,
  UserCircleIcon,
  XCircleIcon,
} from '@heroicons/react/outline';
import useQueryContext from '@hooks/useQueryContext';
import useRealm from '@hooks/useRealm';
import { getVoteRecordsByVoterMapByProposal } from '@models/api';
import { isYesVote } from '@models/voteRecords';
import { GOVERNANCE_CHAT_PROGRAM_ID, VoteRecord } from '@solana/spl-governance';
import { ChatMessage, ProgramAccount } from '@solana/spl-governance';
import { getGovernanceChatMessagesByVoter } from '@solana/spl-governance';

import { PublicKey } from '@solana/web3.js';
import { tryParsePublicKey } from '@tools/core/pubkey';
import { accountsToPubkeyMap } from '@tools/sdk/accounts';
import { fmtMintAmount } from '@tools/sdk/units';
import { notify } from '@utils/notifications';
import { abbreviateAddress } from '@utils/formatting';

import tokenService from '@utils/services/token';
import React, { useEffect, useMemo, useState } from 'react';
import useMembersListStore from 'stores/useMembersStore';
import useWalletStore from 'stores/useWalletStore';
import { ViewState, WalletTokenRecordWithProposal } from './types';

const MemberOverview = () => {
  const { realm } = useRealm();
  const member = useMembersListStore((s) => s.compact.currentMember);
  const connection = useWalletStore((s) => s.connection);
  const selectedRealm = useWalletStore((s) => s.selectedRealm);
  const { mint, councilMint, proposals, symbol } = useRealm();
  const {
    setCurrentCompactView,
    resetCompactViewState,
  } = useMembersListStore();
  const { fmtUrlWithCluster } = useQueryContext();
  const [ownVoteRecords, setOwnVoteRecords] = useState<
    WalletTokenRecordWithProposal[]
  >([]);

  const {
    walletAddress,
    councilVotes,
    communityVotes,
    votesCasted,
    hasCommunityTokenOutsideRealm,
    hasCouncilTokenOutsideRealm,
  } = member!;
  const walletPublicKey = tryParsePublicKey(walletAddress);
  const tokenName = realm
    ? tokenService.getTokenInfo(realm?.account.communityMint.toBase58())?.symbol
    : '';
  const totalVotes = votesCasted;
  const communityAmount =
    communityVotes && !communityVotes.isZero()
      ? useMemo(() => fmtMintAmount(mint, communityVotes), [
          member!.walletAddress,
        ])
      : null;
  const councilAmount =
    councilVotes && !councilVotes.isZero()
      ? useMemo(() => fmtMintAmount(councilMint, councilVotes), [
          member!.walletAddress,
        ])
      : null;

  const walletAddressFormatted = walletPublicKey
    ? abbreviateAddress(walletPublicKey)
    : '-';

  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView);
    resetCompactViewState();
  };
  const getVoteRecordsAndChatMsgs = async () => {
    let voteRecords: { [pubKey: string]: ProgramAccount<VoteRecord> } = {};
    let chatMessages: { [pubKey: string]: ProgramAccount<ChatMessage> } = {};
    try {
      const results = await Promise.all([
        getVoteRecordsByVoterMapByProposal(
          connection.current,
          selectedRealm!.programId!,
          new PublicKey(member!.walletAddress),
        ),
        getGovernanceChatMessagesByVoter(
          connection!.current,
          GOVERNANCE_CHAT_PROGRAM_ID,
          new PublicKey(member!.walletAddress),
        ),
      ]);
      voteRecords = results[0];
      chatMessages = accountsToPubkeyMap(results[1]);
    } catch (e) {
      notify({
        message: 'Unable to fetch vote records for selected wallet address',
        type: 'error',
      });
    }
    return { voteRecords, chat: chatMessages };
  };
  useEffect(() => {
    //we get voteRecords sorted by proposal date and match it with proposal name and chat msgs leaved by token holder.
    const handleSetVoteRecords = async () => {
      const { voteRecords, chat } = await getVoteRecordsAndChatMsgs();
      const voteRecordsArray: WalletTokenRecordWithProposal[] = Object.keys(
        voteRecords,
      )
        .sort((a, b) => {
          const prevProposal = proposals[a];
          const nextProposal = proposals[b];
          return (
            prevProposal?.account.getStateTimestamp() -
            nextProposal?.account.getStateTimestamp()
          );
        })
        .reverse()
        .filter((x) => proposals[x])
        .flatMap((x) => {
          const currentProposal = proposals[x];
          const currentChatsMsgPk = Object.keys(chat).filter(
            (c) =>
              chat[c]?.account.proposal.toBase58() ===
              currentProposal?.pubkey.toBase58(),
          );
          const currentChatMsgs = currentChatsMsgPk.map(
            (c) => chat[c].account.body.value,
          );
          return {
            proposalPublicKey: x,
            proposalName: currentProposal?.account.name,
            chatMessages: currentChatMsgs,
            ...voteRecords[x],
          };
        });

      setOwnVoteRecords(voteRecordsArray);
    };
    handleSetVoteRecords();
  }, [walletAddress]);

  return (
    <>
      <h3 className="mb-4 flex items-center hover:cursor-pointer">
        <>
          <ArrowLeftIcon
            onClick={handleGoBackToMainView}
            className="h-4 w-4 mr-1 text-primary-light mr-2"
          />
          {walletAddressFormatted}
          <a
            href={
              walletAddress
                ? getExplorerUrl(connection.endpoint, walletAddress)
                : ''
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
          </a>
        </>
      </h3>
      <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex items-center">
        <UserCircleIcon className="h-6 text-fgd-3 w-6 mr-2.5" />
        <div>
          <div className="text-fgd-3 text-xs flex flex-col">
            Votes cast: {totalVotes}
          </div>
          <div className="text-fgd-3 text-xs flex flex-row">
            {(communityAmount || !councilAmount) && (
              <span className="flex items-center">
                {tokenName} Votes {communityAmount || 0}
                {hasCommunityTokenOutsideRealm && (
                  <LogoutIcon className="w-3 h-3 ml-1"></LogoutIcon>
                )}
              </span>
            )}
            {councilAmount && (
              <span className="flex items-center">
                Council Votes {councilAmount}{' '}
                {hasCouncilTokenOutsideRealm && (
                  <LogoutIcon className="w-3 h-3 ml-1"></LogoutIcon>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="font-normal mr-1 text-xs text-fgd-3 mb-4 mt-4">
        Recent votes
      </div>
      <div style={{ maxHeight: '350px' }} className="overflow-auto">
        {ownVoteRecords.map((x) => (
          <a
            href={fmtUrlWithCluster(
              `/dao/${symbol}/proposal/${x.proposalPublicKey}`,
            )}
            rel="noopener noreferrer"
            className="border border-fgd-4 default-transition rounded-lg hover:bg-bkg-3 css-1ug690d-StyledCardWrapepr elzt7lo0 p-4 text-xs text-th-fgd-1 mb-2 flex"
            key={x.proposalPublicKey}
          >
            <div className="w-full pr-6">
              <div className="break-all mb-2">
                {x.proposalName.slice(0, 30)}
                {x.proposalName.length > 30 ? '...' : ''}
              </div>
              {x.chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`text-xs text-fgd-3 text-xs p-2 border-t border-fgd-4`}
                >
                  {msg}
                </div>
              ))}
            </div>
            <div className="ml-auto text-fgd-3 text-xs flex flex-col">
              {isYesVote(x.account) ? (
                <CheckCircleIcon className="h-4 mr-1 text-green w-4" />
              ) : (
                <XCircleIcon className="h-4 mr-1 text-red w-4" />
              )}
            </div>
          </a>
        ))}
      </div>
    </>
  );
};

export default MemberOverview;
