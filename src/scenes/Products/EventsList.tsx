import React from "react";
import { SAMPLE_EVENTS } from "../../models/Product";

function EventsList() {
  return (
    <div className="EventsList container card bg-violet-400 shadow my-5 p-5">
      <h1 className="font-mono font-bold  text-center text-7xl">
        Green Wallet
      </h1>
      <div>
        <p className=" font-bold text-2xl">
          An ecofriendly, chain-agnostic wallet that accounts for your
          blockchain transactions by offsetting your carbon footprint.
        </p>
      </div>
      <div className="container">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3"></div>
      </div>
    </div>
  );
}

export default EventsList;
