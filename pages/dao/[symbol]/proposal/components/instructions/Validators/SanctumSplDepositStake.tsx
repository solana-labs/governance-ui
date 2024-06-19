import React, { useContext, useEffect, useState } from 'react'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'

import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'

import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { BN, web3 } from '@coral-xyz/anchor'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { AssetAccount, StakeAccount, StakeState } from '@utils/uiTypes/assets'
import StakeAccountSelect from '../../StakeAccountSelect'
import { getFilteredProgramAccounts } from '@utils/helpers'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import {
  StakePool,
  StakePoolInstruction,
  getStakePoolAccount,
} from '@solana/spl-stake-pool'
import Input from '@components/inputs/Input'
import { tryGetAta } from '@utils/validations'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

type SanctumSplDepositStake = {
  governedTokenAccount: AssetAccount | undefined
  stakingAccount: StakeAccount | undefined
  stakePool: string
  voteAccount: string
}

const SanctumSplDepositStake = ({
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

  const [form, setForm] = useState<SanctumSplDepositStake>({
    stakingAccount: undefined,
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

  const setStakingAccount = (value) => {
    handleSetForm({
      value: value,
      propertyName: 'stakingAccount',
    })
  }
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

  const getStakeAccounts = async (): Promise<StakeAccount[]> => {
    if (!form.governedTokenAccount) return []

    const stakingAccounts = await getFilteredProgramAccounts(
      connection.current,
      stakeProgramId,
      [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode([2, 0, 0, 0]),
          },
        },
        {
          memcmp: {
            offset: 44,
            bytes: form.governedTokenAccount.pubkey.toBase58(),
          },
        },
        {
          memcmp: {
            offset: 172,
            bytes: bs58.encode([255, 255, 255, 255, 255, 255, 255, 255]), // equivalent to u64::max for deactivation epoch / not deactivated yet
          },
        },
      ]
    )

    return stakingAccounts.map((x) => {
      const validatorPk = web3.PublicKey.decode(
        x.accountInfo.data.slice(124, 124 + 32)
      )
      return {
        stakeAccount: x.publicKey,
        state: StakeState.Active,
        delegatedValidator: validatorPk as web3.PublicKey,
        amount: x.accountInfo.lamports / web3.LAMPORTS_PER_SOL,
      }
    })
  }

  //getStakeAccounts().then(x => setStakeAccounts(x))

  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([])

  const validateInstruction = async (): Promise<boolean> => {
    if (!form.governedTokenAccount) return false

    const stakingAccounts = await getStakeAccounts()
    setStakeAccounts(stakingAccounts)

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
    if (
      !connection ||
      !isValid ||
      !stakeProgramId ||
      !form.governedTokenAccount?.isSol
    ) {
      console.log('Invalid form')
      return returnInvalid()
    }

    const prequsiteInstructions: TransactionInstruction[] = []

    const stakePool = await getStakePoolAccount(
      connection.current,
      new PublicKey(form.stakePool)
    )

    const ataAccount = await tryGetAta(
      connection.current,
      stakePool.account.data.poolMint,
      form.governedTokenAccount.pubkey
    )

    const [withdrawAuthPk] = await PublicKey.findProgramAddress(
      [new PublicKey(form.stakePool).toBuffer(), Buffer.from('withdraw')],
      sanctumStakeProgramId
    )
    // const [validatorStake] = await PublicKey.findProgramAddress(
    //   [
    //     new PublicKey(form.voteAccount).toBuffer(),
    //     new PublicKey(form.stakePool).toBuffer(),
    //   ],
    //   sanctumStakeProgramId
    // )

    const poolAmount = Number(0.1 * LAMPORTS_PER_SOL)

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
    const withdrawAccount = {
      stakeAddress: stakeAccountAddress,
      voteAddress: new PublicKey(form.voteAccount),
      poolAmount,
    }

    const stakeReceiverKeypair = Keypair.generate()
    const stakeToReceive = stakeReceiverKeypair.publicKey
    prequsiteInstructions.push(
      SystemProgram.createAccount({
        fromPubkey: wallet!.publicKey!,
        newAccountPubkey: stakeReceiverKeypair.publicKey,
        lamports: stakeAccountRentExemption,
        space: StakeProgram.space,
        programId: StakeProgram.programId,
      })
    )

    const stakeIx = StakePoolInstruction.withdrawStake({
      stakePool: new PublicKey(form.stakePool),
      validatorList: stakePool.account.data.validatorList,
      validatorStake: withdrawAccount.stakeAddress,
      destinationStake: stakeToReceive,
      destinationStakeAuthority: form.governedTokenAccount.pubkey,
      sourceTransferAuthority: form.governedTokenAccount.pubkey,
      sourcePoolAccount: ataAccount!.publicKey,
      managerFeeAccount: stakePool.account.data.managerFeeAccount,
      poolMint: stakePool.account.data.poolMint,
      poolTokens: withdrawAccount.poolAmount,
      withdrawAuthority: withdrawAuthPk,
    })

    return {
      prerequisiteInstructions: prequsiteInstructions,
      prerequisiteInstructionsSigners: [stakeReceiverKeypair],
      serializedInstruction: '',
      additionalSerializedInstructions: [
        serializeInstructionToBase64(
          new TransactionInstruction({
            programId: sanctumStakeProgramId,
            keys: stakeIx.keys,
            data: stakeIx.data,
          })
        ),
      ],
      isValid: true,
      governance: form.governedTokenAccount.governance,
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
    if (form.governedTokenAccount) {
      getStakeAccounts().then((x) => setStakeAccounts(x))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form.governedTokenAccount])

  return (
    <>
      <GovernedAccountSelect
        label="Treasury account"
        governedAccounts={governedTokenAccountsWithoutNfts.filter(
          (x) => x.isSol
        )}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>

      <StakeAccountSelect
        label="Staking Account"
        stakeAccounts={stakeAccounts}
        value={form.stakingAccount}
        error={formErrors['stakingAccount']}
        onChange={setStakingAccount}
      />
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

export default SanctumSplDepositStake

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
