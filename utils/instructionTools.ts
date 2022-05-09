import { serializeInstructionToBase64 } from '@solana/spl-governance';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk';
import {
  getMintNaturalAmountFromDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units';
import type { ConnectionContext } from 'utils/connection';
import { getATA } from './ataTools';
import { isFormValid } from './formValidation';
import {
  getTokenAccountsByMint,
  GovernedMintInfoAccount,
  GovernedTokenAccount,
} from './tokens';
import { FormInstructionData } from './uiTypes/proposalCreationTypes';

export const validateInstruction = async ({
  schema,
  form,
  setFormErrors,
}): Promise<boolean> => {
  const { isValid, validationErrors } = await isFormValid(schema, form);
  setFormErrors(validationErrors);
  return isValid;
};

export async function getTransferInstruction({
  schema,
  form,
  programId,
  connection,
  wallet,
  currentAccount,
  setFormErrors,
}: {
  schema: any;
  form: any;
  programId: PublicKey | undefined;
  connection: ConnectionContext;
  wallet: WalletAdapter | undefined;
  currentAccount: GovernedTokenAccount | null;
  setFormErrors: any;
}): Promise<FormInstructionData> {
  const isValid = await validateInstruction({ schema, form, setFormErrors });
  let serializedInstruction = '';
  const prerequisiteInstructions: TransactionInstruction[] = [];
  const governedTokenAccount = form.governedTokenAccount as GovernedTokenAccount;
  if (
    isValid &&
    programId &&
    governedTokenAccount?.token?.publicKey &&
    governedTokenAccount?.token &&
    governedTokenAccount?.mint?.account
  ) {
    const sourceAccount = governedTokenAccount.token?.account.address;
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount);
    const mintPK = form.governedTokenAccount.mint.publicKey;
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      governedTokenAccount.mint.account.decimals,
    );

    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
      connection: connection,
      receiverAddress: destinationAccount,
      mintPK,
      wallet: wallet!,
    });
    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          mintPK, // mint
          receiverAddress, // ata
          destinationAccount, // owner of token account
          wallet!.publicKey!, // fee payer
        ),
      );
    }
    const transferIx = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      sourceAccount,
      receiverAddress,
      currentAccount!.token!.account.owner,
      [],
      new u64(mintAmount.toString()),
    );
    serializedInstruction = serializeInstructionToBase64(transferIx);
  }

  const obj: FormInstructionData = {
    serializedInstruction,
    isValid,
    governance: currentAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  };
  return obj;
}

export async function getSolTransferInstruction({
  schema,
  form,
  programId,
  currentAccount,
  setFormErrors,
}: {
  schema: any;
  form: any;
  programId: PublicKey | undefined;
  connection: ConnectionContext;
  wallet: WalletAdapter | undefined;
  currentAccount: GovernedTokenAccount | null;
  setFormErrors: any;
}): Promise<FormInstructionData> {
  const isValid = await validateInstruction({ schema, form, setFormErrors });
  let serializedInstruction = '';
  const prerequisiteInstructions: TransactionInstruction[] = [];
  const governedTokenAccount = form.governedTokenAccount as GovernedTokenAccount;
  if (
    isValid &&
    programId &&
    governedTokenAccount?.token?.publicKey &&
    governedTokenAccount?.token &&
    governedTokenAccount?.mint?.account
  ) {
    const sourceAccount = governedTokenAccount.transferAddress;
    const destinationAccount = new PublicKey(form.destinationAccount);
    //We have configured mint that has same decimals settings as SOL
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      governedTokenAccount.mint.account.decimals,
    );

    const transferIx = SystemProgram.transfer({
      fromPubkey: sourceAccount!,
      toPubkey: destinationAccount,
      lamports: mintAmount,
    });
    serializedInstruction = serializeInstructionToBase64(transferIx);
  }

  const obj: FormInstructionData = {
    serializedInstruction,
    isValid,
    governance: currentAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  };
  return obj;
}

