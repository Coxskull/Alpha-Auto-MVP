export type RecordKind="supplier"|"driver"|"batch";
export type InventoryRecord={id:string;orderId:string|null;payeeId:string|null;amount:string;currency:string;status:string;reference:string|null;sourceCount:number;expectedSourceCount:number;paidCurrencySourceCount:number;issues:string[]};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function validInventory(value:unknown):value is {kind:RecordKind;rows:InventoryRecord[];next:string|null}{
  if(!value||typeof value!=="object")return false;const p=value as {kind:RecordKind;rows:InventoryRecord[];next:string|null};
  return ["supplier","driver","batch"].includes(p.kind)&&Array.isArray(p.rows)&&p.rows.length<=20&&(p.next===null||typeof p.next==="string"&&uuid.test(p.next))&&p.rows.every(r=>r&&typeof r.id==="string"&&uuid.test(r.id)
    &&[r.orderId,r.payeeId].every(x=>x===null||typeof x==="string"&&uuid.test(x))&&typeof r.amount==="string"&&/^-?\d{1,28}(\.\d{1,28})?$/.test(r.amount)&&typeof r.currency==="string"&&typeof r.status==="string"
    &&(r.reference===null||typeof r.reference==="string")&&typeof r.expectedSourceCount==="number"&&Number.isSafeInteger(r.expectedSourceCount)&&[r.sourceCount,r.paidCurrencySourceCount].every(x=>typeof x==="number"&&Number.isSafeInteger(x)&&x>=0)
    &&Array.isArray(r.issues)&&r.issues.length>0&&r.issues.length<=20&&r.issues.every(x=>typeof x==="string"));
}
