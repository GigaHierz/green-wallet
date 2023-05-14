import React, { useState } from "react";
import { TransactionUtils } from "../../utils/TransactionUtils";
import { DEFAULT_DESTINATION_ADDRESS } from "../../utils/Chain";
import { SafeAuthKit, Web3AuthAdapter } from "@safe-global/auth-kit";

function CreateTransaction({
  authKit,
}: {
  authKit?: SafeAuthKit<Web3AuthAdapter>;
}) {
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  function handleAddressChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAddress(event.target.value);
  }

  function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAmount(Number(event.target.value));
  }

  function createTransaction(sponsored: boolean = false) {
    const result = TransactionUtils.createTransaction(
      localStorage.getItem("safeAddress")!,
      address,
      amount,
      sponsored,
      authKit
    );
    console.log(result);
  }

  return (
    <div>
      <label className="font-bold">Destination Address</label>
      <br />
      <label className="text-muted">
        Example (vitalik.eth): {DEFAULT_DESTINATION_ADDRESS}
      </label>
      <input
        className="form-control mb-3"
        value={address}
        onChange={handleAddressChange}
      />
      <label className="font-bold">Destination Amount</label>
      <input
        type="number"
        className="form-control mb-3"
        value={amount}
        onChange={handleAmountChange}
      />
      <button
        className="rounded-full btn btn-primary bg-green-600 border-black my-2"
        onClick={() => createTransaction()}
      >
        Create Transaction
      </button>{" "}
      <button
        className="rounded-full btn btn-primary bg-indigo-600 border-black my-2"
        onClick={() => createTransaction(true)}
      >
        Create Sponsored Transaction
      </button>
    </div>
  );
}

export default CreateTransaction;
