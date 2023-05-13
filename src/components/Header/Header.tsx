import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    
  return (
    <header className="mt-3 py-1">
      <div className="container">
        <p className="float-start mb-1">
          <Link to="/">
            Safe Space
          </Link>
        </p>
        <p className="float-end mb-1">
          <Link to="/wallet/create">
            Wallet
          </Link>
        </p>
      </div>
    </header>
  );
}

export default Header;
