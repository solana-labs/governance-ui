import React, { useContext, useEffect, useState } from 'react'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'

import {
  PublicKey,
  StakeAuthorizationLayout,
  StakeProgram,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'

import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { web3 } from '@coral-xyz/anchor'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { AssetAccount, StakeAccount, StakeState } from '@utils/uiTypes/assets'
import StakeAccountSelect from '../../StakeAccountSelect'
import { getFilteredProgramAccounts } from '@utils/helpers'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import {
  STAKE_POOL_INSTRUCTION_LAYOUTS,
  getStakePoolAccount,
} from '@solana/spl-stake-pool'
import Input from '@components/inputs/Input'
import { tryGetAta } from '@utils/validations'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token,
} from '@solana/spl-token'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

type SanctumSplDepositStake = {
  governedTokenAccount: AssetAccount | undefined
  stakingAccount: StakeAccount | undefined
  stakePool: string
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
  const programId: PublicKey = StakeProgram.programId
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)

  const [form, setForm] = useState<SanctumSplDepositStake>({
    stakingAccount: undefined,
    governedTokenAccount: undefined,
    stakePool: '9jWbABPXfc75wseAbLEkBCb1NRaX9EbJZJTDQnbtpzc1',
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
      value: value,
      propertyName: 'stakePool',
    })
  }

  const getStakeAccounts = async (): Promise<StakeAccount[]> => {
    if (!form.governedTokenAccount) return []

    const stakingAccounts = await getFilteredProgramAccounts(
      connection.current,
      StakeProgram.programId,
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

    if (
      !form.stakingAccount ||
      !form.stakingAccount.stakeAccount ||
      !form.stakingAccount.delegatedValidator
    )
      return false
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
      !programId ||
      !form.governedTokenAccount?.isSol ||
      !form.stakingAccount?.stakeAccount
    ) {
      console.log('Invalid form')
      return returnInvalid()
    }

    const prequsiteInstructions: TransactionInstruction[] = []
    const instruction = web3.StakeProgram.authorize({
      stakePubkey: form.stakingAccount.stakeAccount,
      authorizedPubkey: form.governedTokenAccount.pubkey,
      newAuthorizedPubkey: new PublicKey(
        'BKi84JsPEnXT4UBTZtET5h8Uf2y3qLWAnyAZXtMVNK1o'
      ),
      stakeAuthorizationType: StakeAuthorizationLayout.Withdrawer,
    })
    const stakePool = await getStakePoolAccount(
      connection.current,
      new PublicKey(form.stakePool)
    )
    const ataAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      stakePool.account.data.poolMint,
      form.governedTokenAccount.pubkey,
      true
    )
    const ataAccount = await tryGetAta(
      connection.current,
      stakePool.account.data.poolMint,
      form.governedTokenAccount.pubkey
    )
    if (!ataAccount) {
      prequsiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          stakePool.account.data.poolMint, // mint
          ataAddress, // ata
          form.governedTokenAccount.pubkey, // owner of token account
          wallet!.publicKey! // fee payer
        )
      )
    }

    const type = STAKE_POOL_INSTRUCTION_LAYOUTS.DepositSol
    const data = encodeData(type, {
      lamports: stakePool.account.data.totalLamports.toNumber(),
    })

    const keys = [
      { pubkey: stakePool.pubkey, isSigner: false, isWritable: true },
      {
        pubkey: new PublicKey('BKi84JsPEnXT4UBTZtET5h8Uf2y3qLWAnyAZXtMVNK1o'),
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: stakePool.account.data.reserveStake,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: form.stakingAccount.stakeAccount,
        isSigner: true,
        isWritable: true,
      },
      { pubkey: ataAddress, isSigner: false, isWritable: true },
      {
        pubkey: new PublicKey('ERxpThUFmXstSEhWA4R6Uo7S3YvyPg1ZV1KAgtuK3p6t'),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: ataAddress, isSigner: false, isWritable: true },
      {
        pubkey: stakePool.account.data.poolMint,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ]

    const stakeix = new TransactionInstruction({
      programId: new PublicKey('SP12tWFxD9oJsVWNavTTBZvMbA6gkAmxtVgxdqvyvhY'),
      keys,
      data,
    })

    return {
      serializedInstruction: '',
      additionalSerializedInstructions: [
        serializeInstructionToBase64(instruction.instructions[0]),
        serializeInstructionToBase64(stakeix),
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
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      >
        Deactivate the staking account for a validator. This will make the
        stakes available to withdraw at the next epoch (2-4 days).
      </div>
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
