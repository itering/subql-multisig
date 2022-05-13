// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export class ApproveRecord implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public multisigRecordId: string;

    public account: string;

    public approveTimepoint: string;

    public approveTimestamp: string;

    public approveType: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save ApproveRecord entity without an ID");
        await store.set('ApproveRecord', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove ApproveRecord entity without an ID");
        await store.remove('ApproveRecord', id.toString());
    }

    static async get(id:string): Promise<ApproveRecord | undefined>{
        assert((id !== null && id !== undefined), "Cannot get ApproveRecord entity without an ID");
        const record = await store.get('ApproveRecord', id.toString());
        if (record){
            return ApproveRecord.create(record);
        }else{
            return;
        }
    }


    static async getByMultisigRecordId(multisigRecordId: string): Promise<ApproveRecord[] | undefined>{
      
      const records = await store.getByField('ApproveRecord', 'multisigRecordId', multisigRecordId);
      return records.map(record => ApproveRecord.create(record));
      
    }


    static create(record: Partial<Omit<ApproveRecord, FunctionPropertyNames<ApproveRecord>>> & Entity): ApproveRecord {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new ApproveRecord(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
