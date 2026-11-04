import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard";
import Statement from "./pages/Statement";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TransactionModal from "./components/transactions/TransactionModal";

import { initialTransactions } from "./data/initialTransactions";
import "./App.css";

function AppContent({ transactions, onSaveTransaction }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();

  // Define o título exibido na Topbar de acordo com a URL atual
  const getActivePageName = () => {
    switch (location.pathname) {
      case "/":
        return "Início";
      case "/extrato":
        return "Extrato";
      case "/orcamento":
        return "Orçamento";
      case "/metas":
        return "Metas";
      case "/recorrencias":
        return "Recorrências";
      case "/configuracoes":
        return "Configurações";
      default:
        return "Página";
    }
  };

  const activePage = getActivePageName();

  return (
    <div className="app">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="main">
        <Topbar
          activePage={activePage}
          openModal={() => setModalOpen(true)}
        />

        <section className="content">
          <Routes>
            <Route path="/" element={<Dashboard transactions={transactions} />} />
            <Route path="/extrato" element={<Statement transactions={transactions} />} />
            <Route
              path="*"
              element={
                <div className="welcome">
                  <div>
                    <span className="eyebrow">FLUX</span>
                    <h1>Página em desenvolvimento</h1>
                    <p>A página que você tentou acessar está sendo construída.</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </section>
      </main>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSaveTransaction}
      />
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de Login */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login onLogin={() => setIsAuthenticated(true)} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Rota de Cadastro */}
        <Route
          path="/register"
          element={
            !isAuthenticated ? (
              <Register onLogin={() => setIsAuthenticated(true)} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Rotas Protegidas do Sistema */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AppContent
                transactions={transactions}
                onSaveTransaction={handleSaveTransaction}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;