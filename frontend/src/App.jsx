import { useEffect, useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard";
import TransactionModal from "./components/transactions/TransactionModal";
import Statement from "./pages/Statement";

import { initialTransactions } from "./data/initialTransactions";

import "./App.css";


function App() {
  const [activePage, setActivePage] = useState("Início");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("flux-transactions");

      if (saved) {
        const parsed = JSON.parse(saved);

        return parsed.map((item) => ({
          ...item,
          name: item.name ?? item.description ?? "",
          value: Number(item.value ?? item.amount ?? 0),
        }));
      }

      return initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  useEffect(() => {
    localStorage.setItem("flux-transactions", JSON.stringify(transactions));
  }, [transactions]);

  function handleSaveTransaction(newTransaction) {
    setTransactions((current) => [newTransaction, ...current]);
  }

 function renderPage() {
  switch (activePage) {
    case "Início":
      return (
        <Dashboard
          transactions={transactions}
          onViewAll={() => setActivePage("Extrato")}
        />
      );

    case "Extrato":
      return <Statement transactions={transactions} />;

    default:
      return (
        <div className="welcome">
          <div>
            <span className="eyebrow">FLUX</span>
            <h1>{activePage}</h1>
            <p>Esta página está em desenvolvimento.</p>
          </div>
        </div>
      );
  }
}

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="main">
        <Topbar
          activePage={activePage}
          openModal={() => setModalOpen(true)}
        />

        <section className="content">
          {renderPage()}
        </section>
      </main>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTransaction}
      />
    </div>
  );
}

export default App;