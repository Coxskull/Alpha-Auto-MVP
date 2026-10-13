import api from "./api";
import {validInventory,type RecordKind} from "@/lib/payoutRecordInventory";
export async function inventory(kind:RecordKind,after?:string){const {data}=await api.get("/api/payout-reconciliation/records",{params:{kind,after,limit:20}});if(!validInventory(data)||data.kind!==kind)throw new Error("Payout record inventory could not be validated.");return data;}
