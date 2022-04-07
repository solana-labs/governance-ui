import Switch from '@components/Switch';
import useRealm from '@hooks/useRealm';
import React from 'react';

const VoteBySwitch = ({ checked, onChange }) => {
  const { toManyCouncilOutstandingProposalsForUse } = useRealm();
  return !toManyCouncilOutstandingProposalsForUse ? (
    <div className="text-sm mb-3 flex">
      <div>Vote by council</div>
      <div className="flex flex-row text-xs items-center ml-3">
        <Switch checked={checked} onChange={onChange} />
      </div>
    </div>
  ) : null;
};

export default VoteBySwitch;
