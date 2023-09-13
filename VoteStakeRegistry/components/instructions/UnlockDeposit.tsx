/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Input from '@components/inputs/Input'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  UiInstruction,
  UnlockDepositForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { getValidatedPublickKey } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  Governance,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import * as yup from 'yup'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { useRealmQuery } from '@hooks/queries/realm'
import { getUnlockDepositInstruction } from 'VoteStakeRegistry/actions/getUnlockDepositInstruction'
import { NewProposalContext } from 'pages/dao/[symbol]/proposal/new'
import { Voter, getVoterPDA } from 'VoteStakeRegistry/sdk/accounts'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'
import { tryGetVoter } from 'VoteStakeRegistry/sdk/api'
import Select from '@components/inputs/Select'
import { getDepositType } from 'VoteStakeRegistry/tools/deposits'
import dayjs from 'dayjs'

const UnlockDeposit = ({
  index,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const {
    client,
    voteStakeRegistryRegistrar,
    voteStakeRegistryRegistrarPk,
  } = useVotePluginsClientStore((s) => ({
    client: s.state.vsrClient,
    voteStakeRegistryRegistrar: s.state.voteStakeRegistryRegistrar,
    voteStakeRegistryRegistrarPk: s.state.voteStakeRegistryRegistrarPk,
  }))
  const realm = useRealmQuery().data?.result
  const { handleSetInstructions } = useContext(NewProposalContext)

  const { governancesArray } = useGovernanceAssets()
  const [form, setForm] = useState<UnlockDepositForm>({
    depositEntryIndex: undefined,
    voterAuthorityPk: '',
  })
  const schema = useMemo(
    () =>
      yup.object().shape({
        voterAuthorityPk: yup
          .string()
          .required('voterAuthority required')
          .test(
            'voterAuthorityPk',
            'voterAuthorityPk must be valid PublicKey',
            function (voterAuthorityPk: string) {
              try {
                getValidatedPublickKey(voterAuthorityPk)
              } catch (err) {
                return false
              }
              return true
            }
          ),
        depositEntryIndex: yup.number().required('depositEntryIndex required'),
      }),
    []
  )

  const [voter, setVoter] = useState<Voter | null>(null)

  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm((prevForm) => ({ ...prevForm, [propertyName]: value }))
  }

  const getInstruction = useCallback(async () => {
    if (!realm) throw new Error('No realm')
    if (!voteStakeRegistryRegistrar)
      throw new Error('No voteStakeRegistryRegistrar')

    console.log('form', form)
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    const prerequisiteInstructions: TransactionInstruction[] = []
    if (isValid && form.depositEntryIndex) {
      const voterAuthorityPk = new PublicKey(form.voterAuthorityPk)

      const unlockDepositIx = await getUnlockDepositInstruction({
        depositEntryIndex: form.depositEntryIndex,
        communityMintPk: realm!.account.communityMint,
        voterAuthorityPk,
        realmPk: realm!.pubkey,
        client: client!,
        voteStakeRegistryRegistrar,
      })
      serializedInstruction = serializeInstructionToBase64(unlockDepositIx!)
    }

    const obj: UiInstruction = {
      serializedInstruction,
      isValid,
      governance: governedAccount,
      prerequisiteInstructions: prerequisiteInstructions,
      chunkBy: 1,
    }
    return obj
  }, [client, form, governedAccount, realm, schema, voteStakeRegistryRegistrar])

  useEffect(() => {
    if (!voteStakeRegistryRegistrar) return

    const governance = governancesArray.find((governance) =>
      governance.pubkey.equals(voteStakeRegistryRegistrar.realmAuthority)
    )
    setGovernedAccount(governance)
  }, [governancesArray, voteStakeRegistryRegistrar])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
    console.log('Set instruction')
  }, [form, governedAccount, handleSetInstructions, index, getInstruction])

  useEffect(() => {
    const loadVoter = async (client: VsrClient, registrarPk: PublicKey) => {
      const { voter: voterPda } = getVoterPDA(
        registrarPk,
        new PublicKey(form.voterAuthorityPk),
        client.program.programId
      )
      const _voter = await tryGetVoter(voterPda, client)
      setVoter(_voter)
    }
    if (form.voterAuthorityPk && client && voteStakeRegistryRegistrarPk) {
      loadVoter(client, voteStakeRegistryRegistrarPk)
    }
  }, [client, form.voterAuthorityPk, voteStakeRegistryRegistrarPk])

  return (
    <>
      <Input
        label="Voter Wallet address"
        value={form.voterAuthorityPk}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'voterAuthorityPk',
          })
        }
        error={formErrors['voterAuthorityPk']}
      />
      {voter ? (
        <Select
          label={'Deposit Entry'}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'depositEntryIndex' })
          }}
          placeholder="Please select..."
          value={
            form.depositEntryIndex
              ? `Entry # ${form.depositEntryIndex}`
              : undefined
          }
          error={formErrors['depositEntryIndex']}
        >
          {voter.deposits.map((deposit, idx) => {
            const unixLockupEnd = deposit.lockup.endTs.toNumber() * 1000
            const finalUnlockDate = dayjs(unixLockupEnd)
            const lockupType = getDepositType(deposit)
            if (lockupType == 'none') return null
            return (
              <Select.Option key={idx} value={idx}>
                <div>Lockup Type: {lockupType}</div>
                <div>
                  <div>
                    Lockup end date: {finalUnlockDate.format('YYYY-MM-DD')}
                  </div>
                  {/* TODO: Translate to human readable value */}
                  Amount still locked:{' '}
                  {deposit.amountDepositedNative.toString()}
                </div>
              </Select.Option>
            )
          })}
        </Select>
      ) : (
        <div>No VSR deposits found for voter: {form.voterAuthorityPk}</div>
      )}
    </>
  )
}

export default UnlockDeposit
