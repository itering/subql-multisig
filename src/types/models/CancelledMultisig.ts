// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export class CancelledMultisig implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public extrinsicIdx: string;

    public module: string;

    public method: string;

    public multisigAccountId: string;

    public timestamp?: Date;

    public blockId: string;

    public approvals?: string[];


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save CancelledMultisig entity without an ID");
        await store.set('CancelledMultisig', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove CancelledMultisig entity without an ID");
        await store.remove('CancelledMultisig', id.toString());
    }

    static async get(id:string): Promise<CancelledMultisig | undefined>{
        assert((id !== null && id !== undefined), "Cannot get CancelledMultisig entity without an ID");
        const record = await store.get('CancelledMultisig', id.toString());
        if (record){
            return CancelledMultisig.create(record);
        }else{
            return;
        }
    }


    static async getByMultisigAccountId(multisigAccountId: string): Promise<CancelledMultisig[] | undefined>{
      
      const records = await store.getByField('CancelledMultisig', 'multisigAccountId', multisigAccountId);
      return records.map(record => CancelledMultisig.create(record));
      
    }

    static async getByBlockId(blockId: string): Promise<CancelledMultisig[] | undefined>{
      
      const records = await store.getByField('CancelledMultisig', 'blockId', blockId);
      return records.map(record => CancelledMultisig.create(record));
      
    }


    static create(record: Partial<Omit<CancelledMultisig, FunctionPropertyNames<CancelledMultisig>>> & Entity): CancelledMultisig {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new CancelledMultisig(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
