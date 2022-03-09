import { SubstrateEvent } from '@subql/types';
import { BlockHandler, ExtrinsicHandler } from '..';
import { ApproveRecord, Extrinsic, MultisigAccount, MultisigRecord } from '../../types';

export class MultisigHandler {
  static async ensureMultisigAccount(
    multisigAccountId: string,
    sender: string,
    extrinsicArgs: string
  ) {
    let entity = await MultisigAccount.get(multisigAccountId);
    if (entity === undefined) {
      entity = new MultisigAccount(multisigAccountId);
      const jsonExtrinsicArgs = JSON.parse(extrinsicArgs) as any[];
      let threshold = 0;
      let members = [];

      jsonExtrinsicArgs.forEach((arg) => {
        if (arg.name === 'threshold') {
          threshold = Number(arg.value);
        }
        if (arg.name === 'otherSignatories' || arg.name === 'other_signatories') {
          members = [sender, ...arg.value];
        }
      });

      entity.threshold = threshold;
      entity.members = members;

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

    const extrinsicRecord = await Extrinsic.get(event.extrinsic?.extrinsic?.hash?.toString());

    await this.ensureMultisigAccount(multisigAccountId, accountId, extrinsicRecord.args);

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
    const currentBlockId = event.block.block.header.hash.toString();
    await BlockHandler.ensureBlock(currentBlockId);

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
    multisigRecord.confirmBlockId = currentBlockId;
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
