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
import Divider from './Divider'
import { DisplayAddress } from '@cardinal/namespaces-components'
import { tryParseKey } from 'tools/validators/pubkey'
import { XCircleIcon } from '@heroicons/react/outline'
import Tooltip from './Tooltip'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'

const DelegateCard = () => {
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result

  const [isLoading, setLoading] = useState<boolean>(false)
  const wallet = useWalletOnePointOh()
  const connection = useWalletStore((s) => s.connection.current)
  const { fetchRealm } = useWalletStore((s) => s.actions)

  const [delegateKey, setDelegateKey] = useState('')
  const [delegateCouncilToken, setDelegateCouncilToken] = useState(true)
  const [delegateCommunityToken, setDelegateCommunityToken] = useState(true)

  const handleDelegate = async () => {
    const signers: Keypair[] = []
    const instructions: TransactionInstruction[] = []

    if (!realm || !wallet?.publicKey) {
      return
    }

    try {
      setLoading(true)
      const programVersion = await getGovernanceProgramVersion(
        connection,
        realm.owner // governance program public key
      )

      // if checkbox is checked + connected wallet has a token record to delegate
      if (
        delegateCouncilToken &&
        ownCouncilTokenRecord &&
        realm?.account?.config?.councilMint
      ) {
        await withSetGovernanceDelegate(
          instructions,
          realm.owner, // publicKey of program/programId
          programVersion, // program version of realm
          realm.pubkey, // realm public key
          realm?.account?.config?.councilMint, // mint of governance token
          wallet?.publicKey, // governingTokenOwner (walletId) publicKey of tokenOwnerRecord of this wallet
          wallet?.publicKey, // governanceAuthority: publicKey of connected wallet
          new PublicKey(delegateKey) // public key of wallet who to delegated vote to
        )
      }

      // if checkbox is checked + connected wallet has a token record to delegate
      if (delegateCommunityToken && ownTokenRecord) {
        await withSetGovernanceDelegate(
          instructions,
          realm.owner, // publicKey of program/programId
          programVersion, // program version of realm
          realm.pubkey, // realm public key
          realm.account.communityMint, // mint of governance token
          wallet?.publicKey, // governingTokenOwner (walletId) publicKey of tokenOwnerRecord of this wallet
          wallet?.publicKey, // governanceAuthority: publicKey of connected wallet
          new PublicKey(delegateKey) // public key of wallet who to delegated vote to
        )
      }

      const transaction = new Transaction()
      transaction.add(...instructions)

      await sendTransaction({ transaction, wallet, connection, signers })
      await fetchRealm(realm?.owner, realm?.pubkey)
      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)
    }
  }

  const handleClearDelegate = async (type: 'council' | 'community') => {
    const signers: Keypair[] = []
    const instructions: TransactionInstruction[] = []
    setLoading(true)

    if (!realm || !wallet?.publicKey) {
      setLoading(false)
      return
    }

    try {
      const programVersion = await getGovernanceProgramVersion(
        connection,
        realm.owner // governance program public key
      )

      await withSetGovernanceDelegate(
        instructions,
        realm.owner, // publicKey of program/programId
        programVersion, // program version of realm
        realm.pubkey, // realm public key
        type === 'council' && realm?.account?.config?.councilMint
          ? realm?.account?.config?.councilMint
          : realm.account.communityMint, // mint of governance token
        wallet?.publicKey, // governingTokenOwner (walletId) publicKey of tokenOwnerRecord of this wallet
        wallet?.publicKey, // governanceAuthority: publicKey of connected wallet
        // @ts-ignore
        null // public key of wallet who to delegated vote to
      )

      const transaction = new Transaction()
      transaction.add(...instructions)

      await sendTransaction({ transaction, wallet, connection, signers })

      await fetchRealm(realm?.owner, realm?.pubkey)
      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)
    }
  }

  const parsedDelegateKey = tryParseKey(delegateKey)

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <h3 className="mb-4">Delegate tokens</h3>
      {wallet &&
      wallet.publicKey &&
      (ownTokenRecord || ownCouncilTokenRecord) ? (
        <>
          <div className="text-sm text-th-fgd-1 flex flex-row items-center justify-between mt-4">
            Allow any wallet to vote or create proposals with your deposited
            tokens.
          </div>
          <div className="text-sm text-fgd-3">
            This will not allow the delegated wallet to withdraw or send tokens.
          </div>

          {ownCouncilTokenRecord && (
            <div className="flex justify-between items-center content-center mt-4 w-full">
              <div className="mr-2 py-1 text-sm text-fgd-2 w-40 h-8 flex items-center">
                Council Delegation
              </div>
              {ownCouncilTokenRecord?.account.governanceDelegate && (
                <div className="flex items-center content-center">
                  <DisplayAddress
                    connection={connection}
                    address={ownCouncilTokenRecord?.account.governanceDelegate}
                    height="12px"
                    width="100px"
                    dark={true}
                  />
                  <Tooltip content={'Remove Delegate'}>
                    <XCircleIcon
                      onClick={() => handleClearDelegate('council')}
                      className="flex-shrink-0 h-5 ml-1 w-5 text-primary-light"
                    />
                  </Tooltip>
                </div>
              )}
            </div>
          )}
          {ownTokenRecord && (
            <div className="flex justify-between items-center content-center mt-4 w-full">
              <div className="mr-2 py-1 text-sm text-fgd-2 w-40 h-8 flex items-center">
                Community Delegation
              </div>

              {ownTokenRecord?.account.governanceDelegate && (
                <div className="flex items-center content-center">
                  <DisplayAddress
                    connection={connection}
                    address={ownTokenRecord?.account.governanceDelegate}
                    height="12px"
                    width="100px"
                    dark={true}
                  />
                  <Tooltip content={'Remove Delegate'}>
                    <XCircleIcon
                      onClick={() => handleClearDelegate('community')}
                      className="flex-shrink-0 h-5 ml-1 w-5 text-primary-light"
                    />
                  </Tooltip>
                </div>
              )}
            </div>
          )}

          <Divider />

          <InputRow
            label="Token Type"
            icon={<CashIcon className="h-8 text-primary-light w-4 mr-2" />}
          >
            {ownCouncilTokenRecord && (
              <div className="form-check">
                <Checkbox
                  checked={delegateCouncilToken}
                  label={'Council Token'}
                  // if user only has 1 type of token, then default it checked and disable unchecking
                  disabled={
                    ownTokenRecord && ownCouncilTokenRecord ? false : true
                  }
                  onChange={() =>
                    setDelegateCouncilToken(!delegateCouncilToken)
                  }
                />
              </div>
            )}
            {ownTokenRecord && (
              <div className="form-check">
                <Checkbox
                  checked={delegateCommunityToken}
                  label={'Community Token'}
                  // if user only has 1 type of token, then default it checked and disable unchecking
                  disabled={
                    ownTokenRecord && ownCouncilTokenRecord ? false : true
                  }
                  onChange={() =>
                    setDelegateCommunityToken(!delegateCommunityToken)
                  }
                />
              </div>
            )}
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
              disabled={!ownCouncilTokenRecord && !ownTokenRecord}
            />
          </InputRow>

          <Button
            className="sm:w-full mt-4"
            onClick={handleDelegate}
            isLoading={isLoading}
            disabled={
              !parsedDelegateKey ||
              (!ownCouncilTokenRecord && !ownTokenRecord) ||
              (!delegateCouncilToken && !delegateCommunityToken)
            }
          >
            Delegate
          </Button>
        </>
      ) : (
        <div className="text-sm text-th-fgd-1 flex flex-row items-center justify-between mt-4">
          {wallet && wallet.publicKey
            ? 'Gain a governance token for this dao to delegate'
            : 'Connect wallet to delegate'}
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
