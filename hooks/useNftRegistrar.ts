import {useEffect, useState} from 'react'
import {useNftClient} from "../VoterWeightPlugins/useNftClient";
import {useRealmQuery} from "@hooks/queries/realm";

export const useNftRegistrar = () => {
  const realm = useRealmQuery().data?.result;
  const { nftClient } = useNftClient();
  const [ registrar, setRegistrar ] = useState<any>();

  useEffect(() => {
    if (realm && nftClient) {
      nftClient.getRegistrarAccount(realm.pubkey, realm.account.communityMint).then(setRegistrar);
    }
  }, [realm, nftClient]);

  return registrar;
}
