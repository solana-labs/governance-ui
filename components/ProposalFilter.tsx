import { useEffect, useReducer } from 'react';
import styled from '@emotion/styled';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { Disclosure } from '@headlessui/react';
import Switch from './Switch';
import { EnhancedProposalState } from 'stores/useWalletStore';

type Filters = {
  [key in EnhancedProposalState]: boolean;
};

const initialFilterSettings: Filters = {
  [EnhancedProposalState.Draft]: false,
  [EnhancedProposalState.SigningOff]: true,
  [EnhancedProposalState.Voting]: true,
  [EnhancedProposalState.Succeeded]: true,
  [EnhancedProposalState.Executing]: true,
  [EnhancedProposalState.Completed]: true,
  [EnhancedProposalState.Cancelled]: false,
  [EnhancedProposalState.Defeated]: true,
  [EnhancedProposalState.ExecutingWithErrors]: true,
};

const StyledAlertCount = styled.span`
  font-size: 0.6rem;
`;

const ProposalFilter = ({ filters, setFilters }) => {
  const [filterSettings, setFilterSettings] = useReducer<
    (state: Filters, newState: Partial<Filters>) => any
  >((state, newState) => ({ ...state, ...newState }), initialFilterSettings);

  const handleFilters = (
    proposalState: EnhancedProposalState,
    checked: boolean,
  ) => {
    setFilterSettings({
      [proposalState]: checked,
    });

    if (!checked) {
      setFilters([...filters, proposalState]);
    } else {
      setFilters(
        filters.filter((n: EnhancedProposalState) => n !== proposalState),
      );
    }
  };

  useEffect(() => {
    const initialFilters = Object.keys(initialFilterSettings)
      .filter((x) => !initialFilterSettings[x])
      .map(Number);

    setFilters([...initialFilters]);
  }, []);
  return (
    <Disclosure as="div" className="relative">
      {({ open }) => (
        <>
          <Disclosure.Button
            className={`default-transition font-normal pl-3 pr-2 py-2.5 ring-1 ring-fgd-3 rounded-md text-fgd-1 text-sm hover:bg-bkg-3 focus:outline-none`}
          >
            {filters.length > 0 ? (
              <div className="absolute -top-3 -right-1.5 z-20">
                <StyledAlertCount className="w-4 h-4 bg-red relative inline-flex rounded-full flex items-center justify-center">
                  {filters.length}
                </StyledAlertCount>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              Filter
              <ChevronDownIcon
                className={`default-transition h-5 w-5 ml-1 text-primary-light ${
                  open ? 'transform rotate-180' : 'transform rotate-360'
                }`}
              />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel
            className={`bg-bkg-1 border border-fgd-4 mt-2 p-4 absolute right-0 w-56 z-20 rounded-md text-xs`}
          >
            <div>
              <div className="flex items-center justify-between pb-2">
                Cancelled
                <Switch
                  checked={filterSettings[EnhancedProposalState.Cancelled]}
                  onChange={(checked) =>
                    handleFilters(EnhancedProposalState.Cancelled, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Completed
                <Switch
                  checked={filterSettings[EnhancedProposalState.Completed]}
                  onChange={(checked) =>
                    handleFilters(EnhancedProposalState.Completed, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Defeated
                <Switch
                  checked={filterSettings[EnhancedProposalState.Defeated]}
                  onChange={(checked) =>
                    handleFilters(EnhancedProposalState.Defeated, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Draft
                <Switch
                  checked={filterSettings[EnhancedProposalState.Draft]}
                  onChange={(checked) =>
                    handleFilters(EnhancedProposalState.Draft, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Executing
                <Switch
                  checked={filterSettings[EnhancedProposalState.Executing]}
                  onChange={(checked) =>
                    handleFilters(EnhancedProposalState.Executing, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                ExecutingWithErrors
                <Switch
                  checked={
                    filterSettings[EnhancedProposalState.ExecutingWithErrors]
                  }
                  onChange={(checked) =>
                    handleFilters(
                      EnhancedProposalState.ExecutingWithErrors,
                      checked,
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                SigningOff
                <Switch
                  checked={filterSettings[EnhancedProposalState.SigningOff]}
                  onChange={(checked) =>
                    handleFilters(EnhancedProposalState.SigningOff, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Succeeded
                <Switch
                  checked={filterSettings[EnhancedProposalState.Succeeded]}
                  onChange={(checked) =>
                    handleFilters(EnhancedProposalState.Succeeded, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                Voting
                <Switch
                  checked={filterSettings[EnhancedProposalState.Voting]}
                  onChange={(checked) =>
                    handleFilters(EnhancedProposalState.Voting, checked)
                  }
                />
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default ProposalFilter;
