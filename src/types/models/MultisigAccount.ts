// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class MultisigAccount implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save MultisigAccount entity without an ID");
        await store.set('MultisigAccount', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove MultisigAccount entity without an ID");
        await store.remove('MultisigAccount', id.toString());
    }

    static async get(id:string): Promise<MultisigAccount | undefined>{
        assert((id !== null && id !== undefined), "Cannot get MultisigAccount entity without an ID");
        const record = await store.get('MultisigAccount', id.toString());
        if (record){
            return MultisigAccount.create(record);
        }else{
            return;
        }
    }



    static create(record){
        let entity = new MultisigAccount(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
