import { SubstrateEvent } from '@subql/types';
import { Dispatcher } from '../helpers/dispatcher';
import { BlockHandler } from './block';
import { ExtrinsicHandler } from './extrinsic';
import { MultisigHandler } from './sub-handlers/multisig';

type EventDispatch = Dispatcher<SubstrateEvent>;

export class EventHandler {
  private event: SubstrateEvent;

  constructor(event: SubstrateEvent) {
    this.event = event;
  }

  get index() {
    return this.event.idx;
  }

  get blockNumber() {
    return this.event.block.block.header.number.toBigInt();
  }

  get blockHash() {
    return this.event.block.block.hash.toString();
  }

  get events() {
    return this.event.block.events;
  }

  get section() {
    return this.event.event.section;
  }

  get method() {
    return this.event.event.method;
  }

  get data() {
    return this.event.event.data.toString();
  }

  get extrinsicHash() {
    const i = this.event?.extrinsic?.extrinsic?.hash?.toString();

    return i === 'null' ? undefined : i;
  }

  get id() {
    return `${this.blockNumber}-${this.index}`;
  }

  get timestamp() {
    return this.event.block.timestamp;
  }

  public async save() {
    // await BlockHandler.ensureBlock(this.blockHash);

    // if (this.extrinsicHash) {
    //   await ExtrinsicHandler.ensureExtrinsic(this.extrinsicHash);
    // }

    const handler = new ExtrinsicHandler(this.event.extrinsic);
    await handler.save();

    if (this.section === 'multisig' && this.method === 'NewMultisig') {
      await MultisigHandler.checkNew(this.event);
    }
    if (this.section === 'multisig' && this.method === 'MultisigApproval') {
      await MultisigHandler.checkApprove(this.event);
    }
    if (this.section === 'multisig' && this.method === 'MultisigExecuted') {
      await MultisigHandler.checkExecuted(this.event);
    }
    if (this.section === 'multisig' && this.method === 'MultisigCancelled') {
      await MultisigHandler.checkCancelled(this.event);
    }
  }
}
