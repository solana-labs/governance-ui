// Enhance the capabilities of borsh so it is able to serialize/deserialize governance related structures
import { PublicKey } from '@solana/web3.js';
import * as borsh from 'borsh';
import { Vote, VoteChoice, VoteKind, VoteType, VoteTypeKind } from './types';

declare class EnhancedBinaryReader extends borsh.BinaryReader {
  readVoteType(): VoteType;
  readVote(): Vote;
  readU16(): number;
  readPubkey(): PublicKey;
}

declare class EnhancedBinaryWriter extends borsh.BinaryWriter {
  writeVoteType(value: VoteType): void;
  writeVote(value: Vote): void;
  writeU16(value: number): void;
  writePubkey(value: PublicKey): void;
}

// ------------ Pubkey ------------
(borsh.BinaryReader
  .prototype as EnhancedBinaryReader).readPubkey = function () {
  const array = this.readFixedArray(32);

  return new PublicKey(array);
};

(borsh.BinaryWriter.prototype as EnhancedBinaryWriter).writePubkey = function (
  value: PublicKey,
) {
  this.writeFixedArray(value.toBuffer());
};

// ------------ VoteType ------------
(borsh.BinaryReader
  .prototype as EnhancedBinaryReader).readVoteType = function () {
  const value = this.buf.readUInt8(this.offset);

  this.offset += 1;

  if (value === VoteTypeKind.SingleChoice) {
    return VoteType.SINGLE_CHOICE;
  }

  const choiceCount = this.buf.readUInt16LE(this.offset);

  return VoteType.MULTI_CHOICE(choiceCount);
};

(borsh.BinaryWriter
  .prototype as EnhancedBinaryWriter).writeVoteType = function (
  value: VoteType,
) {
  this.maybeResize();

  this.buf.writeUInt8(value.type, this.length);

  this.length += 1;

  if (value.type === VoteTypeKind.MultiChoice) {
    this.buf.writeUInt16LE(value.choiceCount, this.length);

    this.length += 2;
  }
};

// ------------ u16 ------------
(borsh.BinaryReader.prototype as EnhancedBinaryReader).readU16 = function () {
  const value = this.buf.readUInt16LE(this.offset);

  this.offset += 2;

  return value;
};

(borsh.BinaryWriter.prototype as EnhancedBinaryWriter).writeU16 = function (
  value,
) {
  this.maybeResize();

  this.buf.writeUInt16LE(value, this.length);

  this.length += 2;
};

// ------------ Vote ------------
(borsh.BinaryReader.prototype as EnhancedBinaryReader).readVote = function () {
  const value = this.buf.readUInt8(this.offset);

  this.offset += 1;

  if (value === VoteKind.Deny) {
    return new Vote({ voteType: value, approveChoices: undefined, deny: true });
  }

  const approveChoices: VoteChoice[] = [];

  this.readArray(() => {
    const rank = this.buf.readUInt8(this.offset);

    this.offset += 1;

    const weightPercentage = this.buf.readUInt8(this.offset);

    this.offset += 1;

    approveChoices.push(
      new VoteChoice({ rank: rank, weightPercentage: weightPercentage }),
    );
  });

  return new Vote({
    voteType: value,
    approveChoices,
    deny: undefined,
  });
};

(borsh.BinaryWriter.prototype as EnhancedBinaryWriter).writeVote = function (
  value,
) {
  this.maybeResize();

  this.buf.writeUInt8(value.voteType, this.length);

  this.length += 1;

  if (value.voteType === VoteKind.Approve) {
    this.writeArray(value.approveChoices, (item) => {
      this.buf.writeUInt8(item.rank, this.length);

      this.length += 1;

      this.buf.writeUInt8(item.weightPercentage, this.length);

      this.length += 1;
    });
  }
};

export default borsh;
