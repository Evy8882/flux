
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";

import Dashboard from "./pages/Dashboard";
import Statement from "./pages/Statement";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Recurrences from "./pages/Recurrences";
import Settings from "./pages/Settings";

import Login from "./pages/Login";
import Register from "./pages/Register";

import TransactionModal from "./components/transactions/TransactionModal";

import { initialTransactions } from "./data/initialTransactions";

import "./App.css";

function AppContent({ transactions, setTransactions }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const navigate = useNavigate();

  function handleSaveTransaction(transaction) {
    if (editingTransaction) {
      setTransactions((current) =>
        current.map((item) =>
          item.id === transaction.id ? transaction : item
        )
      );
    } else {
      setTransactions((current) => [transaction, ...current]);
    }

    setEditingTransaction(null);
    setModalOpen(false);
  }

  function handleDeleteTransaction(id) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta transação?"
    );

    if (confirmed) {
      setTransactions((current) =>
        current.filter((item) => item.id !== id)
      );
    }
  }

  function handleEditTransaction(transaction) {
    setEditingTransaction(transaction);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditingTransaction(null);
  }

  return (
    <div className="app">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                transactions={transactions}
                onViewAll={() => navigate("/extrato")}
              />
            }
          />

          <Route
            path="/extrato"
            element={
              <Statement
                transactions={transactions}
                onDelete={handleDeleteTransaction}
                onEdit={handleEditTransaction}
              />
            }
          />

          <Route
            path="/orcamento"
            element={
              <Budget transactions={transactions} />
            }
          />

          <Route
            path="/metas"
            element={<Goals />}
          />

          <Route
            path="/recorrencias"
            element={<Recurrences />}
          />

          <Route
            path="/configuracoes"
            element={<Settings />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>

      <TransactionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

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
    localStorage.setItem(
      "flux-transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login
                onLogin={() => setIsAuthenticated(true)}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/register"
          element={
            !isAuthenticated ? (
              <Register
                onLogin={() => setIsAuthenticated(true)}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AppContent
                transactions={transactions}
                setTransactions={setTransactions}
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
