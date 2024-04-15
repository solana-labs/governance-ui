import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { tryGetMint } from '@utils/tokens'
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
  DepositWithMintAccount,
  getRegistrarPDA,
  emptyPk,
  Voter,
} from 'VoteStakeRegistry/sdk/accounts'
import Select from '@components/inputs/Select'
import { tryGetRegistrar } from 'VoteStakeRegistry/sdk/api'
import { fmtMintAmount } from '@tools/sdk/units'
import tokenPriceService from '@utils/services/tokenPrice'
import { getClawbackInstruction } from 'VoteStakeRegistry/actions/getClawbackInstruction'
import { abbreviateAddress } from '@utils/formatting'
import { AssetAccount } from '@utils/uiTypes/assets'
import { useRealmQuery } from '@hooks/queries/realm'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import Input from '@components/inputs/Input'
import {useVsrClient} from "VoterWeightPlugins/useVsrClient";

const Clawback = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { vsrClient } = useVsrClient();
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result

  const {
    governedTokenAccountsWithoutNfts,
    governancesArray,
  } = useGovernanceAssets()
  const [voters, setVoters] = useState<Voter[]>([])
  const [deposits, setDeposits] = useState<DepositWithMintAccount[]>([])
  const [form, setForm] = useState<ClawbackForm>({
    governedTokenAccount: undefined,
    voter: null,
    deposit: null,
    holdupTime: 0,
  })
  const formDeposits = form.deposit
  const schema = useMemo(
    () =>
      yup.object().shape({
        governedTokenAccount: yup
          .object()
          .required('Clawback destination required'),
        voter: yup.object().nullable().required('Voter required'),
        deposit: yup.object().nullable().required('Deposit required'),
      }),
    []
  )

  const realmAuthorityGov = governancesArray.find(
    (x) => x.pubkey.toBase58() === realm?.account.authority?.toBase58()
  )
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const getInstruction = useCallback(async () => {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    const prerequisiteInstructions: TransactionInstruction[] = []
    if (
      isValid &&
      form.governedTokenAccount!.extensions.token?.publicKey &&
      form.governedTokenAccount!.extensions.token &&
      form.governedTokenAccount!.extensions.mint?.account &&
      form.voter &&
      form.deposit
    ) {
      const clawbackDestination = form.governedTokenAccount!.extensions.token
        .account.address
      const voterWalletAddress = form.voter.voterAuthority
      const clawbackIx = await getClawbackInstruction({
        realmPk: realm!.pubkey,
        realmAuthority: realm!.account.authority!,
        voterWalletAddress: voterWalletAddress,
        destination: clawbackDestination,
        voterDepositIndex: form.deposit.index,
        grantMintPk: form.deposit.mint.publicKey,
        realmCommunityMintPk: realm!.account.communityMint,
        client: vsrClient,
      })
      serializedInstruction = serializeInstructionToBase64(clawbackIx!)
    }

    const obj: UiInstruction = {
      serializedInstruction,
      isValid,
      governance: realmAuthorityGov,
      prerequisiteInstructions: prerequisiteInstructions,
      customHoldUpTime: form.holdupTime,
    }
    return obj
  }, [vsrClient, form, realmAuthorityGov, realm, schema])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form, getInstruction, governedAccount, handleSetInstructions, index])

  useEffect(() => {
    setGovernedAccount(
      governancesArray?.find(
        (x) => x.pubkey.toBase58() === realm?.account.authority?.toBase58()
      )
    )
  }, [form.governedTokenAccount, governancesArray, realm?.account.authority])
  useEffect(() => {
    const getVoters = async () => {
      const { registrar } = getRegistrarPDA(
          realm!.pubkey,
          realm!.account.communityMint,
          vsrClient!.program.programId
      )
      const resp = await vsrClient?.program.account.voter.all([
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
              (x.account.deposits).filter(
                (depo) => depo.allowClawback
              ).length
          )
            // The cast works around an anchor issue with interpreting enums
          .map((x) => x.account as unknown as Voter) || []

      setVoters([...voters])
    }
    if (vsrClient) {
      getVoters()
    }
  }, [vsrClient, realm])
  useEffect(() => {
    const getOwnedDepositsInfo = async () => {
      const { registrar } = getRegistrarPDA(
          realm!.pubkey,
          realm!.account.communityMint,
          vsrClient!.program.programId
      )
      const existingRegistrar = await tryGetRegistrar(registrar, vsrClient!)
      const mintCfgs = existingRegistrar?.votingMints
      const mints = {}
      if (mintCfgs) {
        for (const i of mintCfgs) {
          if (i.mint.toBase58() !== emptyPk) {
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

    setForm((prevForm) => ({
      ...prevForm,
      deposit: null,
      governedTokenAccount: undefined,
    }))
  }, [vsrClient, connection, form.voter, realm])

  useEffect(() => {
    setForm((prevForm) => ({ ...prevForm, governedTokenAccount: undefined }))
  }, [formDeposits])

  const getOwnedDepositsLabel = (deposit: DepositWithMintAccount | null) => {
    const symbol = deposit
      ? tokenPriceService.getTokenInfo(deposit.mint.publicKey.toBase58())
          ?.symbol || ''
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
      <p>
        Use only with realm authority governance cant be executed with other
        governances
      </p>
      <p>governance: {realmAuthorityGov?.pubkey.toBase58()}</p>
      <p>
        wallet:{' '}
        {realmAuthorityGov
          ? PublicKey.findProgramAddressSync(
              [
                Buffer.from('native-treasury'),
                realmAuthorityGov!.pubkey.toBuffer(),
              ],
              realm!.owner
            )[0].toBase58()
          : null}
      </p>
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
        type={'token'}
        label="Clawback destination"
        governedAccounts={
          governedTokenAccountsWithoutNfts.filter(
            (x) =>
              x.extensions.mint?.publicKey.toBase58() ===
              form.deposit?.mint.publicKey.toBase58()
          ) as AssetAccount[]
        }
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        governance={governance}
      ></GovernedAccountSelect>
      <Input
        label="Instruction hold up time (days)"
        type="number"
        value={form.holdupTime}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'holdupTime',
          })
        }
      ></Input>
    </>
  )
}

export default Clawback
