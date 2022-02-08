// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export class MultisigRecord implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;


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



    static create(record: Partial<Omit<MultisigRecord, FunctionPropertyNames<MultisigRecord>>> & Entity): MultisigRecord {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new MultisigRecord(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
