import classNames from 'classnames'

import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import { BigNumber } from 'bignumber.js'
import clsx from 'clsx'
import { useMemo } from 'react'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import {useJoinRealm} from "@hooks/useJoinRealm";
import {Transaction} from "@solana/web3.js";
import useWalletOnePointOh from "@hooks/useWalletOnePointOh";
import {useConnection} from "@solana/wallet-adapter-react";
import Button from "@components/Button";
import {sendTransaction} from "@utils/send";
import {TokenDeposit} from "@components/TokenBalance/TokenDeposit";
import {GoverningTokenRole} from "@solana/spl-governance";
import {useSelectedDelegatorStore} from "../../stores/useSelectedDelegatorStore";
import {GovernanceRole} from "../../@types/types";
import {CalculatedWeight} from "../../VoterWeightPlugins/lib/types";
import {DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN} from "@constants/flags";

interface Props {
  className?: string
  role: GovernanceRole
}

const useVoterWeight = (role: GovernanceRole): CalculatedWeight | undefined => {
  const wallet = useWalletOnePointOh();
  // these hooks return different results depending on whether batch delegator voting is supported
  // if batch is on, and these are undefined, it means "yourself + all delegators"
  // if batch is off, and these are undefined, it means "yourself only"
  // if batch is on, and yourself only is picked, the selectedDelegator will be the current logged-in wallet
  const selectedCommunityDelegator = useSelectedDelegatorStore((s) => s.communityDelegator)
  const selectedCouncilDelegator = useSelectedDelegatorStore((s) => s.councilDelegator)
  const selectedDelegatorForRole = role === 'community' ? selectedCommunityDelegator : selectedCouncilDelegator;
  const votingWallet = (role === 'community' ? selectedCommunityDelegator : selectedCouncilDelegator) ?? wallet?.publicKey

  const { plugins, totalCalculatedVoterWeight, voterWeightForWallet } = useRealmVoterWeightPlugins(role)

  // if the plugin supports delegator batch voting (or no plugins exist on the dao),
  // and no delegator is selected, we can use totalCalculatedVoterWeight
  // otherwise, use the voterWeightForWallet for the correct delegator or the wallet itself
  const lastPlugin = plugins?.voterWeight[plugins.voterWeight.length - 1];
  const supportsBatchVoting = !lastPlugin || DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN[lastPlugin?.name]

  // the user has selected "yourself + all delegators" and the plugin supports batch voting
  if (supportsBatchVoting && !selectedDelegatorForRole) {
    return totalCalculatedVoterWeight;
  }

  // there is no wallet to calculate voter weight for
  if (!votingWallet) return undefined;

  // the user has selected a specific delegator or "yourself only"
  return voterWeightForWallet(votingWallet);
}

export default function PluginVotingPower({ role, className }: Props) {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const {connection} = useConnection();
  const realm = useRealmQuery().data?.result
  const { userNeedsTokenOwnerRecord, userNeedsVoterWeightRecords, handleRegister } = useJoinRealm();
  const mintInfo = useMintInfoByPubkeyQuery(realm?.account.communityMint).data
    ?.result
  const isLoading = useDepositStore((s) => s.state.isLoading)
  const voterWeight = useVoterWeight(role);

  const { isReady } = useRealmVoterWeightPlugins(role)

  const formattedTotal = useMemo(
    () => {
      return mintInfo && voterWeight?.value
          ? new BigNumber(voterWeight?.value.toString())
              .shiftedBy(-mintInfo.decimals)
              .toString()
          : undefined;
    },
    [mintInfo, voterWeight?.value]
  )
  // There are two buttons available on this UI:
  // The Deposit button - available if you have tokens to deposit
  // The Join button - available if you have already deposited tokens (you have a Token Owner Record)
  // but you may not have all your Voter Weight Records yet.
  // This latter case may occur if the DAO changes its configuration and new Voter Weight Records are required.
  // For example if a new plugin is added.
  const showJoinButton = !userNeedsTokenOwnerRecord && userNeedsVoterWeightRecords;

  const join = async () => {
    const instructions = await handleRegister();
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      transaction: transaction,
      wallet: wallet!,
      connection,
      signers: [],
      sendingMessage: `Registering`,
      successMessage: `Registered`,
    })
  }

  if (isLoading || !isReady) {
    return (
      <div
        className={classNames(
          className,
          'rounded-md bg-bkg-1 h-[76px] animate-pulse'
        )}
      />
    )
  }

  return (
    <div className={clsx(className)}>
      <div className={'p-3 rounded-md bg-bkg-1'}>
        <div className="flex items-center justify-between mt-1">
          <div className=" flex flex-col gap-x-2">
            <div className={clsx(className)}>
              <div className={'p-3 rounded-md bg-bkg-1'}>
                <div className="text-fgd-3 text-xs">Votes</div>
                <div className="flex items-center justify-between mt-1">
                  <div className=" flex flex-row gap-x-2">
                    <div className="text-xl font-bold text-fgd-1 hero-text">
                      {formattedTotal ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-fgd-1 hero-text">
              {connected && showJoinButton && (
                  <Button className="w-full" onClick={join}>
                    Join
                  </Button>
              )}
              <TokenDeposit
                  mint={mintInfo}
                  tokenRole={GoverningTokenRole.Community}
                  inAccountDetails={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
