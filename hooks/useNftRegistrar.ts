import {useNftClient} from "../VoterWeightPlugins/useNftClient";
import {NftVoter} from "../idls/nft_voter";
import { IdlAccounts } from '@coral-xyz/anchor';

export const useNftRegistrar = () => {
  const { plugin } = useNftClient();
  return plugin?.params as IdlAccounts<NftVoter>['registrar'] | null;
}
