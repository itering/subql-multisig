import { SubstrateEvent } from '@subql/types';
import { BlockHandler } from '..';
import {
  ApproveRecord,
  CancelledMultisig,
  ExecutedMultisig,
  MultisigAccount,
  MultisigRecord,
} from '../../types';

export class MultisigHandler {
  static async ensureMultisigAccount(accountId: string) {
    let entity = await MultisigAccount.get(accountId);
    if (entity === undefined) {
      entity = new MultisigAccount(accountId);
      await entity.save();
    }
  }

  static async saveApproveRecord(
    accountId: string,
    multisigAccountId: string,
    maybeTimepoint: string
  ) {
    const entity = new ApproveRecord(`${accountId}-${maybeTimepoint}`);
    entity.account = accountId;
    entity.multisigRecordId = `${multisigAccountId}-${maybeTimepoint}`;
    await entity.save();
  }

  static async checkNew(event: SubstrateEvent) {
    await BlockHandler.ensureBlock(event.block.block.header.hash.toString());
    const {
      event: { data },
    } = event;

    const blockHeight = event.block.block.header.number;
    const extrinsicIdx = `${blockHeight}-${event.extrinsic.idx}`;
    const accountId = data[0].toString();
    const multisigAccountId = data[1].toString();

    await this.ensureMultisigAccount(multisigAccountId);

    // Save new multisig record.
    const entity = new MultisigRecord(`${multisigAccountId}-${extrinsicIdx}`);
    entity.createExtrinsicIdx = extrinsicIdx;
    entity.module = event.event.section;
    entity.method = event.event.method;
    entity.multisigAccountId = multisigAccountId;
    entity.timestamp = event.block.timestamp;
    entity.blockId = event.block.block.header.hash.toString();
    entity.status = 'default';
    entity.approvals = [accountId];
    await entity.save();

    // Save approve record.
    await this.saveApproveRecord(accountId, multisigAccountId, extrinsicIdx);
  }

  static async checkApprove(event: SubstrateEvent) {
    await BlockHandler.ensureBlock(event.block.block.header.hash.toString());

    const {
      event: { data },
    } = event;

    // Save approve record.
    const timepoint = data[1].toJSON() as any;
    const extrinsicIdx = `${timepoint.height}-${timepoint.index}`;

    let multisigRecord = await MultisigRecord.get(extrinsicIdx);
    if (!multisigRecord) {
      return;
    }

    const accountId = data[0].toString();
    const multisigAccountId = data[1].toString();
    await this.saveApproveRecord(accountId, multisigAccountId, extrinsicIdx);

    const approveRecords = await ApproveRecord.getByMultisigRecordId(extrinsicIdx);
    multisigRecord.approvals = approveRecords.map((approveRecord) => approveRecord.account);
    await multisigRecord.save();
  }

  static async checkExecuted(event: SubstrateEvent) {
    await BlockHandler.ensureBlock(event.block.block.header.hash.toString());

    const {
      event: { data },
    } = event;

    const timepoint = data[1].toJSON() as any;
    const timepointExtrinsicIdx = `${timepoint.height}-${timepoint.index}`;

    let multisigRecord = await MultisigRecord.get(timepointExtrinsicIdx);
    if (!multisigRecord) {
      return;
    }

    // Save approve record.
    const accountId = data[0].toString();
    const multisigAccountId = data[2].toString();
    await this.saveApproveRecord(accountId, multisigAccountId, timepointExtrinsicIdx);

    // Update multisig record.
    const blockHeight = event.block.block.header.number;
    multisigRecord.status = 'confirmed';
    multisigRecord.confirmExtrinsicIdx = `${blockHeight}-${event.extrinsic?.idx}`;
    const approveRecords = await ApproveRecord.getByMultisigRecordId(timepointExtrinsicIdx);
    multisigRecord.approvals = approveRecords.map((approveRecord) => approveRecord.account);
    await multisigRecord.save();

    // // Save confirmed multisig record.
    // const entity = new ExecutedMultisig(`${blockHeight}-${event.idx}`);

    // entity.module = event.event.section;
    // entity.method = event.event.method;
    // entity.blockId = event.block.block.header.hash.toString();
    // entity.timestamp = event.block.timestamp;
    // entity.extrinsicIdx = `${blockHeight}-${event.extrinsic?.idx}`;

    // await this.ensureMultisigAccount(multisigAccountId);
    // entity.multisigAccountId = multisigAccountId;

    // // Get approvals for this multisig action.
    // const approveRecords = await ApproveRecord.getByMultisigRecordId(timepointExtrinsicIdx);
    // const approvals = approveRecords.map((approveRecord) => approveRecord.account);
    // entity.approvals = approvals;

    // await entity.save();
  }

  static async checkCancelled(event: SubstrateEvent) {
    await BlockHandler.ensureBlock(event.block.block.header.hash.toString());

    const {
      event: { data },
    } = event;

    // Get multisig timepoint.
    const timepoint = data[1].toJSON() as any;
    const multisigAccountId = data[2].toString();

    const timepointExtrinsicIdx = `${timepoint.height}-${timepoint.index}`;

    let multisigRecord = await MultisigRecord.get(timepointExtrinsicIdx);
    if (!multisigRecord) {
      return;
    }

    // Update multisig record.
    const blockHeight = event.block.block.header.number;
    multisigRecord.status = 'cancelled';
    multisigRecord.cancelExtrinsicIdx = `${blockHeight}-${event.extrinsic?.idx}`;
    await multisigRecord.save();

    // Save cancelled multisig record.
    // const entity = new CancelledMultisig(`${blockHeight}-${event.idx}`);

    // entity.module = event.event.section;
    // entity.method = event.event.method;
    // entity.blockId = event.block.block.header.hash.toString();
    // entity.timestamp = event.block.timestamp;
    // entity.extrinsicIdx = `${blockHeight}-${event.extrinsic?.idx}`;

    // await this.ensureMultisigAccount(multisigAccountId);
    // entity.multisigAccountId = multisigAccountId;

    // // Get approvals for this multisig action.
    // const approveRecords = await ApproveRecord.getByMultisigRecordId(timepointExtrinsicIdx);
    // const approvals = approveRecords.map((approveRecord) => approveRecord.account);
    // entity.approvals = approvals;

    // await entity.save();
  }
}
