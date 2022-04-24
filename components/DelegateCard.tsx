import useRealm from '../hooks/useRealm'
import useWalletStore from '../stores/useWalletStore'
import React, { useEffect, useState } from 'react'
import {
  Transaction,
  TransactionInstruction,
  Keypair,
  PublicKey,
} from '@solana/web3.js'
import {
  withSetGovernanceDelegate,
  getGovernanceProgramVersion,
} from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'

import Button from './Button'

import useMembersStore from 'stores/useMembersStore'

const DelegateCard = () => {
  const { councilMint, mint, realm } = useRealm()
  const [isLoading, setLoading] = useState<boolean>(false)
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)
  const [delegateKey, setDelegateKey] = useState(
    '4warKVthQCTP1LmhKyJQHJGb1jvCUrzVnVhmA8pxE3Nt'
  )

  const activeMembers = useMembersStore((s) => s.compact.activeMembers)

  console.log('ACTIVE MEMBERS', activeMembers)
  console.log('realm', realm)
  console.log('wallet', wallet)
  console.log('My public key', wallet?.publicKey?.toBase58())
  console.log('council mint', councilMint)

  const handleDelegate = async () => {
    const signers: Keypair[] = []
    const instructions: TransactionInstruction[] = []
    setLoading(true)
    console.log('Attempt delegate')
    if (!realm || !realm?.account?.config?.councilMint || !wallet?.publicKey) {
      return
    }
    // twitter wallet: 4warKVthQCTP1LmhKyJQHJGb1jvCUrzVnVhmA8pxE3Nt
    // twitch wallet: 5YWDXAX1xygHp4t7wjmPzzfWuybEuKWmd3ojUBnJtkxq
    try {
      const programVersion = await getGovernanceProgramVersion(
        connection,
        realm.owner // governance program public key
      )
      withSetGovernanceDelegate(
        instructions,
        realm.owner, // publicKey of program/programId
        programVersion, // program version of realm
        realm.pubkey, // realm public key
        realm?.account?.config?.councilMint, // mint of governance token
        wallet?.publicKey, // governingTokenOwner (walletId) publicKey of for tokenOwnerRecord of this wallet
        wallet?.publicKey, // governanceAuthority: publicKey of connected wallet
        new PublicKey(delegateKey) // public key of wallet who to delegated vote to
      )
      const recentBlockhash = await connection.getRecentBlockhash()
      const transaction = new Transaction({
        recentBlockhash: recentBlockhash.blockhash,
      })
      transaction.add(...instructions)
      transaction.feePayer = wallet?.publicKey
      await sendTransaction({ transaction, wallet, connection, signers })
      setLoading(false)
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <h3 className="mb-4">Delegate tokens</h3>
      {wallet && wallet.publicKey ? (
        <>
          <div className="text-sm text-th-fgd-1 flex flex-row items-center justify-between mt-4">
            Allow any wallet to vote or create proposals with your deposited
            tokens.
          </div>
          <div className="text-sm text-fgd-3">
            This will not allow the delegated wallet to withdraw or send tokens.
          </div>

          <Button
            className="sm:w-full mt-4"
            onClick={handleDelegate}
            isLoading={isLoading}
          >
            Delegate
          </Button>
        </>
      ) : (
        <div className="text-sm text-th-fgd-1 flex flex-row items-center justify-between mt-4">
          Connect wallet to delegate
        </div>
      )}
    </div>
  )
}

export default DelegateCard
