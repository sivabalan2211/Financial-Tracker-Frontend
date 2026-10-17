import { BrowserRouter, Navigate, Route, Routes, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Statements from "./pages/Statements";
import Transfers from "./pages/Transfers";

import { useState } from "react";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        className="m-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-3 font-semibold text-white shadow-lg shadow-violet-500/30 duration-300
         hover: hover:shadow-xl
         hover: shadow-violet-500/40
         active: translate-y-0 active:scale-95
         focus: outline-none focus:ring-4
         focus: ring-violet-300"
        onClick={() => setIsOpen(true)}
      >
        Menu
      </button>
      <BrowserRouter>
        <Modal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
          }}
          title="Menu"
        >
          <div className="flex flex-col w-xl">
            <Link
              to="/"
              className="group relative inline-flex items-center justify-center rounded-xl px-8 py-3 font-medium text-blue-600 shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 ease-out hover:border-violet-400 hover:text-black hover:shadow-[0_0_10px_rgba(139,92,246,0.5),0_0_35px_rgba(139,92,246,0.3)]"
            >
              Dashboard
            </Link>
            <Link
              to="/accounts"
              className="group relative inline-flex items-center justify-center rounded-xl px-8 py-3 font-medium text-blue-600 shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 ease-out hover:border-violet-400 hover:text-black hover:shadow-[0_0_10px_rgba(139,92,246,0.5),0_0_35px_rgba(139,92,246,0.3)]"
            >
              Accounts
            </Link>
            <Link
              to="/transactions"
              className="group relative inline-flex items-center justify-center rounded-xl px-8 py-3 font-medium text-blue-600 shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 ease-out hover:border-violet-400 hover:text-black hover:shadow-[0_0_10px_rgba(139,92,246,0.5),0_0_35px_rgba(139,92,246,0.3)]"
            >
              Transactions
            </Link>
            <Link
              to="/categories"
              className="group relative inline-flex items-center justify-center rounded-xl px-8 py-3 font-medium text-blue-600 shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 ease-out hover:border-violet-400 hover:text-black hover:shadow-[0_0_10px_rgba(139,92,246,0.5),0_0_35px_rgba(139,92,246,0.3)]"
            >
              Categories
            </Link>
            <Link
              to="/statements"
              className="group relative inline-flex items-center justify-center rounded-xl px-8 py-3 font-medium text-blue-600 shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 ease-out hover:border-violet-400 hover:text-black hover:shadow-[0_0_10px_rgba(139,92,246,0.5),0_0_35px_rgba(139,92,246,0.3)]"
            >
              Statements
            </Link>
            <Link
              to="/transfers"
              className="group relative inline-flex items-center justify-center rounded-xl px-8 py-3 font-medium text-blue-600 shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 ease-out hover:border-violet-400 hover:text-black hover:shadow-[0_0_10px_rgba(139,92,246,0.5),0_0_35px_rgba(139,92,246,0.3)]"
            >
              Transfers
            </Link>
          </div>
        </Modal>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/accounts" element={<Accounts />} />

          <Route path="/transactions" element={<Transactions />} />

          <Route path="/categories" element={<Categories />} />

          <Route path="/statements" element={<Statements />} />

          <Route path="/transfers" element={<Transfers />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

function Modal({ children, isOpen, onClose, title }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/40">
      <div className="relative flex flex-col bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="md:text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <button
          type="button"
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center absolute top-3.5 right-3.5"
          onClick={onClose}
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

export default App;
