import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { TransactionInstruction } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'
import { GovernedMultiTypeAccount, tryGetMint } from '@utils/tokens'
import {
  ClawbackForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  Governance,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { NewProposalContext } from 'pages/dao/[symbol]/proposal/new'
import GovernedAccountSelect from 'pages/dao/[symbol]/proposal/components/GovernedAccountSelect'
import * as yup from 'yup'
import {
  Deposit,
  DepositWithMintAccount,
  getRegistrarPDA,
  unusedMintPk,
  Voter,
} from 'VoteStakeRegistry/sdk/accounts'
import Select from '@components/inputs/Select'
import { tryGetRegistrar } from 'VoteStakeRegistry/sdk/api'
import { fmtMintAmount } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import { getClawbackInstruction } from 'VoteStakeRegistry/actions/getClawbackInstruction'
import { abbreviateAddress } from '@utils/formatting'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'

const Clawback = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
  const connection = useWalletStore((s) => s.connection)
  const { realm } = useRealm()
  const {
    governedTokenAccountsWithoutNfts,
    governancesArray,
  } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance
  const [voters, setVoters] = useState<Voter[]>([])
  const [deposits, setDeposits] = useState<DepositWithMintAccount[]>([])
  const [form, setForm] = useState<ClawbackForm>({
    governedTokenAccount: undefined,
    voter: null,
    deposit: null,
  })
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    const prerequisiteInstructions: TransactionInstruction[] = []
    if (
      isValid &&
      form.governedTokenAccount?.token?.publicKey &&
      form.governedTokenAccount?.token &&
      form.governedTokenAccount?.mint?.account &&
      form.voter &&
      form.deposit
    ) {
      const clawbackDestination =
        form.governedTokenAccount.token?.account.address
      const voterWalletAddress = form.voter.voterAuthority
      const clawbackIx = await getClawbackInstruction({
        realmPk: realm!.pubkey,
        realmAuthority: realm!.account.authority!,
        voterWalletAddress: voterWalletAddress,
        destination: clawbackDestination,
        voterDepositIndex: form.deposit.index,
        grantMintPk: form.deposit.mint.publicKey,
        realmCommunityMintPk: realm!.account.communityMint,
        client,
      })
      serializedInstruction = serializeInstructionToBase64(clawbackIx!)
    }

    const obj: UiInstruction = {
      serializedInstruction,
      isValid,
      governance: governancesArray.find(
        (x) => x.pubkey.toBase58() === realm?.account.authority?.toBase58()
      ),
      prerequisiteInstructions: prerequisiteInstructions,
      chunkSplitByDefault: true,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form])
  useEffect(() => {
    setGovernedAccount(
      governancesArray.find(
        (x) => x.pubkey.toBase58() === realm?.account.authority?.toBase58()
      )
    )
  }, [form.governedTokenAccount])
  useEffect(() => {
    const getVoters = async () => {
      const { registrar } = await getRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        client!.program.programId
      )
      const resp = await client?.program.account.voter.all([
        {
          memcmp: {
            offset: 40,
            bytes: registrar.toString(),
          },
        },
      ])
      const voters =
        resp
          ?.filter(
            (x) =>
              (x.account.deposits as Deposit[]).filter(
                (depo) => depo.allowClawback
              ).length
          )
          .map((x) => x.account as Voter) || []

      setVoters([...voters])
    }
    if (client) {
      getVoters()
    }
  }, [client])
  useEffect(() => {
    const getOwnedDepositsInfo = async () => {
      const { registrar } = await getRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        client!.program.programId
      )
      const existingRegistrar = await tryGetRegistrar(registrar, client!)
      const mintCfgs = existingRegistrar?.votingMints
      const mints = {}
      if (mintCfgs) {
        for (const i of mintCfgs) {
          if (i.mint.toBase58() !== unusedMintPk) {
            const mint = await tryGetMint(connection.current, i.mint)
            mints[i.mint.toBase58()] = mint
          }
        }
      }
      const deposits =
        form.voter?.deposits.map((depo, index) => {
          return {
            ...depo,
            index,
            mint: mints[mintCfgs![depo.votingMintConfigIdx].mint.toBase58()],
            //warning no currentlyLocked, available, vestingrate props
          } as DepositWithMintAccount
        }) || []
      setDeposits(deposits)
    }
    if (form.voter) {
      getOwnedDepositsInfo()
    } else {
      setDeposits([])
    }
    setForm({ ...form, deposit: null, governedTokenAccount: undefined })
  }, [form.voter])
  useEffect(() => {
    setForm({ ...form, governedTokenAccount: undefined })
  }, [form.deposit])
  const schema = yup.object().shape({
    governedTokenAccount: yup
      .object()
      .required('Clawback destination required'),
    voter: yup.object().nullable().required('Voter required'),
    deposit: yup.object().nullable().required('Deposit required'),
  })

  const getOwnedDepositsLabel = (deposit: DepositWithMintAccount | null) => {
    const symbol = deposit
      ? tokenService.getTokenInfo(deposit.mint.publicKey.toBase58())?.symbol ||
        ''
      : null
    return deposit
      ? `${fmtMintAmount(
          deposit.mint.account,
          deposit.amountDepositedNative
        )} ${symbol ? symbol : abbreviateAddress(deposit.mint.publicKey)}`
      : null
  }
  return (
    <>
      <Select
        label="Voter"
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'voter' })
        }}
        placeholder="Please select..."
        value={form.voter?.voterAuthority.toBase58()}
        error={formErrors['voter']}
      >
        {voters.map((x, idx) => {
          return (
            <Select.Option key={idx} value={x}>
              {x.voterAuthority.toBase58()}
            </Select.Option>
          )
        })}
      </Select>
      <Select
        label="Deposit"
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'deposit' })
        }}
        placeholder="Please select..."
        value={getOwnedDepositsLabel(form.deposit)}
        error={formErrors['deposit']}
      >
        {deposits
          ?.filter((x) => !x.amountDepositedNative.isZero() && x.allowClawback)
          ?.map((x, idx) => {
            return (
              <Select.Option key={idx} value={x}>
                {getOwnedDepositsLabel(x)}
              </Select.Option>
            )
          })}
      </Select>
      <GovernedAccountSelect
        label="Clawback destination"
        governedAccounts={
          governedTokenAccountsWithoutNfts.filter(
            (x) =>
              x.mint?.publicKey.toBase58() ===
              form.deposit?.mint.publicKey.toBase58()
          ) as GovernedMultiTypeAccount[]
        }
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
    </>
  )
}

export default Clawback
