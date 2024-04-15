import { PublicKey } from '@solana/web3.js'
import ListItem from './ListItem'
import { useTreasurySelectState } from '@components/treasuryV2/Details/treasurySelectStore'
import mainnetBetaRealms from 'public/realms/mainnet-beta.json'
import { useTokenOwnerRecordByPubkeyQuery } from '@hooks/queries/tokenOwnerRecord'
import { UserGroupIcon } from '@heroicons/react/solid'

interface Props {
  className?: string
  pubkey: PublicKey
  governance: PublicKey
}

/**
 * CURRENTLY NOT USED
 * This was from work by Serum for intra-dao voting. As of Sep 29, 2023, it has no known users.
 * In my (Agrippa's) opinion, a treasury-based flow for intra-dao voting is inferior to a generic
 * wallet extension for the browser for building proposals using the same UI that normal users use to interact.
 * (In the vein of Cordelia or Fuze wallet, or whatever the Squads thing is called)
 */
export default function TokenOwnerRecordListItem({
  pubkey,
  governance,
  ...props
}: Props) {
  const [selected, setSelected] = useTreasurySelectState()

  const tor = useTokenOwnerRecordByPubkeyQuery(pubkey).data?.result

  const realmInfo = mainnetBetaRealms.find(
    (x) => x.realmId === tor?.account.realm.toString()
  )

  return tor === undefined ? (
    <>{/*TODO loading*/} </>
  ) : (
    <ListItem
      className={props.className}
      name={realmInfo?.symbol ?? 'Unknown'}
      rhs={<></>}
      selected={
        selected?._kind === 'TokenOwnerRecord' &&
        selected.pubkey === pubkey.toString()
      }
      onSelect={() =>
        setSelected({
          _kind: 'TokenOwnerRecord',
          selectedGovernance: governance.toString(),
          pubkey: pubkey.toString(),
        })
      }
      thumbnail={
        realmInfo?.ogImage ? (
          <img
            src={realmInfo?.ogImage}
            alt={realmInfo?.symbol ?? 'Unknown'}
            className="h-6 w-auto"
          />
        ) : (
          <UserGroupIcon className="h-6 w-6" />
        )
      }
    />
  )
}
