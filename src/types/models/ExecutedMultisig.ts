// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class ExecutedMultisig implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public module: string;

    public method: string;

    public multisigAccountId: string;

    public timestamp?: Date;

    public blockId: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save ExecutedMultisig entity without an ID");
        await store.set('ExecutedMultisig', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove ExecutedMultisig entity without an ID");
        await store.remove('ExecutedMultisig', id.toString());
    }

    static async get(id:string): Promise<ExecutedMultisig | undefined>{
        assert((id !== null && id !== undefined), "Cannot get ExecutedMultisig entity without an ID");
        const record = await store.get('ExecutedMultisig', id.toString());
        if (record){
            return ExecutedMultisig.create(record);
        }else{
            return;
        }
    }


    static async getByMultisigAccountId(multisigAccountId: string): Promise<ExecutedMultisig[] | undefined>{
      
      const records = await store.getByField('ExecutedMultisig', 'multisigAccountId', multisigAccountId);
      return records.map(record => ExecutedMultisig.create(record));
      
    }

    static async getByBlockId(blockId: string): Promise<ExecutedMultisig[] | undefined>{
      
      const records = await store.getByField('ExecutedMultisig', 'blockId', blockId);
      return records.map(record => ExecutedMultisig.create(record));
      
    }


    static create(record){
        let entity = new ExecutedMultisig(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
