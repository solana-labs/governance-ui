import { Group, MangoAccount } from '@blockworks-foundation/mango-v4'
import AdditionalProposalOptions from '@components/AdditionalProposalOptions'
import Button from '@components/Button'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import { BN } from '@coral-xyz/anchor'
import useCreateProposal from '@hooks/useCreateProposal'
import UseMangoV4 from '@hooks/useMangoV4'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
  getInstructionDataFromBase64,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { AccountMeta, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { AssetAccount } from '@utils/uiTypes/assets'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const MangoModal = ({ account }: { account: AssetAccount }) => {
  const { mangoClient, mangoGroup } = UseMangoV4()
  const { fmtUrlWithCluster } = useQueryContext()
  const { handleCreateProposal } = useCreateProposal()
  const router = useRouter()
  const { symbol } = useRealm()
  const [mangoAccount, setSelectedMangoAccount] = useState<MangoAccount | null>(
    null
  )
  const wallet = useWalletOnePointOh()
  const [mangoAccounts, setMangoAccounts] = useState<MangoAccount[]>([])
  const [mangoAccName, setMangoAccName] = useState('')
  const [isProposing, setIsProposing] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [proposalTitle, setProposalTitle] = useState('Create mango account')
  const [proposalDescription, setProposalDescription] = useState('')
  useEffect(() => {
    const getMangoAccounts = async () => {
      const accounts = await mangoClient?.getMangoAccountsForOwner(
        mangoGroup!,
        account.extensions.token!.account.owner!
      )
      if (accounts) {
        setMangoAccounts(accounts)
      }
    }
    getMangoAccounts()
  }, [mangoClient !== null && mangoGroup !== null])
  const handleCreateAccount = async () => {
    try {
      setIsProposing(true)
      const newAccountNum = getNextAccountNumber(mangoAccounts)
      const bank = mangoGroup!.getFirstBankByMint(
        account.extensions.mint!.publicKey!
      )
      const createAccIx = await mangoClient!.program.methods
        .accountCreate(
          newAccountNum,
          8,
          4,
          4,
          32,
          mangoAccName || `Account ${newAccountNum + 1}`
        )
        .accounts({
          group: mangoGroup!.publicKey,
          owner: account.extensions.token!.account.owner!,
          payer: account.extensions.token!.account.owner!,
        })
        .instruction()

      const acctNumBuffer = Buffer.alloc(4)
      acctNumBuffer.writeUInt32LE(newAccountNum)

      const [mangoAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('MangoAccount'),
          mangoGroup!.publicKey.toBuffer(),
          account.extensions.token!.account.owner!.toBuffer(),
          acctNumBuffer,
        ],
        mangoClient!.programId
      )

      const depositIx = await mangoClient!.program.methods
        .tokenDeposit(new BN(100000000000), false)
        .accounts({
          group: mangoGroup!.publicKey,
          account: mangoAccount,
          owner: account.extensions.token!.account.owner!,
          bank: bank.publicKey,
          vault: bank.vault,
          oracle: bank.oracle,
          tokenAccount: account.pubkey,
          tokenAuthority: account.extensions.token!.account.owner!,
        })
        .remainingAccounts(
          [bank.publicKey, bank.oracle].map(
            (pk) =>
              ({
                pubkey: pk,
                isWritable: false,
                isSigner: false,
              } as AccountMeta)
          )
        )
        .instruction()

      const delegateIx = await mangoClient!.program.methods
        .accountEdit(
          null,
          new PublicKey('EsWMqyaEDoAqMgiWG9McSmpetBiYjL4VkHPkfevxKu4D'),
          null,
          null
        )
        .accounts({
          group: mangoGroup!.publicKey,
          account: mangoAccount,
          owner: account.extensions.token!.account.owner!,
        })
        .instruction()

      const createAccInstData = {
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(
            wrapWithForwarder(
              createAccIx!,
              wallet!.publicKey!,
              new BN(1701345105)
            )
          )
        ),
        holdUpTime:
          account?.governance.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: [],
      }
      const depositAccInstData = {
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(depositIx!)
        ),
        holdUpTime:
          account?.governance.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: [],
      }
      const delegateAccInstData = {
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(delegateIx!)
        ),
        holdUpTime:
          account?.governance.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: [],
      }
      const proposalAddress = await handleCreateProposal({
        title: proposalTitle,
        description: proposalDescription,
        voteByCouncil,
        instructionsData: [
          createAccInstData,
          depositAccInstData,
          delegateAccInstData,
        ],
        governance: account.governance!,
      })
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )
      router.push(url)
    } catch (e) {
      console.log(e)
    }
    setIsProposing(false)
  }
  return (
    <div>
      <h3 className="mb-4 flex items-center">Mango</h3>
      <div>
        {console.log(mangoAccount)}
        {mangoGroup && (
          <Select
            className="mb-3"
            label="Mango account"
            value={
              <MangoAccountItem
                account={mangoAccount}
                group={mangoGroup}
              ></MangoAccountItem>
            }
            placeholder="Please select..."
            onChange={(val) => setSelectedMangoAccount(val)}
          >
            {mangoAccounts.map((x) => (
              <Select.Option key={x.publicKey.toBase58()} value={x}>
                <MangoAccountItem
                  account={x}
                  group={mangoGroup}
                ></MangoAccountItem>
              </Select.Option>
            ))}
            <Select.Option key={null} value={null}>
              <div>Create new account</div>
            </Select.Option>
          </Select>
        )}
        {!mangoAccount && (
          <Input
            label="Account name"
            type="text"
            value={mangoAccName}
            onChange={(e) => setMangoAccName(e.target.value)}
          />
        )}
        <AdditionalProposalOptions
          title={proposalTitle}
          description={proposalDescription}
          defaultTitle={proposalTitle}
          defaultDescription={''}
          setTitle={(evt) => {
            setProposalTitle(evt.target.value)
          }}
          setDescription={(evt) => setProposalDescription(evt.target.value)}
          voteByCouncil={voteByCouncil}
          setVoteByCouncil={setVoteByCouncil}
        />
        <div className="mt-4 justify-end flex">
          <Button
            isLoading={isProposing}
            disabled={isProposing}
            onClick={handleCreateAccount}
          >
            Propose
          </Button>
        </div>
      </div>
    </div>
  )
}

const MangoAccountItem = ({
  account,
  group,
}: {
  account: MangoAccount | null
  group: Group
}) => {
  return account ? (
    <div>
      <div>Name: {account.name}</div>
      <div>{account.publicKey.toBase58()}</div>
      <div>Pnl: ${account.getPnl(group).toString()}</div>
    </div>
  ) : (
    <div>Create new account</div>
  )
}

const getNextAccountNumber = (accounts: MangoAccount[]): number => {
  if (accounts.length > 1) {
    return (
      accounts
        .map((a) => a.accountNum)
        .reduce((a, b) => Math.max(a, b), -Infinity) + 1
    )
  } else if (accounts.length === 1) {
    return accounts[0].accountNum + 1
  }
  return 0
}

export default MangoModal

function wrapWithForwarder(
  ix: TransactionInstruction,
  signer: PublicKey,
  timeout: BN
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      {
        pubkey: signer,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: ix.programId,
        isSigner: false,
        isWritable: false,
      },
      ...ix.keys,
    ],
    programId: new PublicKey('ixFPGCPYEp5GzhoahhHFVL8VVzkq1kc2eeFZh3qpYca'),
    data: Buffer.concat([timeout.toArrayLike(Buffer, 'le', 8), ix.data]),
  })
}
