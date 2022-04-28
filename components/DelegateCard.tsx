import useRealm from '../hooks/useRealm'
import useWalletStore from '../stores/useWalletStore'
import React, { useState, FunctionComponent } from 'react'
import {
  Transaction,
  TransactionInstruction,
  Keypair,
  PublicKey,
} from '@solana/web3.js'
import Input from './inputs/Input'
import {
  withSetGovernanceDelegate,
  getGovernanceProgramVersion,
} from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { CashIcon, CreditCardIcon } from '@heroicons/react/solid'
import Button from './Button'
import Checkbox from '@components/inputs/Checkbox'
import { tryParseKey } from 'tools/validators/pubkey'

const DelegateCard = () => {
  const {
    realm,
    ownTokenRecord, // community
    ownCouncilTokenRecord, // council
  } = useRealm()
  const [isLoading, setLoading] = useState<boolean>(false)
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)
  const [delegateKey, setDelegateKey] = useState('')
  const [tokenType, setTokenType] = useState<'community' | 'council'>('council')

  const handleDelegate = async () => {
    const signers: Keypair[] = []
    const instructions: TransactionInstruction[] = []
    setLoading(true)

    if (!realm || !realm?.account?.config?.councilMint || !wallet?.publicKey) {
      return
    }

    try {
      const programVersion = await getGovernanceProgramVersion(
        connection,
        realm.owner // governance program public key
      )

      const tokenMintToDelegateWith =
        tokenType === 'council'
          ? realm?.account?.config?.councilMint
          : realm.account.communityMint

      withSetGovernanceDelegate(
        instructions,
        realm.owner, // publicKey of program/programId
        programVersion, // program version of realm
        realm.pubkey, // realm public key
        tokenMintToDelegateWith, // mint of governance token
        wallet?.publicKey, // governingTokenOwner (walletId) publicKey of for tokenOwnerRecord of this wallet
        wallet?.publicKey, // governanceAuthority: publicKey of connected wallet
        new PublicKey(delegateKey) // public key of wallet who to delegated vote to
      )

      const transaction = new Transaction()
      transaction.add(...instructions)
      await sendTransaction({ transaction, wallet, connection, signers })
      setLoading(false)
    } catch (error) {
      console.log('error', error)
    }
  }

  const parsedDelegateKey = tryParseKey(delegateKey)

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

          <InputRow
            label="Token Type"
            icon={<CashIcon className="h-8 text-primary-light w-4 mr-2" />}
          >
            <div className="form-check">
              <Checkbox
                checked={tokenType === 'council'}
                label={'Council Token'}
                disabled={ownCouncilTokenRecord ? false : true}
                onChange={() => setTokenType('council')}
              />
            </div>
            <div className="form-check">
              <Checkbox
                checked={tokenType === 'community'}
                label={'Community Token'}
                disabled={ownTokenRecord ? false : true}
                onChange={() => setTokenType('community')}
              />
            </div>
          </InputRow>

          <InputRow
            label="Wallet"
            icon={
              <CreditCardIcon className="h-8 text-primary-light w-4 mr-2" />
            }
          >
            <Input
              className="w-full min-w-full"
              type="text"
              value={delegateKey}
              onChange={(e) => setDelegateKey(e.target.value)}
              placeholder="Public key"
            />
          </InputRow>

          <Button
            className="sm:w-full mt-4"
            onClick={handleDelegate}
            isLoading={isLoading}
            disabled={
              !parsedDelegateKey || (!ownCouncilTokenRecord && !ownTokenRecord)
            }
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

interface InputRowProps {
  label: string
  icon: React.ReactNode
}

const InputRow: FunctionComponent<InputRowProps> = ({
  children,
  icon,
  label,
}) => {
  return (
    <div className="flex justify-between items-center content-center mt-4 w-full">
      <div className="mr-2 py-1 text-sm w-40 h-8 flex items-center">
        {icon}
        {label}
      </div>
      {children}
    </div>
  )
}

export default DelegateCard
