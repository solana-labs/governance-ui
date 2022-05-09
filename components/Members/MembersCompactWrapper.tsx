import useRealm from '@hooks/useRealm';
import React, { useEffect } from 'react';
import useMembersListStore from 'stores/useMembersStore';
import { ViewState } from './types';
import MembersItems from './MembersItems';
import useMembers from './useMembers';
import MemberOverview from './MemberOverview';

const MembersCompactWrapper = () => {
  const { symbol } = useRealm();
  const { members, activeMembers } = useMembers();
  const activeMembersCount = activeMembers.length;
  const { resetCompactViewState } = useMembersListStore();
  const currentView = useMembersListStore((s) => s.compact.currentView);
  const totalVotesCast = members.reduce((prev, current) => {
    return prev + current.votesCasted;
  }, 0);

  const getCurrentView = () => {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            <h3 className="mb-4 flex items-center">
              Members ({activeMembersCount})
            </h3>

            <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
              <p className="text-fgd-3 text-xs">Total votes cast</p>

              <h3 className="mb-0">{totalVotesCast}</h3>
            </div>

            <div>
              <MembersItems activeMembers={activeMembers} />
            </div>
          </>
        );
      case ViewState.MemberOverview:
        return <MemberOverview />;
    }
  };

  useEffect(() => {
    resetCompactViewState();
  }, [symbol]);

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">{getCurrentView()}</div>
  );
};

export default MembersCompactWrapper;
