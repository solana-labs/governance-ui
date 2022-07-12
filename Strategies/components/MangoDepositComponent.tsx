import {
  MangoAccount,
  MangoAccountLayout,
  PublicKey,
} from '@blockworks-foundation/mango-client';
import Button, { LinkButton } from '@components/Button';
import Input from '@components/inputs/Input';
import Loading from '@components/Loading';
import Tooltip from '@components/Tooltip';
import useGovernanceAssets from '@hooks/useGovernanceAssets';
import useQueryContext from '@hooks/useQueryContext';
import useRealm from '@hooks/useRealm';
import { getProgramVersionForRealm } from '@models/registry/api';
import {
  getNativeTreasuryAddress,
  RpcContext,
  withCreateNativeTreasury,
} from '@solana/spl-governance';
import { SystemProgram, TransactionInstruction } from '@solana/web3.js';
import {
  fmtMintAmount,
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units';
import { abbreviateAddress, precision } from '@utils/formatting';
import tokenService from '@utils/services/token';
import { GovernedTokenAccount } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useWalletStore from 'stores/useWalletStore';
import useMarketStore, { MarketStore } from 'Strategies/store/marketStore';
import { HandleCreateProposalWithStrategy } from 'Strategies/types/types';
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore';
import ButtonGroup from '@components/ButtonGroup';
import Switch from '@components/Switch';
import Select from '@components/inputs/Select';
import CreateRefForm from './CreateRefLink';
import DelegateForm from './Delegate';
import AdditionalProposalOptions from '@components/AdditionalProposalOptions';
import { validateInstruction } from '@utils/instructionTools';
import * as yup from 'yup';
import { getValidatedPublickKey } from '@utils/validations';
import { BN_ZERO } from '@utils/helpers';

const DEPOSIT = 'Deposit';
const CREATE_REF_LINK = 'Create Referral Link';
const DELEGATE_ACCOUNT = 'Delegate';

const MangoDepositComponent = ({
  handledMint,
  currentPositionFtm,
  createProposalFcn,
  mangoAccounts,
  governedTokenAccount,
}: {
  handledMint: string;
  currentPositionFtm: string;
  createProposalFcn: HandleCreateProposalWithStrategy;
  mangoAccounts: MangoAccount[];
  governedTokenAccount: GovernedTokenAccount;
}) => {
  const router = useRouter();
  const { fmtUrlWithCluster } = useQueryContext();
  const {
    proposals,
    realmInfo,
    realm,
    ownVoterWeight,
    mint,
    councilMint,
    symbol,
  } = useRealm();
  const [isDepositing, setIsDepositing] = useState(false);
  const [
    selectedMangoAccount,
    setSelectedMangoAccount,
  ] = useState<MangoAccount | null>(
    mangoAccounts.length ? mangoAccounts[0] : null,
  );
  const [voteByCouncil, setVoteByCouncil] = useState(false);
  const client = useVoteStakeRegistryClientStore((s) => s.state.client);
  const market = useMarketStore((s) => s);
  const connection = useWalletStore((s) => s.connection);
  const wallet = useWalletStore((s) => s.current);
  const tokenInfo = tokenService.getTokenInfo(handledMint);
  const { canUseTransferInstruction } = useGovernanceAssets();
  const treasuryAmount = governedTokenAccount?.token
    ? governedTokenAccount.token.account.amount
    : BN_ZERO;
  const mintInfo = governedTokenAccount?.mint?.account;
  const [form, setForm] = useState({
    title: '',
    description: '',
    delegateAddress: '',
    delegateDeposit: false,
    amount: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const proposalTitle = `Deposit ${form.amount} ${
    tokenService.getTokenInfo(governedTokenAccount.mint!.publicKey.toBase58())
      ?.symbol || 'tokens'
  } to Mango account`;
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({});
    setForm({ ...form, [propertyName]: value });
  };
  const [proposalType, setProposalType] = useState('Deposit');
  const mintMinAmount = mintInfo ? getMintMinAmountAsDecimal(mintInfo) : 1;
  const maxAmount = mintInfo
    ? getMintDecimalAmount(mintInfo, treasuryAmount)
    : new BigNumber(0);
  const maxAmountFtm = fmtMintAmount(mintInfo, treasuryAmount);
  const currentPrecision = precision(mintMinAmount);
  const group = market!.group!;
  const depositIndex = group.tokens.findIndex(
    (x) => x.mint.toBase58() === handledMint,
  );
  const tabs = [
    { val: DEPOSIT, isVisible: true },
    { val: CREATE_REF_LINK, isVisible: selectedMangoAccount !== null },
    { val: DELEGATE_ACCOUNT, isVisible: selectedMangoAccount !== null },
  ]
    .filter((x) => x.isVisible)
    .map((x) => x.val);
  const validateAmountOnBlur = () => {
    handleSetForm({
      propertyName: 'amount',
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(form.amount)),
        ).toFixed(currentPrecision),
      ),
    });
  };
  useEffect(() => {
    if (selectedMangoAccount === null) {
      setProposalType(DEPOSIT);
    }
  }, [selectedMangoAccount]);
  const handleSolPayment = async () => {
    const instructions: TransactionInstruction[] = [];
    const toAddress = await getNativeTreasuryAddress(
      realm!.owner,
      governedTokenAccount!.governance!.pubkey,
    );
    const hasSolAccount = await connection.current.getParsedAccountInfo(
      toAddress,
    );
    if (!hasSolAccount.value) {
      await withCreateNativeTreasury(
        instructions,
        realm!.owner,
        governedTokenAccount!.governance!.pubkey,
        wallet!.publicKey!,
      );
    }

    const minRentAmount = await connection.current.getMinimumBalanceForRentExemption(
      MangoAccountLayout.span,
    );

    const transferIx = SystemProgram.transfer({
      fromPubkey: wallet!.publicKey!,
      toPubkey: toAddress,
      lamports: minRentAmount,
    });
    instructions.push(transferIx);
    return instructions;
  };
  const handleDeposit = async () => {
    const isValid = await validateInstruction({ schema, form, setFormErrors });
    if (!isValid) {
      return;
    }
    try {
      setIsDepositing(true);
      const prerequisiteInstructions: TransactionInstruction[] = [];
      const mangoAccountPk = selectedMangoAccount?.publicKey || null;
      if (!mangoAccountPk) {
        const solAccountInstruction = await handleSolPayment();
        prerequisiteInstructions.push(...solAccountInstruction);
      }
      const rpcContext = new RpcContext(
        new PublicKey(realm!.owner.toString()),
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection.current,
        connection.endpoint,
      );
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount!,
        governedTokenAccount!.mint!.account.decimals,
      );
      const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
        governedTokenAccount!.governance!.account.config,
      );
      const defaultProposalMint = voteByCouncil
        ? realm?.account.config.councilMint
        : !mint?.supply.isZero()
        ? realm!.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm!.account.config.councilMint
        : undefined;
      const proposalAddress = await createProposalFcn(
        rpcContext,
        handledMint,
        {
          ...form,
          mintAmount,
          mangoAccountPk,
          mangoAccounts,
          proposalCount: Object.keys(proposals).length,
        },
        realm!,
        governedTokenAccount!,
        ownTokenRecord.pubkey,
        defaultProposalMint!,
        governedTokenAccount!.governance!.account!.proposalCount,
        prerequisiteInstructions,
        false,
        market,
        client,
      );
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`,
      );
      router.push(url);
    } catch (e) {
      console.log(e);
    }
    setIsDepositing(false);
  };
  const schema = yup.object().shape({
    delegateAddress: yup
      .string()
      .test(
        'accountTests',
        'Delegate address validation error',
        function (val: string) {
          if (!form.delegateDeposit) {
            return true;
          }
          if (val) {
            try {
              return !!getValidatedPublickKey(val);
            } catch (e) {
              console.log(e);
              return this.createError({
                message: `${e}`,
              });
            }
          } else {
            return this.createError({
              message: `Delegate address is required`,
            });
          }
        },
      ),
    amount: yup.number().required('Amount is required').min(mintMinAmount),
  });
  return (
    <div>
      <Select
        className="mb-3"
        label="Mango account"
        value={
          <MangoAccountItem
            value={selectedMangoAccount}
            market={market}
            depositIndex={depositIndex}
          ></MangoAccountItem>
        }
        placeholder="Please select..."
        onChange={(val) => setSelectedMangoAccount(val)}
      >
        {mangoAccounts.map((value) => (
          <Select.Option key={value.publicKey.toBase58()} value={value}>
            <MangoAccountItem
              value={value}
              market={market}
              depositIndex={depositIndex}
            ></MangoAccountItem>
          </Select.Option>
        ))}
        <Select.Option key={null} value={null}>
          <div>Create new account</div>
        </Select.Option>
      </Select>
      <div className="pb-4">
        <ButtonGroup
          activeValue={proposalType}
          className="h-10"
          onChange={(v) => setProposalType(v)}
          values={tabs}
        />
      </div>
      {proposalType === DELEGATE_ACCOUNT && (
        <DelegateForm
          market={market}
          governance={governedTokenAccount!.governance!}
          selectedMangoAccount={selectedMangoAccount!}
        ></DelegateForm>
      )}
      {proposalType === CREATE_REF_LINK && (
        <CreateRefForm
          selectedMangoAccount={selectedMangoAccount!}
          market={market}
          mint={new PublicKey(handledMint)}
        ></CreateRefForm>
      )}

      {proposalType === DEPOSIT && (
        <div>
          <div className="flex mb-1.5 text-sm">
            Amount
            <div className="ml-auto flex items-center text-xs">
              <span className="text-fgd-3 mr-1">Bal:</span> {maxAmountFtm}
              <LinkButton
                onClick={() =>
                  handleSetForm({
                    propertyName: 'amount',
                    value: maxAmount.toNumber(),
                  })
                }
                className="font-bold ml-2 text-primary-light"
              >
                Max
              </LinkButton>
            </div>
          </div>
          <Input
            error={formErrors['amount']}
            min={mintMinAmount}
            value={form.amount}
            type="number"
            onChange={(e) =>
              handleSetForm({ propertyName: 'amount', value: e.target.value })
            }
            step={mintMinAmount}
            suffix="MNGO"
            onBlur={validateAmountOnBlur}
          />
          {selectedMangoAccount === null && (
            <>
              <div className="flex items-center justify-between py-3 text-sm">
                Delegate deposit
                <Switch
                  checked={form.delegateDeposit}
                  onChange={(checked) =>
                    handleSetForm({
                      propertyName: 'delegateDeposit',
                      value: checked,
                    })
                  }
                />
              </div>
              {form.delegateDeposit && (
                <Input
                  error={formErrors['delegateAddress']}
                  label={'Delegate address'}
                  value={form.delegateAddress}
                  type="text"
                  onChange={(e) =>
                    handleSetForm({
                      propertyName: 'delegateAddress',
                      value: e.target.value,
                    })
                  }
                />
              )}
            </>
          )}
          <AdditionalProposalOptions
            title={form.title}
            description={form.description}
            defaultTitle={proposalTitle}
            setTitle={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'title',
              })
            }
            setDescription={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'description',
              })
            }
            voteByCouncil={voteByCouncil}
            setVoteByCouncil={setVoteByCouncil}
          />
          <div className="border border-fgd-4 p-4 rounded-md mb-6 mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-fgd-3">Current Deposits</span>
              <span className="font-bold text-fgd-1">
                {currentPositionFtm || 0}{' '}
                <span className="font-normal text-fgd-3">
                  {tokenInfo?.symbol}
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fgd-3">Proposed Deposit</span>
              <span className="font-bold text-fgd-1">
                {form.amount?.toLocaleString() || (
                  <span className="font-normal text-red">Enter an amount</span>
                )}{' '}
                <span className="font-normal text-fgd-3">
                  {form.amount && tokenInfo?.symbol}
                </span>
              </span>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={handleDeposit}
            disabled={
              !form.amount || !canUseTransferInstruction || isDepositing
            }
          >
            <Tooltip
              content={
                !canUseTransferInstruction
                  ? 'Please connect wallet with enough voting power to create treasury proposals'
                  : !form.amount
                  ? 'Please input the amount'
                  : ''
              }
            >
              {!isDepositing ? 'Propose deposit' : <Loading></Loading>}
            </Tooltip>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MangoDepositComponent;

const MangoAccountItem = ({
  value,
  market,
  depositIndex,
}: {
  value: MangoAccount | null;
  market: MarketStore;
  depositIndex: number;
}) => {
  const group = market!.group!;
  return value ? (
    <div className="flex flex-col">
      <div className="text-xs">{abbreviateAddress(value.publicKey)}</div>
      <div className="text-xs">
        Deposit:{' '}
        {new BigNumber(
          value
            .getUiDeposit(
              market.cache!.rootBankCache[depositIndex],
              group,
              depositIndex,
            )
            .toNumber(),
        ).toFormat(2)}
      </div>
      {value.delegate.toBase58() && (
        <div>Delegate: {abbreviateAddress(value.delegate)}</div>
      )}
    </div>
  ) : (
    <div>Create new account</div>
  );
};
