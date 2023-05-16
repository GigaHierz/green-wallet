import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventsList from "./scenes/Products/EventsList";
import Header from "./components/Header/Header";
import WalletCreate from "./scenes/Wallet/WalletCreate";
import WalletManage from "./scenes/Wallet/WalletManage";
import AccountManage from "./scenes/Wallet/AccountManage";
export default function WebApp() {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/wallet/create" element={<WalletCreate />} />
          <Route path="/wallet/login" element={<AccountManage />} />
          <Route path="/wallet/manage" element={<WalletManage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
