import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="mt-3 py-1">
      <div className="container">
        <div className="flex justify-between items-center">
          <p className="mb-1">
            <Link to="/">Safe Space</Link>
          </p>
          <div className="flex items-center">
            <p className="mr-3 mb-1">
              <Link to="/wallet/create">Wallet</Link>
            </p>
            <p className="mb-1">
              <Link
                to="/create-wallet"
                className="px-4 py-2 rounded bg-green-400 ml-4"
              >
                Connect Wallet
              </Link>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
