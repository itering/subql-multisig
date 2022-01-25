import { SubstrateEvent } from '@subql/types';
import { BlockHandler } from '..';
import { ApproveRecord, ExecutedMultisig, MultisigAccount, MultisigRecord } from '../../types';

export class MultisigHandler {
  static async ensureMultisigAccount(accountId: string) {
    let entity = await MultisigAccount.get(accountId);
    if (entity === undefined) {
      entity = new MultisigAccount(accountId);
      await entity.save();
    }
  }

  static async ensureMultisigRecord(extrinsicIdx: string) {
    let entity = await MultisigRecord.get(extrinsicIdx);
    if (entity === undefined) {
      entity = new MultisigRecord(extrinsicIdx);
      await entity.save();
    }
  }

  static async saveApproveRecord(accountId: string, maybeTimepoint: string) {
    const entity = new ApproveRecord(`${accountId}-${maybeTimepoint}`);
    entity.account = accountId;
    entity.multisigRecordId = maybeTimepoint;
    await entity.save();
  }

  static async checkNew(event: SubstrateEvent) {
    await BlockHandler.ensureBlock(event.block.block.header.hash.toString());

    const blockHeight = event.block.block.header.number;
    const extrinsicIdx = `${blockHeight}-${event.extrinsic.idx}`;
    await this.ensureMultisigRecord(extrinsicIdx);

    const {
      event: { data },
    } = event;

    // Save approve record.
    const accountId = data[0].toString();
    await this.saveApproveRecord(accountId, extrinsicIdx);
  }

  static async checkApprove(event: SubstrateEvent) {
    await BlockHandler.ensureBlock(event.block.block.header.hash.toString());

    const {
      event: { data },
    } = event;

    // Save approve record.
    const timepoint = data[1].toJSON() as any;
    const extrinsicIdx = `${timepoint.height}-${timepoint.index}`;
    await this.ensureMultisigRecord(extrinsicIdx);
    const accountId = data[0].toString();
    await this.saveApproveRecord(accountId, extrinsicIdx);
  }

  static async checkExecuted(event: SubstrateEvent) {
    await BlockHandler.ensureBlock(event.block.block.header.hash.toString());

    const {
      event: { data },
    } = event;

    // Save approve record.
    const timepoint = data[1].toJSON() as any;
    const timepointExtrinsicIdx = `${timepoint.height}-${timepoint.index}`;
    await this.ensureMultisigRecord(timepointExtrinsicIdx);
    const accountId = data[0].toString();
    await this.saveApproveRecord(accountId, timepointExtrinsicIdx);

    const blockHeight = event.block.block.header.number;
    const entity = new ExecutedMultisig(`${blockHeight}-${event.idx}`);

    entity.module = event.event.section;
    entity.method = event.event.method;
    entity.blockId = event.block.block.header.hash.toString();
    entity.timestamp = event.block.timestamp;
    entity.extrinsicIdx = `${blockHeight}-${event.extrinsic?.idx}`;

    const multisigAccountId = data[2].toString();
    await this.ensureMultisigAccount(multisigAccountId);
    entity.multisigAccountId = multisigAccountId;

    // Get approvals for this multisig action.
    const approveRecords = await ApproveRecord.getByMultisigRecordId(timepointExtrinsicIdx);
    const approvals = approveRecords.map((approveRecord) => approveRecord.account);
    entity.approvals = approvals;

    await entity.save();
  }
}
