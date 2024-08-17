import React, { useContext, useEffect, useState } from 'react'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'

import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  StakeAuthorizationLayout,
  StakeProgram,
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
  StakePoolInstruction,
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

type SanctumDepositStake = {
  governedTokenAccount: AssetAccount | undefined
  stakingAccount: StakeAccount | undefined
  stakePool: string
  voteAccount: string
}

const SanctumDepositStake = ({
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

  const [form, setForm] = useState<SanctumDepositStake>({
    stakingAccount: undefined,
    governedTokenAccount: undefined,
    stakePool: '',
    voteAccount: '',
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
      !stakeProgramId ||
      !form.governedTokenAccount?.isSol ||
      !form.stakingAccount?.stakeAccount
    ) {
      console.log('Invalid form')
      return returnInvalid()
    }

    const prequsiteInstructions: TransactionInstruction[] = []

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

    const [withdrawAuthPk] = await PublicKey.findProgramAddress(
      [new PublicKey(form.stakePool).toBuffer(), Buffer.from('withdraw')],
      sanctumStakeProgramId
    )
    const [validatorStake] = await PublicKey.findProgramAddress(
      [
        new PublicKey(form.voteAccount).toBuffer(),
        new PublicKey(form.stakePool).toBuffer(),
      ],
      sanctumStakeProgramId
    )
    const authorizeWithdrawIx = StakeProgram.authorize({
      stakePubkey: form.stakingAccount.stakeAccount,
      authorizedPubkey: form.governedTokenAccount.pubkey,
      newAuthorizedPubkey: stakePool.account.data.stakeDepositAuthority,
      stakeAuthorizationType: StakeAuthorizationLayout.Withdrawer,
    })

    const authorizeStakerIx = StakeProgram.authorize({
      stakePubkey: form.stakingAccount.stakeAccount,
      authorizedPubkey: form.governedTokenAccount.pubkey,
      newAuthorizedPubkey: stakePool.account.data.stakeDepositAuthority,
      stakeAuthorizationType: StakeAuthorizationLayout.Staker,
    })

    const stakeIx = StakePoolInstruction.depositStake({
      stakePool: new PublicKey(form.stakePool),
      validatorList: stakePool.account.data.validatorList,
      depositAuthority: stakePool.account.data.stakeDepositAuthority,
      reserveStake: stakePool.account.data.reserveStake,
      managerFeeAccount: stakePool.account.data.managerFeeAccount,
      referralPoolAccount: ataAddress,
      destinationPoolAccount: ataAddress,
      withdrawAuthority: withdrawAuthPk,
      depositStake: form.stakingAccount.stakeAccount,
      validatorStake: validatorStake,
      poolMint: stakePool.account.data.poolMint,
    })
    //don't need to be writable any more problems probably comes from old solana/web3.js version
    const modifiedAuthorize1 = {
      ...authorizeStakerIx.instructions[0],
      keys: authorizeStakerIx.instructions[0].keys.map((x) => {
        if (x.pubkey.equals(SYSVAR_CLOCK_PUBKEY)) {
          return {
            ...x,
            isWritable: false,
          }
        }
        return x
      }),
    }
    //don't need to be writable any more problems probably comes from old solana/web3.js version
    const modifiedAuthorize2 = {
      ...authorizeWithdrawIx.instructions[0],
      keys: authorizeWithdrawIx.instructions[0].keys.map((x) => {
        if (x.pubkey.equals(SYSVAR_CLOCK_PUBKEY)) {
          return {
            ...x,
            isWritable: false,
          }
        }
        return x
      }),
    }
    return {
      prerequisiteInstructions: prequsiteInstructions,
      serializedInstruction: '',
      additionalSerializedInstructions: [
        serializeInstructionToBase64(modifiedAuthorize1),
        serializeInstructionToBase64(modifiedAuthorize2),
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

export default SanctumDepositStake

export function encodeData(type: any, fields?: any): Buffer {
  const allocLength = type.layout.span
  const data = Buffer.alloc(allocLength)
  const layoutFields = Object.assign({ instruction: type.index }, fields)
  type.layout.encode(layoutFields, data)

  return data
}
