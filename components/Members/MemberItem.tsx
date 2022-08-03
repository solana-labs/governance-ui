import { UserCircleIcon, LogoutIcon } from '@heroicons/react/outline';
import useRealm from '@hooks/useRealm';
import { tryParsePublicKey } from '@tools/core/pubkey';
import { fmtMintAmount } from '@tools/sdk/units';
import { abbreviateAddress } from '@utils/formatting';
import tokenService from '@utils/services/token';
import useMembersListStore from 'stores/useMembersStore';
import { ViewState } from './types';
import { useMemo } from 'react';
import { Member } from '@utils/uiTypes/members';

const MemberItem = ({ item }: { item: Member }) => {
  const { mint, councilMint, realm } = useRealm();
  const {
    setCurrentCompactView,
    setCurrentCompactViewMember,
  } = useMembersListStore();
  const {
    walletAddress,
    councilVotes,
    communityVotes,
    votesCasted,
    hasCouncilTokenOutsideRealm,
    hasCommunityTokenOutsideRealm,
  } = item;

  const walletPublicKey = tryParsePublicKey(walletAddress);
  const tokenName = realm
    ? tokenService.getTokenInfo(realm?.account.communityMint.toBase58())?.symbol
    : '';
  const totalVotes = votesCasted;
  const communityAmount =
    communityVotes && !communityVotes.isZero()
      ? useMemo(() => fmtMintAmount(mint, communityVotes), [item.walletAddress])
      : null;
  const councilAmount =
    councilVotes && !councilVotes.isZero()
      ? useMemo(() => fmtMintAmount(councilMint, councilVotes), [
          item.walletAddress,
        ])
      : null;

  const walletAddressFormatted = walletPublicKey
    ? abbreviateAddress(walletPublicKey)
    : '-';

  async function handleGoToMemberOverview() {
    setCurrentCompactView(ViewState.MemberOverview);
    setCurrentCompactViewMember(item);
  }

  return (
    <div
      onClick={handleGoToMemberOverview}
      className="cursor-pointer default-transition flex items-start text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3"
    >
      <div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-8 rounded-full w-8 mr-2">
        <UserCircleIcon className="h-6 text-fgd-3 w-6" />
      </div>
      <div>
        <div className="text-xs text-th-fgd-1">{walletAddressFormatted}</div>
        <div className="text-fgd-3 text-xs flex flex-col">
          Votes cast: {totalVotes}
        </div>
        <div className="text-fgd-3 text-xs flex flex-col">
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
  );
};

export default MemberItem;
