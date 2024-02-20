import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useAsync } from 'react-async-hook'
import { determineVotingPowerType } from '@hooks/queries/governancePower'
import { useConnection } from '@solana/wallet-adapter-react'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import VanillaVotingPower from './Vanilla/VanillaVotingPower'
import { Deposit } from './Vanilla/Deposit'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { ExclamationIcon } from '@heroicons/react/solid'
import VanillaWithdrawTokensButton from '@components/TokenBalance/VanillaWithdrawTokensButton'
import LockedCommunityVotingPower from '@components/ProposalVotingPower/LockedCommunityVotingPower'
import PluginVotingPower from '@components/ProposalVotingPower/PluginVotingPower'
import NftVotingPower from '@components/ProposalVotingPower/NftVotingPower'
import PythVotingPower from '../../PythVotePlugin/components/PythVotingPower'
import LockedCommunityNFTRecordVotingPower from '@components/ProposalVotingPower/LockedCommunityNFTRecordVotingPower'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import {PluginName} from "@constants/plugins";
import {VoterWeightPluginInfo} from "../../VoterWeightPlugins/lib/types";

type VotingPowerDisplayType = PluginName | 'composite';


const usesPluginFn = (plugins: VoterWeightPluginInfo[] | undefined) => (plugin: PluginName) => {
  return plugins?.some((p) => p.name === plugin)
}

export default function GovernancePowerForRole({
  role,
  ...props
}: {
  role: 'community' | 'council'
  hideIfZero?: boolean
  className?: string
}) {
  const { connection } = useConnection()
  const realmPk = useSelectedRealmPubkey()
  const { plugins } = useRealmVoterWeightPlugins(role)
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result

  const usesPlugin = usesPluginFn(plugins)
  const usesNFT = usesPlugin('NFT');
  const usesPyth = usesPlugin('pyth');
    const usesHeliumVSR = usesPlugin('HeliumVSR');
    const usesVSR = usesPlugin('VSR');
    const usesGateway = usesPlugin('gateway');
    const usesQV = usesPlugin('QV');
    const isVanilla = !usesNFT && !usesPyth && !usesHeliumVSR && !usesVSR && !usesGateway && !usesQV;

  console.log("uses:", {
    hideIfZero: props.hideIfZero,
    role,
    plugins,
    usesNFT,
    usesPyth,
    usesHeliumVSR,
    usesVSR,
    usesGateway,
    usesQV,
    isVanilla
  });

  //VSR if dao transited to use plugin and some users have still deposited tokens they should withdraw before
  //depositing to plugin
  const didWithdrawFromVanillaSetup =
    !ownTokenRecord ||
    ownTokenRecord.account.governingTokenDepositAmount.isZero()

  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const { result: kind } = useAsync<VotingPowerDisplayType | undefined>(async () => {
    if (realmPk === undefined) return undefined
    // if there are multiple plugins, show the generic plugin voting power
    if ((plugins?.length ?? 0) > 1) return 'composite';
    return determineVotingPowerType(connection, realmPk, role)
  }, [connection, realmPk, role])

  if (connected && kind === undefined && !props.hideIfZero) {
    return (
      <div className="animate-pulse bg-bkg-1 col-span-1 h-[76px] rounded-lg" />
    )
  }
  return (
    <>
      {role === 'community' ? <>
        {isVanilla && (
              <div>
                <VanillaVotingPower role="community" {...props} />
                <Deposit role="community"/>
              </div>
          )}
            {usesVSR && (
                didWithdrawFromVanillaSetup ? (
                    <LockedCommunityVotingPower />
                ) : (
                    //TODO make a better generic little prompt for when a plugin is used but there are still tokens in vanilla
                    <>
                      <VanillaVotingPower role="community" {...props} />
                      <div className="flex flex-col gap-2">
                        <div>
                          <small className="flex items-center mt-3 text-xs">
                            <ExclamationIcon className="w-5 h-5 mr-2"></ExclamationIcon>
                            Please withdraw your tokens and deposit again to get
                            governance power
                          </small>
                        </div>
                        <div>
                          <VanillaWithdrawTokensButton role={role} />
                        </div>
                      </div>
                    </>
                )
            )}
            {usesNFT && <NftVotingPower />}
            {usesPyth && <PythVotingPower role="community" />}
            {usesHeliumVSR && <LockedCommunityNFTRecordVotingPower />}
            {usesQV && <PluginVotingPower role="community" />}
          </>
          // council
          : kind === 'vanilla' ? (
              <div>
                <VanillaVotingPower role="council" {...props} />
                <Deposit role="council" />
              </div>
          ) : null}
    </>
  )
}
