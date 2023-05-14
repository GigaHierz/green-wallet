import React from "react";
import { Link } from "react-router-dom";

import { SAMPLE_EVENTS } from "../../models/Product";
function EventsList() {
  return (
    <div className="EventsList container card bg-violet-400 shadow my-5 p-5">
      <h1 className="font-mono font-bold  text-center text-7xl">
        Green Wallet🌿
      </h1>

      <div>
        <p className="font-bold text-2xl m-10 px-56">
          An ecofriendly, chain-agnostic wallet that accounts for your
          blockchain transactions by offsetting your carbon footprint. 👣
        </p>
        <div className="px-20">
          <hr className="mb-10" />
          <h1 className="font-bold text-3xl mb-10">How it works?</h1>
          <ul className="text-lg font-semibold">
            <li>
              • Sign up for a Gnosis safe wallet Optionally authenticate with
              Lens
            </li>
            <li>• Choose a payment model</li>
            <li>
              • Have your carbon footprint be offset automatically every 500 txs
            </li>
            <li>
              • Gas less trasnactions! You won't have to struggel and more with
              getting the right tokens to pay for gas!!
            </li>
            <li>• Receive a membership NFT that can be displayed in your</li>
            <li>• Get analytics about your carbon footprint generation</li>
          </ul>
        </div>
        <div className="mt-10">
          <p className="rounded-full btn btn-primary bg-indigo-600 border-black m-2 my-2">
            <Link to="/wallet/create">Create a Wallet</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EventsList;
