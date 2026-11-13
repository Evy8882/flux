
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, UserRound } from "lucide-react";
import logo from "../assets/logo.png";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (onLogin) {
        onLogin(data.user);
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleGuestAccess() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (onLogin) {
      onLogin(null);
    }

    navigate("/");
  }

  return (
    <div className="login-container">
      <div className="login-card panel">
        <div className="auth-brand-wrapper">
          <div className="auth-logo-badge">
            <img src={logo} alt="Flux Logo" />
          </div>
          <span className="auth-brand-name">Flux</span>
        </div>

        <div className="login-header">
          <h1>Bem-vindo de volta</h1>
          <p>Entre com suas credenciais para gerenciar suas finanças.</p>
        </div>

        {error && (
          <div
            className="error-message"
            style={{ color: "red", marginBottom: "1rem", fontSize: "0.9rem" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <div className="login-input-wrapper">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="login-input-wrapper">
              <Lock size={18} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Lembrar de mim</span>
            </label>

            <a
              href="#forgot"
              onClick={(e) => e.preventDefault()}
              className="forgot-password"
            >
              Esqueceu a senha?
            </a>
          </div>

          <button
            type="submit"
            className="primary-button login-button"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar na conta"}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="login-divider">
          <span>ou</span>
        </div>

        <button
          type="button"
          className="guest-button"
          onClick={handleGuestAccess}
        >
          <UserRound size={17} />
          Continuar sem login
        </button>

        <div className="login-footer">
          <p>
            Não tem uma conta?{" "}
            <Link to="/register">Criar conta gratuita</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
