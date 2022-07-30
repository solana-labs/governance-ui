/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { Connection, PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  MangoDepositToMangoAccountFormCsv,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import {
  Config,
  MangoClient,
  makeDepositInstruction,
  BN,
} from '@blockworks-foundation/mango-client'
import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import Papa from 'papaparse'
import Button from '@components/Button'
import { tryParseKey } from '@tools/validators/pubkey'
import { abbreviateAddress } from '@utils/formatting'
const allowedExtensions = ['csv']

const MakeDepositToMangoAccountCsv = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { governedTokenAccounts } = useGovernanceAssets()
  const tokenAccounts = governedTokenAccounts.filter((x) => x.isToken)
  const connection = useWalletStore((s) => s.connection)
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  // It state will contain the error when
  // correct file extension is not used
  const [error, setError] = useState('')

  // It will store the file uploaded by the user
  const [file, setFile] = useState('')
  // This function will be called when
  // the file input changes
  const handleFileChange = (e) => {
    setError('')

    // Check if user has entered the file
    if (e.target.files.length) {
      const inputFile = e.target.files[0]

      // Check the file extensions, if it not
      // included in the allowed extensions
      // we show the error
      const fileExtension = inputFile?.type.split('/')[1]
      if (!allowedExtensions.includes(fileExtension)) {
        setError('Please input a csv file')
        return
      }

      // If input type is correct set the state
      setFile(inputFile)
    }
  }
  const handleParse = () => {
    // If user clicks the parse button without
    // a file we show a error
    if (!file) return setError('Enter a valid file')

    // Initialize a reader which allows user
    // to read any file or blob.
    const reader = new FileReader()

    // Event listener on reader when the file
    // loads, we parse it and set the data.
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target?.result, { header: true })
      const parsedData = csv?.data
      const data = parsedData
      handleSetForm({ propertyName: 'data', value: data })
    }
    reader.readAsText(file as any)
  }
  const [form, setForm] = useState<MangoDepositToMangoAccountFormCsv>({
    governedAccount: null,
    data: [],
  })
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    const serializedInstructions: string[] = []
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      console.log('1234')
      const mangoConnection =
        connection.cluster === 'localnet'
          ? new Connection(Config.ids().cluster_urls.mainnet)
          : connection.current
      const GROUP = connection.cluster === 'devnet' ? 'devnet.2' : 'mainnet.1'
      const groupConfig = Config.ids().getGroupWithName(GROUP)!
      const client = new MangoClient(
        connection.current,
        groupConfig.mangoProgramId
      )
      const group = await client.getMangoGroup(groupConfig.publicKey)
      const rootBanks = await group.loadRootBanks(mangoConnection)
      const rootBank = group.tokens.find(
        (x) =>
          x.mint.toBase58() ===
          form.governedAccount?.extensions.mint?.publicKey.toBase58()
      )?.rootBank
      const quoteRootBank = rootBanks[group.getRootBankIndex(rootBank!)]
      const quoteNodeBank = quoteRootBank?.nodeBankAccounts[0]
      for (const deposit of form.data) {
        const mangoAccountPk = tryParseKey(deposit.mango_account)
          ? new PublicKey(deposit.mango_account)
          : null
        if (mangoAccountPk) {
          const mintAmount = parseMintNaturalAmountFromDecimal(
            deposit.srm_payout!,
            form.governedAccount.extensions.mint!.account.decimals
          )
          //Mango instruction call and serialize
          const depositIx = makeDepositInstruction(
            groupConfig.mangoProgramId,
            groupConfig.publicKey,
            form.governedAccount.extensions.token!.account.owner,
            group.mangoCache,
            mangoAccountPk,
            quoteRootBank!.publicKey,
            quoteNodeBank!.publicKey,
            quoteNodeBank!.vault,
            form.governedAccount.extensions.transferAddress!,
            new BN(mintAmount)
          )
          serializedInstructions.push(serializeInstructionToBase64(depositIx))
        }
      }
    }
    const obj: UiInstruction = {
      serializedInstruction: '',
      additionalSerializedInstructions: serializedInstructions,
      isValid,
      governance: form.governedAccount?.governance,
      chunkSplitByDefault: true,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [JSON.stringify(form)])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
  })
  const renderTable = () => {
    const cols = Object.keys(form.data[0]).map((col) => col)
    return (
      <div className="flex flex-col w-full space-y-2">
        <div className="flex">
          <div className="w-12"></div>
          {cols.map((col) => (
            <div className="flex-1 font-bold" key={col}>
              {col}
            </div>
          ))}
        </div>

        {form.data.map((data, idx) => (
          <div className="flex" key={idx}>
            <div className="w-12">{idx + 1}.</div>
            {cols.map((col) => {
              const val = data[col]
              const pubkey = tryParseKey(val)
              const value = pubkey ? abbreviateAddress(pubkey) : val
              return (
                <div className="flex-1" key={col}>
                  {value}
                  {col === 'mango_account' && !pubkey && (
                    <span className="text-red">Invalid pubkey</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }
  return (
    <>
      <GovernedAccountSelect
        label="Token account"
        governedAccounts={tokenAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <label htmlFor="csvInput" style={{ display: 'block' }}>
        Enter CSV File
      </label>
      <input
        onChange={handleFileChange}
        id="csvInput"
        name="file"
        type="File"
      />
      <div>
        <Button onClick={handleParse}>Parse</Button>
      </div>
      <div
        style={{ marginTop: '3rem', marginBottom: '3rem' }}
        className="flex space-x-2"
      >
        {error && error}
        {!error && form.data && form.data.length !== 0 && renderTable()}
      </div>
    </>
  )
}

export default MakeDepositToMangoAccountCsv
