import { SubstrateEvent } from '@subql/types';
import { BlockHandler } from '..';
import { ExecutedMultisig, MultisigAccount } from '../../types';

export class MultisigHandler {
  static async ensureMultisigAccount(accountId: string) {
    let entity = await MultisigAccount.get(accountId);
    if (entity === undefined) {
      entity = new MultisigAccount(accountId);
      await entity.save();
    }
  }

  static async check(event: SubstrateEvent) {
    await BlockHandler.ensureBlock(event.block.block.header.hash.toString());

    const blockHeight = event.block.block.header.number;
    const entity = new ExecutedMultisig(`${blockHeight}-${event.idx}`);
    const {
      event: { data },
    } = event;
    entity.module = event.event.section;
    entity.method = event.event.method;
    entity.blockId = event.block.block.header.hash.toString();
    entity.timestamp = event.block.timestamp;
    entity.extrinsicIdx = `${blockHeight}-${event.extrinsic?.idx}`;

    const multisigAccountId = data[2].toString();
    await this.ensureMultisigAccount(multisigAccountId);
    entity.multisigAccountId = multisigAccountId;

    await entity.save();
  }
}
