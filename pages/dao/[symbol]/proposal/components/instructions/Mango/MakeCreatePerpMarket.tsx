/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey, Transaction } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  MangoMakeCreatePerpMarketForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance, TOKEN_PROGRAM_ID } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import {
  BN,
  BookSideLayout,
  Config,
  createAccountInstruction,
  I80F48,
  makeCreatePerpMarketInstruction,
  MangoClient,
  PerpEventLayout,
  PerpEventQueueHeaderLayout,
} from '@blockworks-foundation/mango-client'
import * as common from '@project-serum/common'
import { AccountType } from '@utils/uiTypes/assets'

const MakeCreatePerpMarket = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)

  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const governedProgramAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.PROGRAM
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MangoMakeCreatePerpMarketForm>({
    governedAccount: undefined,
    programId: programId?.toString(),
    mangoGroup: undefined,
    oracleAccount: undefined,
    baseDecimals: 8,
    baseLotSize: 1,
    quoteLotSize: 1,
    mngoPerPeriod: 250,
    maxDepthBps: 1,
    lmSizeShift: 0,
    makerFee: -0.0003,
    takerFee: 0.0004,
    maintLeverage: 20,
    initLeverage: 10,
    liquidationFee: 0.025,
    rate: 0.03,
    exp: 2,
    targetPeriodLength: 3600,
    version: 1,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      form.mangoGroup &&
      form.oracleAccount &&
      wallet?.publicKey
    ) {
      const groupConfig = Config.ids().groups.find((c) =>
        c.publicKey.equals(new PublicKey(form.mangoGroup!))
      )!

      const oraclePk = new PublicKey(form.oracleAccount)

      const mangoGroup = await new MangoClient(
        connection,
        groupConfig.mangoProgramId
      ).getMangoGroup(groupConfig.publicKey)

      const mngoToken = groupConfig.tokens.filter((token) => {
        return token.symbol === 'MNGO'
      })[0]
      const mngoMintPk = mngoToken.mintKey

      const provider = new common.Provider(
        connection,
        { ...wallet!, publicKey: wallet!.publicKey! },
        common.Provider.defaultOptions()
      )
      const tx = new Transaction()

      const makeEventQueueAccountInstruction = await createAccountInstruction(
        connection,
        provider.wallet.publicKey,
        PerpEventQueueHeaderLayout.span + 256 * PerpEventLayout.span,
        groupConfig.mangoProgramId
      )
      tx.add(makeEventQueueAccountInstruction.instruction)

      const makeBidAccountInstruction = await createAccountInstruction(
        connection,
        provider.wallet.publicKey,
        BookSideLayout.span,
        groupConfig.mangoProgramId
      )
      tx.add(makeBidAccountInstruction.instruction)

      const makeAskAccountInstruction = await createAccountInstruction(
        connection,
        provider.wallet.publicKey,
        BookSideLayout.span,
        groupConfig.mangoProgramId
      )
      tx.add(makeAskAccountInstruction.instruction)

      tx.recentBlockhash = (
        await connection.getLatestBlockhash('max')
      ).blockhash
      const signers = [
        makeEventQueueAccountInstruction.account,
        makeBidAccountInstruction.account,
        makeAskAccountInstruction.account,
      ]
      tx.feePayer = wallet!.publicKey!
      tx.partialSign(...signers)
      const signed = await wallet?.signTransaction(tx)
      const txid = await connection.sendRawTransaction(signed!.serialize())
      console.log('created accounts', txid)

      const [perpMarketPk] = await PublicKey.findProgramAddress(
        [
          mangoGroup.publicKey.toBytes(),
          new Buffer('PerpMarket', 'utf-8'),
          oraclePk.toBytes(),
        ],
        groupConfig.mangoProgramId
      )

      const [mngoVaultPk] = await PublicKey.findProgramAddress(
        [
          perpMarketPk.toBytes(),
          TOKEN_PROGRAM_ID.toBytes(),
          mngoMintPk.toBytes(),
        ],
        groupConfig.mangoProgramId
      )

      const instruction = await makeCreatePerpMarketInstruction(
        groupConfig.mangoProgramId,
        mangoGroup.publicKey,
        oraclePk,
        perpMarketPk,
        makeEventQueueAccountInstruction.account.publicKey,
        makeBidAccountInstruction.account.publicKey,
        makeAskAccountInstruction.account.publicKey,
        mngoMintPk,
        mngoVaultPk,
        form.governedAccount?.governance?.pubkey,
        mangoGroup.signerKey,
        I80F48.fromNumber(form.maintLeverage),
        I80F48.fromNumber(form.initLeverage),
        I80F48.fromNumber(form.liquidationFee),
        I80F48.fromNumber(form.makerFee),
        I80F48.fromNumber(form.takerFee),
        new BN(form.baseLotSize),
        new BN(form.quoteLotSize),
        I80F48.fromNumber(form.rate),
        I80F48.fromNumber(form.maxDepthBps),
        new BN(form.targetPeriodLength),
        new BN(form.mngoPerPeriod * Math.pow(10, mngoToken.decimals)),
        new BN(form.exp),
        new BN(form.version),
        new BN(form.lmSizeShift),
        new BN(form.baseDecimals)
      )

      serializedInstruction = serializeInstructionToBase64(instruction)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  const schema = yup.object().shape({
    bufferAddress: yup.number(),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  const groupConfig = Config.ids().groups.find((c) =>
    new PublicKey(form.mangoGroup || 0)?.equals(c.publicKey)
  )!

  const quoteDecimals = groupConfig?.tokens.find(
    (t) => t.symbol == groupConfig?.quoteSymbol
  )?.decimals

  const recommendedLmSizeShift =
    form.maxDepthBps &&
    Math.floor(Math.log2((form.maxDepthBps as any) as number) - 3)

  const recommendedMaintLeverage =
    form.initLeverage && ((form.initLeverage as any) as number) * 2

  const recommendedLiquidationFee =
    form.initLeverage && 1 / (((form.initLeverage as any) as number) * 4)

  return (
    <>
      {/* if you need more fields add theme to interface MangoMakeChangeMaxAccountsForm
        then you can add inputs in here */}
      <GovernedAccountSelect
        label="Program"
        governedAccounts={governedProgramAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Input
        label="Mango group"
        value={form.mangoGroup}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mangoGroup',
          })
        }
        error={formErrors['mangoGroup']}
      />
      <Input
        label="Oracle account"
        value={form.oracleAccount}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'oracleAccount',
          })
        }
        error={formErrors['oracleAccount']}
      />
      <Input
        label="Base decimals"
        value={form.baseDecimals}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'baseDecimals',
          })
        }
        error={formErrors['baseDecimals']}
      />
      <Input
        label={`Base lot size (size tick: ${
          form.baseLotSize / Math.pow(10, form.baseDecimals)
        }`}
        value={form.baseLotSize}
        type="number"
        min={1}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'baseLotSize',
          })
        }
        error={formErrors['baseLotSize']}
      />
      <Input
        label={`Quote lot size (price tick: ${
          form.quoteLotSize / Math.pow(10, quoteDecimals!)
        }`}
        value={form.quoteLotSize}
        type="number"
        min={1}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'quoteLotSize',
          })
        }
        error={formErrors['quoteLotSize']}
      />
      <Input
        label="MNGO per period"
        value={form.mngoPerPeriod}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mngoPerPeriod',
          })
        }
        error={formErrors['mngoPerPeriod']}
      />
      <Input
        label="Max depth contracts"
        value={form.maxDepthBps}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'maxDepthBps',
          })
        }
        error={formErrors['maxDepthBps']}
      />
      <Input
        label={`Liquidity mining size shift (recommended: ${recommendedLmSizeShift})`}
        value={form.lmSizeShift}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'lmSizeShift',
          })
        }
        error={formErrors['lmSizeShift']}
      />
      <Input
        label="Maker fee"
        value={form.makerFee}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'makerFee',
          })
        }
        error={formErrors['makerFee']}
      />
      <Input
        label="Taker fee"
        value={form.takerFee}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'takerFee',
          })
        }
        error={formErrors['takerFee']}
      />
      <Input
        label="Initial leverage"
        value={form.initLeverage}
        type="number"
        min={1}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'initLeverage',
          })
        }
        error={formErrors['initLeverage']}
      />
      <Input
        label={`Maintenance leverage (recommended: ${recommendedMaintLeverage}`}
        value={form.maintLeverage}
        type="number"
        min={1}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'maintLeverage',
          })
        }
        error={formErrors['maintLeverage']}
      />
      <Input
        label={`Liquidation fee (recommended: ${recommendedLiquidationFee}`}
        value={form.liquidationFee}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'liquidationFee',
          })
        }
        error={formErrors['liquidationFee']}
      />
      <Input
        label="Rate"
        value={form.rate}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'rate',
          })
        }
        error={formErrors['rate']}
      />

      <Input
        label="Exp"
        value={form.exp}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'exp',
          })
        }
        error={formErrors['exp']}
      />

      <Input
        label="Target period length"
        value={form.targetPeriodLength}
        type="number"
        min={1}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'targetPeriodLength',
          })
        }
        error={formErrors['targetPeriodLength']}
      />

      <Input
        label="Version"
        value={form.version}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'version',
          })
        }
        error={formErrors['version']}
      />
    </>
  )
}

export default MakeCreatePerpMarket
