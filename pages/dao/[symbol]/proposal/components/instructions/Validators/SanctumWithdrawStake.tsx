import React, { useContext, useEffect, useState } from 'react'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'

import {
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'

import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { BN } from '@coral-xyz/anchor'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { AssetAccount } from '@utils/uiTypes/assets'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import {
  StakePool,
  StakePoolInstruction,
  getStakePoolAccount,
} from '@solana/spl-stake-pool'
import Input from '@components/inputs/Input'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { genShortestUnusedSeed } from '@utils/address'

type SanctumWithdrawStakeForm = {
  governedTokenAccount: AssetAccount | undefined
  stakePool: string
  voteAccount: string
  amount: number
}

const SanctumWithdrawStake = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const stakeProgramId: PublicKey = StakeProgram.programId
  const sanctumStakeProgramId = new PublicKey(
    'SP12tWFxD9oJsVWNavTTBZvMbA6gkAmxtVgxdqvyvhY'
  )
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)

  const [form, setForm] = useState<SanctumWithdrawStakeForm>({
    amount: 0,
    governedTokenAccount: undefined,
    stakePool: '9jWbABPXfc75wseAbLEkBCb1NRaX9EbJZJTDQnbtpzc1',
    voteAccount: '5EYp3kCdMLq52vzZ4ucsVyYaaxQe5MKTquxahjXpcShS',
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const setStakePool = (value) => {
    handleSetForm({
      value: value.target.value,
      propertyName: 'stakePool',
    })
  }
  const setVoteAccount = (value) => {
    handleSetForm({
      value: value.target.value,
      propertyName: 'voteAccount',
    })
  }

  const setAmount = (value) => {
    handleSetForm({
      value: value.target.value,
      propertyName: 'amount',
    })
  }

  const validateInstruction = async (): Promise<boolean> => {
    if (!form.governedTokenAccount) return false

    return true
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    const returnInvalid = (): UiInstruction => {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: undefined,
      }
    }
    if (!connection || !isValid || !stakeProgramId) {
      console.log('Invalid form')
      return returnInvalid()
    }

    const stakePool = await getStakePoolAccount(
      connection.current,
      new PublicKey(form.stakePool)
    )

    const [withdrawAuthPk] = await PublicKey.findProgramAddress(
      [new PublicKey(form.stakePool).toBuffer(), Buffer.from('withdraw')],
      sanctumStakeProgramId
    )

    const poolAmount = Number(Number(form.amount) * LAMPORTS_PER_SOL)

    const stakeAccountRentExemption = await connection.current.getMinimumBalanceForRentExemption(
      StakeProgram.space
    )

    const [stakeAccountAddress] = await PublicKey.findProgramAddress(
      [
        new PublicKey(form.voteAccount).toBuffer(),
        new PublicKey(form.stakePool).toBuffer(),
      ],
      sanctumStakeProgramId
    )
    const stakeAccount = await connection.current.getAccountInfo(
      stakeAccountAddress
    )
    if (!stakeAccount) {
      console.log('error')
      throw new Error('Invalid Stake Account')
    }

    const availableForWithdrawal = calcLamportsWithdrawAmount(
      stakePool.account.data,
      stakeAccount.lamports - LAMPORTS_PER_SOL - stakeAccountRentExemption
    )

    if (availableForWithdrawal < poolAmount) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(
        `Not enough lamports available for withdrawal from ${stakeAccountAddress},
            ${poolAmount} asked, ${availableForWithdrawal} available.`
      )
    }
    const tokenAccAuthority = form.governedTokenAccount!.extensions.token!
      .account.owner!
    const withdrawAccount = {
      stakeAddress: stakeAccountAddress,
      voteAddress: new PublicKey(form.voteAccount),
      poolAmount,
    }

    const stakeReceiver = await genShortestUnusedSeed(
      connection.current,
      tokenAccAuthority,
      StakeProgram.programId
    )

    const createAccIx = SystemProgram.createAccountWithSeed({
      fromPubkey: wallet!.publicKey!,
      newAccountPubkey: stakeReceiver.derived,
      lamports: stakeAccountRentExemption,
      space: StakeProgram.space,
      programId: StakeProgram.programId,
      seed: stakeReceiver.seed,
      basePubkey: stakeReceiver.base,
    })

    const stakeIx = StakePoolInstruction.withdrawStake({
      stakePool: new PublicKey(form.stakePool),
      validatorList: stakePool.account.data.validatorList,
      validatorStake: withdrawAccount.stakeAddress,
      destinationStake: stakeReceiver.derived,
      destinationStakeAuthority: tokenAccAuthority,
      sourceTransferAuthority: tokenAccAuthority,
      sourcePoolAccount: form.governedTokenAccount!.extensions.token!.publicKey,
      managerFeeAccount: stakePool.account.data.managerFeeAccount,
      poolMint: stakePool.account.data.poolMint,
      poolTokens: withdrawAccount.poolAmount,
      withdrawAuthority: withdrawAuthPk,
    })

    return {
      serializedInstruction: '',
      additionalSerializedInstructions: [
        serializeInstructionToBase64(createAccIx),
        serializeInstructionToBase64(
          new TransactionInstruction({
            programId: sanctumStakeProgramId,
            keys: stakeIx.keys,
            data: stakeIx.data,
          })
        ),
      ],
      isValid: true,
      governance: form.governedTokenAccount!.governance,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: governedAccount,
        getInstruction,
      },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form.governedTokenAccount])

  return (
    <>
      <GovernedAccountSelect
        label="Treasury account"
        governedAccounts={governedTokenAccountsWithoutNfts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type="token"
      ></GovernedAccountSelect>
      <Input
        label="Stake Pool"
        value={form.stakePool}
        error={formErrors['stakePool']}
        type="text"
        onChange={setStakePool}
      />
      <Input
        label="Vote Account"
        value={form.voteAccount}
        error={formErrors['voteAccount']}
        type="text"
        onChange={setVoteAccount}
      />
      <Input
        label="Amount"
        value={form.amount}
        error={formErrors['amount']}
        type="number"
        onChange={setAmount}
      />
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      ></div>
    </>
  )
}

export default SanctumWithdrawStake

export function encodeData(type: any, fields?: any): Buffer {
  const allocLength = type.layout.span
  const data = Buffer.alloc(allocLength)
  const layoutFields = Object.assign({ instruction: type.index }, fields)
  type.layout.encode(layoutFields, data)

  return data
}

export function calcLamportsWithdrawAmount(
  stakePool: StakePool,
  poolTokens: number
): number {
  const numerator = new BN(poolTokens).mul(stakePool.totalLamports)
  const denominator = stakePool.poolTokenSupply
  if (numerator.lt(denominator)) {
    return 0
  }
  return divideBnToNumber(numerator, denominator)
}

export function divideBnToNumber(numerator: BN, denominator: BN): number {
  if (denominator.isZero()) {
    return 0
  }
  const quotient = numerator.div(denominator).toNumber()
  const rem = numerator.umod(denominator)
  const gcd = rem.gcd(denominator)
  return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber()
}
