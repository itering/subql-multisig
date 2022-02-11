import { SubstrateEvent } from '@subql/types';
import { BlockHandler } from '..';
import { ApproveRecord, MultisigAccount, MultisigRecord } from '../../types';

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
    const accountId = data[0].toString();
    const timepoint = data[1].toJSON() as any;
    const multisigAccountId = data[2].toString();
    const extrinsicIdx = `${timepoint.height}-${timepoint.index}`;

    let multisigRecord = await MultisigRecord.get(`${multisigAccountId}-${extrinsicIdx}`);
    if (!multisigRecord) {
      return;
    }

    await this.saveApproveRecord(accountId, multisigAccountId, extrinsicIdx);

    const approveRecords = await ApproveRecord.getByMultisigRecordId(
      `${multisigAccountId}-${extrinsicIdx}`
    );
    multisigRecord.approvals = approveRecords.map((approveRecord) => approveRecord.account);
    await multisigRecord.save();
  }

  static async checkExecuted(event: SubstrateEvent) {
    await BlockHandler.ensureBlock(event.block.block.header.hash.toString());

    const {
      event: { data },
    } = event;

    const accountId = data[0].toString();
    const timepoint = data[1].toJSON() as any;
    const multisigAccountId = data[2].toString();
    const timepointExtrinsicIdx = `${timepoint.height}-${timepoint.index}`;
    const multisigRecordId = `${multisigAccountId}-${timepointExtrinsicIdx}`;

    let multisigRecord = await MultisigRecord.get(`${multisigAccountId}-${timepointExtrinsicIdx}`);
    if (!multisigRecord) {
      return;
    }

    // Save approve record.
    await this.saveApproveRecord(accountId, multisigAccountId, timepointExtrinsicIdx);

    // Update multisig record.
    const blockHeight = event.block.block.header.number;
    multisigRecord.status = 'confirmed';
    multisigRecord.confirmExtrinsicIdx = `${blockHeight}-${event.extrinsic?.idx}`;
    const approveRecords = await ApproveRecord.getByMultisigRecordId(multisigRecordId);
    multisigRecord.approvals = approveRecords.map((approveRecord) => approveRecord.account);
    await multisigRecord.save();
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

    let multisigRecord = await MultisigRecord.get(`${multisigAccountId}-${timepointExtrinsicIdx}`);
    if (!multisigRecord) {
      return;
    }

    // Update multisig record.
    const blockHeight = event.block.block.header.number;
    multisigRecord.status = 'cancelled';
    multisigRecord.cancelExtrinsicIdx = `${blockHeight}-${event.extrinsic?.idx}`;
    await multisigRecord.save();
  }
}
