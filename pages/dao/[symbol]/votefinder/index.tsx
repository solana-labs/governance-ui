import Input from '@components/inputs/Input';
import useQueryContext from '@hooks/useQueryContext';
import useRealm from '@hooks/useRealm';
import { getUnrelinquishedVoteRecords } from '@models/api';
import { getGovernanceAccount, Proposal } from '@solana/spl-governance';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import useWalletStore, { EnhancedProposal } from 'stores/useWalletStore';

const Index = () => {
  const { symbol } = useRealm();
  const { fmtUrlWithCluster } = useQueryContext();
  const { programId, tokenRecords } = useWalletStore(
    (store) => store.selectedRealm,
  );
  const { current: connection } = useWalletStore((store) => store.connection);
  const [ownerWallet, setOwnerWallet] = useState<string>('');
  const [proposals, setProposals] = useState<
    {
      pubkey: PublicKey;
      name: string;
    }[]
  >([]);

  useEffect(() => {
    if (!ownerWallet || !tokenRecords || !programId) {
      return;
    }

    (async () => {
      // Load the proposals the owner have voted on, directly or through delegate

      // Token records related to the owner (it's own or delegated)
      const tokenOwnerRecords = Object.entries(tokenRecords).reduce(
        (
          list,
          [
            tokenOwnerRecord,
            {
              owner,
              account: { governanceDelegate },
            },
          ],
        ) => {
          if (
            owner.toBase58() === ownerWallet ||
            governanceDelegate?.toBase58() === ownerWallet
          ) {
            list.push(new PublicKey(tokenOwnerRecord));
          }

          return list;
        },
        [] as PublicKey[],
      );

      // Load proposals related to token owner records
      const unrelinquishedVoteRecords = (
        await Promise.all(
          tokenOwnerRecords.map((tokenOwnerRecord) =>
            getUnrelinquishedVoteRecords(
              connection,
              programId,
              tokenOwnerRecord,
            ),
          ),
        )
      ).reduce((acc, votes) => [...acc, ...votes], []);

      const proposalsList = unrelinquishedVoteRecords.map(
        (vote) => vote.account.proposal,
      );

      console.log('proposalsList', proposalsList);

      proposalsList.forEach((x, xi) => {
        console.log('Proposal', xi, x.toBase58());
      });

      const proposalInfos = await Promise.all(
        proposalsList.map((proposal) =>
          getGovernanceAccount<EnhancedProposal>(
            connection,
            proposal,
            Proposal,
          ),
        ),
      );

      setProposals(
        proposalInfos.map((info) => ({
          pubkey: info.pubkey,
          name: info.account.name,
        })),
      );
    })();
  }, [ownerWallet, tokenRecords, programId]);

  const openInNewTab = (url: string) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

    if (newWindow) {
      newWindow.opener = null;
    }
  };

  return (
    <div>
      <div className="text-fgd-2 mb-5">
        List the proposals for which a wallet have voted on, either directly,
        either through a delegate
      </div>

      <div className="underline mt-5 mb-5">Wallet</div>

      <Input
        label=""
        value={ownerWallet}
        type="string"
        onChange={(evt) => {
          setOwnerWallet(evt.target.value);
          setProposals([]);
        }}
      />

      <div className="underline mt-5 mb-5">Proposal list</div>
      <div className="flex-col">
        {proposals.length
          ? proposals.map(({ pubkey, name }, index) => {
              return (
                <div
                  key={index}
                  className="border p-2 text-center pointer flex"
                  style={{
                    width: '35em',
                    maxWidth: '35em',
                    minWidth: '35em',
                  }}
                  onClick={() =>
                    openInNewTab(
                      fmtUrlWithCluster(
                        `/dao/${symbol}/proposal/${pubkey.toBase58()}`,
                      ),
                    )
                  }
                >
                  <div className="w-10">#{index + 1}</div>
                  <div className="w-full text-center">{name}</div>
                </div>
              );
            })
          : 'No proposal found'}
      </div>
    </div>
  );
};

export default Index;
