// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export class MultisigRecord implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public createExtrinsicIdx: string;

    public module: string;

    public method: string;

    public multisigAccountId: string;

    public timestamp?: Date;

    public blockId: string;

    public confirmBlockId?: string;

    public status: string;

    public confirmExtrinsicIdx?: string;

    public cancelExtrinsicIdx?: string;

    public approvals?: string[];


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save MultisigRecord entity without an ID");
        await store.set('MultisigRecord', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove MultisigRecord entity without an ID");
        await store.remove('MultisigRecord', id.toString());
    }

    static async get(id:string): Promise<MultisigRecord | undefined>{
        assert((id !== null && id !== undefined), "Cannot get MultisigRecord entity without an ID");
        const record = await store.get('MultisigRecord', id.toString());
        if (record){
            return MultisigRecord.create(record);
        }else{
            return;
        }
    }


    static async getByMultisigAccountId(multisigAccountId: string): Promise<MultisigRecord[] | undefined>{
      
      const records = await store.getByField('MultisigRecord', 'multisigAccountId', multisigAccountId);
      return records.map(record => MultisigRecord.create(record));
      
    }

    static async getByBlockId(blockId: string): Promise<MultisigRecord[] | undefined>{
      
      const records = await store.getByField('MultisigRecord', 'blockId', blockId);
      return records.map(record => MultisigRecord.create(record));
      
    }

    static async getByConfirmBlockId(confirmBlockId: string): Promise<MultisigRecord[] | undefined>{
      
      const records = await store.getByField('MultisigRecord', 'confirmBlockId', confirmBlockId);
      return records.map(record => MultisigRecord.create(record));
      
    }


    static create(record: Partial<Omit<MultisigRecord, FunctionPropertyNames<MultisigRecord>>> & Entity): MultisigRecord {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new MultisigRecord(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
