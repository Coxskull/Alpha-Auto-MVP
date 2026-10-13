import test from "node:test";
import assert from "node:assert/strict";
import {validReconciliation,validCapture} from "../lib/reconciliation";
const id="00000000-0000-4000-8000-000000000001";
const snapshot={kind:"settlement",id,orderId:id,payeeType:"supplier",payeeId:id,currency:"USD",status:"paid",inspectionAvailable:true,grossAmount:50,adjustment:0,recoveryOffset:30,expectedNet:20,recordedNet:20,reference:"synthetic-ref",issues:[],fingerprint:"a".repeat(64)};
test("current internal snapshot is validated for exact source",()=>{assert.equal(validReconciliation(snapshot,"settlement",id),true);assert.equal(validReconciliation(snapshot,"earning",id),false);assert.equal(validReconciliation(snapshot,"settlement","other"),false);});
test("missing payout remains inspectable as evidence, not a confirmation",()=>assert.equal(validReconciliation({...snapshot,recordedNet:null,reference:null,issues:["missing_or_duplicate_payout"]},"settlement"),true));
test("unsafe money, invalid identifiers and malformed exceptions fail closed",()=>{for(const patch of [{grossAmount:Infinity},{recordedNet:NaN},{expectedNet:1e13},{id:"wrong"},{payeeId:4},{issues:[3]},{fingerprint:"short"}])assert.equal(validReconciliation({...snapshot,...patch},"settlement"),false);});
test("capture history validates actor, time and exact resource",()=>{const capture={id,actor:id,capturedAt:"2026-10-13T00:00:00Z",snapshot};assert.equal(validCapture(capture,"settlement",id),true);assert.equal(validCapture({...capture,actor:"wrong"},"settlement",id),false);assert.equal(validCapture({...capture,capturedAt:"wrong"},"settlement",id),false);assert.equal(validCapture(capture,"earning",id),false);});

test("scope-limited rows carry no invented amounts and cannot be captures",()=>{
  const limited={...snapshot,inspectionAvailable:false,grossAmount:null,adjustment:null,recoveryOffset:null,expectedNet:null,recordedNet:null,reference:null,issues:["manual_review_scope_exceeded"]};
  assert.equal(validReconciliation(limited,"settlement"),true);
  assert.equal(validReconciliation({...limited,expectedNet:0},"settlement"),false);
  assert.equal(validReconciliation({...snapshot,inspectionAvailable:undefined},"settlement"),false);
  assert.equal(validCapture({id,actor:id,capturedAt:"2026-10-13T00:00:00Z",snapshot:limited},"settlement",id),false);
});
