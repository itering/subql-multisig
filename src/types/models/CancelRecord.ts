// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export class CancelRecord implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public multisigRecordId: string;

    public account: string;

    public cancelTimepoint: string;

    public cancelTimestamp: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save CancelRecord entity without an ID");
        await store.set('CancelRecord', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove CancelRecord entity without an ID");
        await store.remove('CancelRecord', id.toString());
    }

    static async get(id:string): Promise<CancelRecord | undefined>{
        assert((id !== null && id !== undefined), "Cannot get CancelRecord entity without an ID");
        const record = await store.get('CancelRecord', id.toString());
        if (record){
            return CancelRecord.create(record);
        }else{
            return;
        }
    }


    static async getByMultisigRecordId(multisigRecordId: string): Promise<CancelRecord[] | undefined>{
      
      const records = await store.getByField('CancelRecord', 'multisigRecordId', multisigRecordId);
      return records.map(record => CancelRecord.create(record));
      
    }


    static create(record: Partial<Omit<CancelRecord, FunctionPropertyNames<CancelRecord>>> & Entity): CancelRecord {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new CancelRecord(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
