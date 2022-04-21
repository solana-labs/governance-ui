import useRealm from '../hooks/useRealm'
import useWalletStore from '../stores/useWalletStore'
import Button from './Button'
import Input from './inputs/Input'
import React, { FunctionComponent, useEffect, useState } from 'react'
import {
  ChatAltIcon,
  MailIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import { EndpointTypes } from '@models/types'

const DelegateCard = () => {
  const router = useRouter()
  const { cluster } = router.query
  const { councilMint, mint, realm } = useRealm()
  const [isLoading, setLoading] = useState<boolean>(false)
  const [hasUnsavedChanges, setUnsavedChanges] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [telegramEnabled, setTelegramEnabled] = useState<boolean>(false)

  // const handleDelegate = async () => {
  //   const signers: Keypair[] = [];
  //   const instructions: TransactionInstruction[] = [];
  //   if (!publicKey) throw new WalletNotConnectedError();

  //   try {
  //     // 1. Fetch all realms
  //     // 2. user selects a realm,
  //     // get program version, programID, public key, and token mints of realm
  //     // 3. Check if user has that token deposited (disable button if not deposited)
  //     // 3. User selects token they want to delegate (council/community)
  //     // 4. Onclick delegate - fire transaction

  //     const programVersion = await getGovernanceProgramVersion(
  //       connection,
  //       selectedRealm.owner // governance program public key
  //     );

  //     withSetGovernanceDelegate(
  //       instructions,
  //       selectedRealm.owner, // publicKey of program/programId
  //       programVersion, // program version of realm
  //       selectedRealm.pubkey, // realm public key
  //       selectedRealm.account.config.councilMint, // mint of governance token
  //       tokenOwnerRecord.account.governingTokenOwner, // governingTokenOwner (walletId) publicKey of for tokenOwnerRecord of this wallet
  //       tokenOwnerRecord.account.governingTokenOwner, // governanceAuthority: publicKey of connected wallet?
  //       new PublicKey(delegatePublicKey) // public key of wallet who to delegated vote to
  //     );

  //     const recentBlockhash = await connection.getRecentBlockhash();

  //     console.log("Instructions??", instructions);
  //     const transaction = new Transaction({
  //       recentBlockhash: recentBlockhash.blockhash,
  //     });

  //     transaction.add(...instructions);
  //     transaction.feePayer = publicKey;
  //     const signature = await sendTransaction(transaction, connection);
  //     await connection.confirmTransaction(signature, "processed");
  //   } catch (error) {
  //     console.log("error", error);
  //   }
  // };

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <h3 className="mb-4">Delegate tokens</h3>
      <div className="text-sm text-th-fgd-1 flex flex-row items-center justify-between mt-4">
        Allow any wallet to vote or create proposals with your deposited Tokens.
      </div>
      <div className="text-sm text-fgd-3">
        This will not allow the delegated wallet to withdraw or send tokens.
      </div>
    </div>
  )
}

export default DelegateCard
