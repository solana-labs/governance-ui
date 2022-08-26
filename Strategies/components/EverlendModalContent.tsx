import ButtonGroup from '@components/ButtonGroup'
import { useEffect, useState } from 'react'
import { TreasuryStrategy } from 'Strategies/types/types'
import {
  CreateEverlendProposal,
  lamportsToSol,
} from 'Strategies/protocols/everlend/tools'
import { AssetAccount } from '@utils/uiTypes/assets'
import EverlendDeposit from './everlend/EverlendDeposit'
import EverlendWithdraw from './everlend/EverlendWithdraw'
import { findAssociatedTokenAccount } from '@everlend/common'
import { PublicKey } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'

enum Tabs {
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
}

interface IProps {
  proposedInvestment: TreasuryStrategy & { poolMint: string }
  handledMint: string
  createProposalFcn: CreateEverlendProposal
  governedTokenAccount: AssetAccount
}

const EverlendModalContent = ({
  proposedInvestment,
  handledMint,
  createProposalFcn,
  governedTokenAccount,
}: IProps) => {
  const [selectedTab, setSelectedTab] = useState(Tabs.DEPOSIT)
  const [depositedAmount, setDepositedAmount] = useState(0)
  const [maxDepositAmount, setMaxDepositAmount] = useState(0)
  const tabs = Object.values(Tabs)
  const connection = useWalletStore((s) => s.connection)

  const isSol = governedTokenAccount.isSol
  const owner = isSol
    ? governedTokenAccount!.pubkey
    : governedTokenAccount!.extensions!.token!.account.owner

  console.log('proposed', governedTokenAccount!.pubkey.toString())

  useEffect(() => {
    const loadMaxAmount = async () => {
      const tokenMintATA = await findAssociatedTokenAccount(
        owner,
        new PublicKey(proposedInvestment.poolMint)
      )
      let poolMintATABalance = 0
      let tokenMintATABalance = 0
      try {
        const fetchedTokenMintATABalance = await connection.current.getTokenAccountBalance(
          tokenMintATA
        )
        tokenMintATABalance = Number(fetchedTokenMintATABalance.value.uiAmount)
      } catch (e) {
        console.log(e)
      }
      try {
        if (isSol) {
          const fetchedBalance = await connection.current.getBalance(owner)
          poolMintATABalance = lamportsToSol(fetchedBalance)
          console.log(owner.toString())
        } else {
          const fetchedBalance = await connection.current.getTokenAccountBalance(
            governedTokenAccount!.pubkey
          )
          poolMintATABalance = Number(fetchedBalance.value.uiAmount)
        }
      } catch (e) {
        console.log(e)
      }
      setDepositedAmount(tokenMintATABalance)
      setMaxDepositAmount(poolMintATABalance)
    }
    loadMaxAmount()
  }, [proposedInvestment, handledMint])

  return (
    <div>
      <div className="pb-4">
        <ButtonGroup
          activeValue={selectedTab}
          onChange={(tab) => setSelectedTab(tab)}
          values={tabs}
        />
      </div>
      {selectedTab === Tabs.DEPOSIT && (
        <EverlendDeposit
          proposedInvestment={proposedInvestment}
          createProposalFcn={createProposalFcn}
          governedTokenAccount={governedTokenAccount}
          handledMint={handledMint}
          depositedAmount={depositedAmount}
          maxDepositAmount={maxDepositAmount}
        />
      )}
      {selectedTab === Tabs.WITHDRAW && (
        <EverlendWithdraw
          proposedInvestment={proposedInvestment}
          createProposalFcn={createProposalFcn}
          governedTokenAccount={governedTokenAccount}
          handledMint={handledMint}
          depositedAmount={depositedAmount}
        />
      )}
    </div>
  )
}

export default EverlendModalContent
