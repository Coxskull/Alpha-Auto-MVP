import test from "node:test";
import assert from "node:assert/strict";
import { confirmationFor, validQuote, type PayoutQuote } from "../lib/payoutQuote";
const quote: PayoutQuote = { settlementId: "synthetic-queue", status: "quote", currency: "USD", grossAmount: 50, refundAdjustment: 0,
  payableBeforeRecovery: 50, recoveryOffset: 30, paidAmount: 20, netAmount: 20, remainingRecoveryBalance: 0,
  zeroNet: false, quoteIsAdvisory: true, confirmationRequired: true, eligibleForConfirmation: true };
test("matching current quote has balanced gross, recovery and net", () => assert.equal(validQuote(quote,"settlement","synthetic-queue"),true));
test("wrong resource, missing metadata and nonfinite money fail closed", () => {
  assert.equal(validQuote(quote,"settlement","other"),false);
  assert.equal(validQuote({paidAmount:20},"settlement","synthetic-queue"),false);
  assert.equal(validQuote({...quote,grossAmount:Infinity},"settlement","synthetic-queue"),false);
});
test("unbalanced amounts or unsafe cents cannot be presented for confirmation", () => {
  assert.equal(validQuote({...quote,payableBeforeRecovery:51},"settlement","synthetic-queue"),false);
  assert.equal(validQuote({...quote,remainingRecoveryBalance:1e15},"settlement","synthetic-queue"),false);
});
test("gross, empty, exponent and extra-decimal confirmations cannot be sent", () => {
  for(const amount of ["50","","2e1","20.001"]) assert.equal(confirmationFor(quote,amount,"synthetic-ref",true),null);
});
test("acknowledgment, reference and eligible quote are required", () => {
  assert.equal(confirmationFor(quote,"20","ref",false),null);
  assert.equal(confirmationFor(quote,"20"," ",true),null);
  assert.equal(confirmationFor({...quote,eligibleForConfirmation:false},"20","ref",true),null);
});
test("confirmation uses quoted currency and exact net with trimmed reference", () => assert.deepEqual(confirmationFor(quote,"20.00"," synthetic-ref ",true),{paidAmount:20,currency:"USD",payoutReference:"synthetic-ref"}));
test("zero cash is an explicit valid confirmation with carry-forward", () => {
  const zero={...quote,payableBeforeRecovery:50,recoveryOffset:50,paidAmount:0,netAmount:0,zeroNet:true,remainingRecoveryBalance:10};
  assert.equal(validQuote(zero,"settlement","synthetic-queue"),true);
  assert.equal(confirmationFor(zero,"0","synthetic-offset",true)?.paidAmount,0);
});
test("entrepreneur signed adjustments must balance", () => {
  const earning={...quote,settlementId:undefined,earningId:"synthetic-earning",refundAdjustment:-5,chargebackAdjustment:-5,payableBeforeRecovery:40,recoveryOffset:20};
  assert.equal(validQuote(earning,"earning","synthetic-earning"),true);
  assert.equal(validQuote({...earning,chargebackAdjustment:undefined},"earning","synthetic-earning"),false);
});
