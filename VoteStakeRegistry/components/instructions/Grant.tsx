import React, { useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { AccountInfo } from '@solana/spl-token'
import {
  getMintMinAmountAsDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { precision } from '@utils/formatting'
import { tryParseKey } from '@tools/validators/pubkey'
import useWalletStore from 'stores/useWalletStore'
import {
  GovernedMultiTypeAccount,
  TokenProgramAccount,
  tryGetTokenAccount,
} from '@utils/tokens'
import { GrantForm, UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { getAccountName } from '@components/instructions/tools'
import { debounce } from '@utils/debounce'
import { getTokenTransferSchema } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  Governance,
  serializeInstructionToBase64,
  withCreateTokenOwnerRecord,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { NewProposalContext } from 'pages/dao/[symbol]/proposal/new'
import GovernedAccountSelect from 'pages/dao/[symbol]/proposal/components/GovernedAccountSelect'
import { lockupTypes } from 'VoteStakeRegistry/tools/types'
import Select from '@components/inputs/Select'
import Switch from '@components/Switch'
import moment from 'moment'
import { getFormattedStringFromDays } from 'VoteStakeRegistry/tools/dateTools'
import * as yup from 'yup'
import { getGrantInstruction } from 'VoteStakeRegistry/actions/getGrantInstruction'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'
import { getRegistrarPDA } from 'VoteStakeRegistry/sdk/accounts'
import { tryGetRegistrar } from 'VoteStakeRegistry/sdk/api'

const Grant = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { client } = useVoteRegistry()
  const dateNow = moment().unix()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realm, tokenRecords } = useRealm()
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance
  const [grantAuthorities, setGrantAuthorities] = useState<string[]>([])
  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState('')
  const [form, setForm] = useState<GrantForm>({
    destinationAccount: '',
    // No default transfer amount
    amount: undefined,
    governedTokenAccount: undefined,
    mintInfo: undefined,
    startDateUnixSeconds: dateNow,
    periods: 0,
    allowClawback: true,
    lockupKind: lockupTypes[0],
  })
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<TokenProgramAccount<AccountInfo> | null>(null)
  const [formErrors, setFormErrors] = useState({})
  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setMintInfo = (value) => {
    setForm({ ...form, mintInfo: value })
  }
  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }
  const validateAmountOnBlur = () => {
    const value = form.amount

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    const prerequisiteInstructions: TransactionInstruction[] = []
    if (
      isValid &&
      form.governedTokenAccount?.token?.publicKey &&
      form.governedTokenAccount?.token &&
      form.governedTokenAccount?.mint?.account
    ) {
      const sourceAccount = form.governedTokenAccount.token?.account.address
      const destinationAccount = new PublicKey(form.destinationAccount)
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount!,
        form.governedTokenAccount.mint.account.decimals
      )
      const currentTokenOwnerRecord = tokenRecords[form.destinationAccount]
      if (!currentTokenOwnerRecord) {
        await withCreateTokenOwnerRecord(
          prerequisiteInstructions,
          realm!.owner,
          realm!.pubkey,
          destinationAccount,
          realm!.account.communityMint,
          wallet!.publicKey!
        )
      }
      const grantIx = await getGrantInstruction({
        fromPk: sourceAccount,
        toPk: destinationAccount,
        realmMint: realm!.account.communityMint!,
        realmPk: realm!.pubkey,
        communityMintPk: realm!.account.communityMint,
        grantAuthority: form.governedTokenAccount.governance!.pubkey,
        grantMintPk: form.governedTokenAccount.mint.publicKey,
        amount: mintAmount,
        lockupPeriod: form.periods,
        startTime: form.startDateUnixSeconds,
        lockupKind: form.lockupKind.value,
        allowClawback: form.allowClawback,
        feePayerPk: wallet!.publicKey!,
        client: client!,
      })
      serializedInstruction = serializeInstructionToBase64(grantIx!)
    }

    const obj: UiInstruction = {
      serializedInstruction,
      isValid,
      governance: form.governedTokenAccount?.governance,
      prerequisiteInstructions: prerequisiteInstructions,
      chunkSplitByDefault: true,
    }
    return obj
  }
  const handleChangeStartDate = (e) => {
    const value = e.target.value
    setStartDate(value)
    const unixDate = moment(value).unix()
    handleSetForm({
      value: !isNaN(unixDate) ? unixDate : 0,
      propertyName: 'startDateUnixSeconds',
    })
  }
  const handleChangeEndDate = (e) => {
    const value = e.target.value
    setEndDate(value)
  }
  useEffect(() => {
    if (
      startDate &&
      endDate &&
      moment(startDate).isValid() &&
      moment(endDate).isValid()
    ) {
      const daysDifference = moment(endDate).diff(moment(startDate), 'days')
      const monthsDifference = moment(endDate).diff(moment(startDate), 'months')
      const periods =
        form.lockupKind.value !== 'monthly' ? daysDifference : monthsDifference

      handleSetForm({
        value: periods > 0 ? periods : 0,
        propertyName: 'periods',
      })
    }
  }, [startDate, endDate, form.lockupKind.value])
  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount)
        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey)
          setDestinationAccount(account ? account : null)
        } else {
          setDestinationAccount(null)
        }
      })
    } else {
      setDestinationAccount(null)
    }
  }, [form.destinationAccount])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form])
  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    setMintInfo(form.governedTokenAccount?.mint?.account)
  }, [form.governedTokenAccount])
  useEffect(() => {
    const getGrantMints = async () => {
      const clientProgramId = client!.program.programId
      const { registrar } = await getRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        clientProgramId
      )
      const existingRegistrar = await tryGetRegistrar(registrar, client!)
      if (existingRegistrar) {
        setGrantAuthorities(
          existingRegistrar.votingMints.map((x) => x.grantAuthority.toBase58())
        )
      }
    }
    if (client) {
      getGrantMints()
    }
  }, [client])
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const schema = getTokenTransferSchema({ form, connection }).concat(
    yup.object().shape({
      startDateUnixSeconds: yup
        .number()
        .required('Start date required')
        .min(1, 'Start date required'),
      periods: yup
        .number()
        .required('End date required')
        .min(1, 'End date required'),
    })
  )
  return (
    <>
      <Select
        label={'Lock up kind'}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'lockupKind' })
        }}
        placeholder="Please select..."
        value={form.lockupKind.displayName}
      >
        {lockupTypes.map((lockup, idx) => {
          return (
            <Select.Option key={idx} value={lockup}>
              {lockup.displayName}
            </Select.Option>
          )
        })}
      </Select>
      <div className="text-xs max-w-lg">{form.lockupKind.info}</div>
      <GovernedAccountSelect
        label="Source account"
        governedAccounts={
          governedTokenAccountsWithoutNfts.filter((x) =>
            grantAuthorities.includes(x.governance!.pubkey.toBase58())
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
      <div className="text-sm mb-3">
        <div className="mb-2">Allow dao to clawback</div>
        <div className="flex flex-row text-xs items-center">
          <Switch
            checked={form.allowClawback}
            onChange={(checked) =>
              handleSetForm({
                value: checked,
                propertyName: 'allowClawback',
              })
            }
          />
        </div>
      </div>
      <Input
        label="Start Date"
        type="date"
        value={startDate}
        onChange={handleChangeStartDate}
        error={formErrors['startDateUnixSeconds']}
      />
      {form.lockupKind.value !== 'monthly' ? (
        <Input
          label="End date"
          type="date"
          value={endDate}
          onChange={handleChangeEndDate}
          error={formErrors['periods']}
        />
      ) : (
        <Input
          type="number"
          label="Number of months"
          min="1"
          value={form.periods}
          onChange={(e) => {
            handleSetForm({
              value: e.target.value,
              propertyName: 'periods',
            })
          }}
          error={formErrors['periods']}
        ></Input>
      )}
      {form.periods !== 0 && (
        <div>
          <div className="text-xs">Period</div>
          <div className="pt-2">
            {form.lockupKind.value !== 'monthly'
              ? getFormattedStringFromDays(form.periods)
              : `${form.periods || 0} months`}
          </div>
        </div>
      )}
      <Input
        label="Wallet address"
        value={form.destinationAccount}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destinationAccount',
          })
        }
        error={formErrors['destinationAccount']}
      />
      {destinationAccount && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">Account owner</div>
          <div className="text-xs">
            {destinationAccount.account.owner.toString()}
          </div>
        </div>
      )}
      {destinationAccountName && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">Account name</div>
          <div className="text-xs">{destinationAccountName}</div>
        </div>
      )}
      <Input
        min={mintMinAmount}
        label="Amount"
        value={form.amount}
        type="number"
        onChange={setAmount}
        step={mintMinAmount}
        error={formErrors['amount']}
        onBlur={validateAmountOnBlur}
      />
      {form.lockupKind.value === 'monthly' && form.amount && (
        <div>Vesting rate: {(form.amount / form.periods).toFixed(2)} p/m</div>
      )}
    </>
  )
}

export default Grant
