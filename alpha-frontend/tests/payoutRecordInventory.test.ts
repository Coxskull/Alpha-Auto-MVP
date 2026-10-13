import test from "node:test";import assert from "node:assert/strict";import {validInventory} from "../lib/payoutRecordInventory";
const id="00000000-0000-0000-0000-000000000001";const row={id,orderId:null,payeeId:null,amount:"20.00",amountValid:true,currency:"USD",status:"PAID",reference:null,sourceCount:0,expectedSourceCount:1,paidCurrencySourceCount:0,issues:["missing_payout_source"]};
test("source-less batch preserves absent attribution",()=>assert.equal(validInventory({kind:"batch",rows:[row],next:null}),true));
test("invalid cursors, amounts and counts fail closed",()=>{for(const patch of [{amount:"Infinity"},{amount:20},{sourceCount:1.1},{paidCurrencySourceCount:-1},{id:"invalid"},{issues:[]}])assert.equal(validInventory({kind:"supplier",rows:[{...row,...patch}],next:null}),false);assert.equal(validInventory({kind:"supplier",rows:[row],next:"invalid"}),false);});
test("all three kinds are explicit and bounded",()=>{for(const kind of ["supplier","driver","batch"])assert.equal(validInventory({kind,rows:[],next:null}),true);assert.equal(validInventory({kind:"unknown",rows:[],next:null}),false);assert.equal(validInventory({kind:"supplier",rows:Array(21).fill(row),next:null}),false);});

test("large exact decimal strings do not lose cents or net currencies",()=>assert.equal(validInventory({kind:"supplier",rows:[{...row,amount:"9999999999999999.99",currency:"EUR"}],next:null}),true));

test("invalid numeric marker cannot invent a zero amount or imply valid money",()=>{
 const p={kind:"supplier",rows:[{...row,amount:null,amountValid:false,issues:["invalid_payout_amount"]}],next:null};assert.equal(validInventory(p),true);
 assert.equal(validInventory({...p,rows:[{...p.rows[0],amount:"0"}]}),false);assert.equal(validInventory({...p,rows:[{...p.rows[0],issues:["missing_payout_source"]}]}),false);
 assert.equal(validInventory({kind:"supplier",rows:[{...row,amount:"NaN"}],next:null}),false);
});