export async function getTransferNftInstruction({
  schema,
  form,
  programId,
  connection,
  wallet,
  currentAccount,
  setFormErrors,
  nftMint,
}: {
  schema: any;
  form: any;
  programId: PublicKey | undefined;
  connection: ConnectionContext;
  wallet: WalletAdapter | undefined;
  currentAccount: GovernedTokenAccount | null;
  setFormErrors: any;
  nftMint: string;
}): Promise<FormInstructionData> {
  const isValid = await validateInstruction({ schema, form, setFormErrors });
  let serializedInstruction = '';
  const prerequisiteInstructions: TransactionInstruction[] = [];
  if (
    isValid &&
    programId &&
    form.governedTokenAccount?.token?.publicKey &&
    form.governedTokenAccount?.token &&
    form.governedTokenAccount?.mint?.account
  ) {
    const tokenAccountsWithNftMint = await getTokenAccountsByMint(
      connection.current,
      nftMint,
    );
    //we find ata from connected wallet that holds the nft
    const sourceAccount = tokenAccountsWithNftMint.find(
      (x) =>
        x.account.owner.toBase58() ===
        form.governedTokenAccount.governance.pubkey?.toBase58(),
    )?.publicKey;
    if (!sourceAccount) {
      throw 'Nft ata not found for governance';
    }
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount);
    const mintPK = new PublicKey(nftMint);
    const mintAmount = 1;
    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
      connection: connection,
      receiverAddress: destinationAccount,
      mintPK,
      wallet: wallet!,
    });
    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          mintPK, // mint
          receiverAddress, // ata
          destinationAccount, // owner of token account
          wallet!.publicKey!, // fee payer
        ),
      );
    }
    const transferIx = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      sourceAccount!,
      receiverAddress,
      form.governedTokenAccount.governance!.pubkey,
      [],
      mintAmount,
    );
    serializedInstruction = serializeInstructionToBase64(transferIx);
  }

  const obj: FormInstructionData = {
    serializedInstruction,
    isValid,
    governance: currentAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  };
  return obj;
}

export async function getMintInstruction({
  schema,
  form,
  programId,
  connection,
  wallet,
  governedMintInfoAccount,
  setFormErrors,
}: {
  schema: any;
  form: any;
  programId: PublicKey | undefined;
  connection: ConnectionContext;
  wallet: WalletAdapter | undefined;
  governedMintInfoAccount: GovernedMintInfoAccount | undefined;
  setFormErrors: any;
}): Promise<FormInstructionData> {
  const isValid = await validateInstruction({ schema, form, setFormErrors });
  let serializedInstruction = '';
  const prerequisiteInstructions: TransactionInstruction[] = [];
  if (isValid && programId && form.mintAccount?.governance?.pubkey) {
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount);
    const mintPK = form.mintAccount.governance.account.governedAccount;
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      form.mintAccount.mintInfo?.decimals,
    );

    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
      connection,
      receiverAddress: destinationAccount,
      mintPK,
      wallet: wallet!,
    });
    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          mintPK, // mint
          receiverAddress, // ata
          destinationAccount, // owner of token account
          wallet!.publicKey!, // fee payer
        ),
      );
    }
    const transferIx = Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      form.mintAccount.governance.account.governedAccount,
      receiverAddress,
      form.mintAccount.governance!.pubkey,
      [],
      mintAmount,
    );
    serializedInstruction = serializeInstructionToBase64(transferIx);
  }
  const obj: FormInstructionData = {
    serializedInstruction,
    isValid,
    governance: governedMintInfoAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  };
  return obj;
}

export async function getConvertToMsolInstruction({
  schema,
  form,
  connection,
  setFormErrors,
}: {
  schema: any;
  form: any;
  connection: ConnectionContext;
  setFormErrors: any;
}): Promise<FormInstructionData> {
  const isValid = await validateInstruction({ schema, form, setFormErrors });
  const prerequisiteInstructions: TransactionInstruction[] = [];
  let serializedInstruction = '';

  if (
    isValid &&
    form.governedTokenAccount.transferAddress &&
    form.destinationAccount.governance.pubkey
  ) {
    const amount = getMintNaturalAmountFromDecimal(
      form.amount,
      form.governedTokenAccount.mint.account.decimals,
    );
    const originAccount = form.governedTokenAccount.transferAddress;
    const destinationAccount = form.destinationAccount.governance.pubkey;

    const config = new MarinadeConfig({
      connection: connection.current,
      publicKey: originAccount,
    });
    const marinade = new Marinade(config);

    const { transaction } = await marinade.deposit(new BN(amount), {
      mintToOwnerAddress: destinationAccount,
    });

    if (transaction.instructions.length === 1) {
      serializedInstruction = serializeInstructionToBase64(
        transaction.instructions[0],
      );
    } else {
      throw Error('No mSOL Account can be found for the choosen account.');
    }
  }

  const obj: FormInstructionData = {
    serializedInstruction,
    isValid,
    governance: form.governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  };

  return obj;
}
