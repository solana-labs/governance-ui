import { ProgramAccount, Governance, serializeInstructionToBase64 } from '@solana/spl-governance'
import { SymmetryDepositForm, SymmetryWithdrawForm, UiInstruction } from '@utils/uiTypes/proposalCreationTypes';
import { useContext, useEffect, useState } from 'react';
import Tooltip from '@components/Tooltip'
import Input from '@components/inputs/Input'
import { NewProposalContext } from '../../../new';
import Switch from '@components/Switch';
import { Basket, BasketsSDK, FilterOption } from "@symmetry-hq/baskets-sdk";
import { sellBasketIx } from "@symmetry-hq/baskets-sdk/dist/basketInstructions";

import { useConnection } from '@solana/wallet-adapter-react';
import Button from '@components/Button'
import useGovernanceAssets from '@hooks/useGovernanceAssets';
import GovernedAccountSelect from '../../GovernedAccountSelect';
import { SelectBasketModal } from './SelectBasketModal';
import Select from '@components/inputs/Select';
import { PublicKey } from '@solana/web3.js';

const SymmetryWithdraw = ({ 
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance>
}) => {
  const {connection} = useConnection();
  const { assetAccounts } = useGovernanceAssets();
  const [basketsSdk, setBasketSdk] = useState<BasketsSDK|undefined>(undefined);
  const [form, setForm] = useState<SymmetryWithdrawForm>({
    governedAccount: undefined,
    basketAddress: undefined,
    withdrawAmount: 0,
    withdrawType: 3
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext);
  const [managedBaskets, setManagedBaskets] = useState<any>(undefined);
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [assetAccountsLoaded, setAssetAccountsLoaded] = useState(false);
  const [selectedBasket, setSelectedBasket] = useState<any>(undefined);

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const handleSelectBasket = (basket: any) => {
    handleSetForm({ propertyName: 'basketAddress', value: basket.basket.ownAddress })
  }

  useEffect(() => {
    if(assetAccounts && assetAccounts.length > 0 && !assetAccountsLoaded)
      setAssetAccountsLoaded(true);
  }, [assetAccounts]);

  useEffect(() => {
    if(assetAccountsLoaded) {
      const basketsOwnerAccounts: FilterOption[] = assetAccounts.filter(x => x.isSol).map((token) => {
        return {
          filterType: 'manager',
          filterPubkey: token.pubkey
        }
      })
      BasketsSDK.init(connection).then((sdk) => {
        setBasketSdk(sdk);
        sdk.findBaskets(basketsOwnerAccounts).then((baskets) => {
          sdk.getCurrentCompositions(baskets).then((compositions) => {
            const basketAccounts:any[] = [];
            baskets.map((basket, i) => {

              basketAccounts.push({
                governedAccount: assetAccounts.filter(x => x.pubkey.toBase58() === basket.data.manager.toBase58())[0],
                basket: basket,
                composition: compositions[i]
              });
            });
            setManagedBaskets(basketAccounts);
          });
        });
      });
    }
  }, [assetAccountsLoaded]);

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  async function getInstruction(): Promise<UiInstruction> {
    const ix = await sellBasketIx(
      connection, 
      //@ts-ignore
      form.governedAccount?.governance.nativeTreasuryAddress,
      form.basketAddress,
      Number(form.withdrawAmount),
      form.withdrawType
    )
    
    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount?.governance
    };
  }
  
  return <>
    {
      managedBaskets ?
      <Select
        label='Select Basket'
        subtitle='Select a basket managed by the DAO'
        value={form.basketAddress?.toBase58()}
        placeholder="Select Basket"
        onChange={(e) => {
          handleSetForm({ propertyName: 'basketAddress', value: new PublicKey(e) })
          setSelectedBasket(managedBaskets.filter(x => x.basket.ownAddress.toBase58() === e)[0]);
        }}
      >
        {
          managedBaskets.map((basket, i) => {
            return <Select.Option key={i} value={basket.basket.ownAddress.toBase58()}>
              {
                basket.composition.name + " (" + basket.composition.symbol + ") : " + basket.basket.ownAddress.toBase58()
              }
            </Select.Option>
          })
        }
      </Select>
      :
      <p className='text-sm'>Loading Baskets Managed by the DAO</p>
    }
    {
      form.basketAddress &&
      <div className='flex flex-col gap-2'>
        <p className='text-fgd-1'>Selected Basket:</p>
        <p className='text-fgd-3'>{form.basketAddress.toBase58()}</p>
        <a className='p-3 bg-bkg-4 hover:bg-bkg-5 w-fit rounded-md flex items-center gap-2' href={`https://app.symmetry.fi/view/${form.basketAddress.toBase58()}`} target='_blank' rel='noreferrer'>
          <img src={'/img/symmetry.png'} className='h-4 w-4' />
          <p className='text-sm text-fgd-1'>View Basket on Symmetry</p>
        </a>
      </div>
    }
    {
      form.basketAddress && 
      <GovernedAccountSelect
      label="Token to Withdraw"
      governedAccounts={assetAccounts.filter(x => x.isToken).filter(x => x.extensions.mint?.publicKey.toBase58() === selectedBasket?.composition?.basketTokenMint)}
      onChange={(value) => {
        handleSetForm({ value, propertyName: 'governedAccount' })
      }}
      value={form.governedAccount}
      error={formErrors['governedAccount']}
      shouldBeGoverned={shouldBeGoverned}
      governance={governance}
      type='token'
    />
    }

      <Input
        subtitle={"Select amount of basket tokens you'd like to withdraw with."}
        label="Withdraw Amount"
        value={form.withdrawAmount}
        type="number"
        onChange={(e) => handleSetForm({ propertyName: 'withdrawAmount', value: e.target.value })}
        error={formErrors['withdrawAmount']}
      />
      <Select
        label='Withdrawal Type'
        subtitle='You can withdraw basket tokens directly, or rebalance them and receive USDC'
        value={form.withdrawType}
        placeholder="Withdrawal Type"
        onChange={(e) => {
          handleSetForm({ propertyName: 'withdrawType', value: e })
        }}
        componentLabel={
          form.withdrawType === 2 ? 'Rebalance & Receive USDC' : 'Withdraw Basket Composition'
        }
      >
        <Select.Option key={0} value={2}>
          Rebalance & Receive USDC
        </Select.Option>
        <Select.Option key={1} value={3}>
          Withdraw Basket Composition
        </Select.Option>
      </Select>
  </>
}

export default SymmetryWithdraw;