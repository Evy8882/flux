import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (onLogin) onLogin({ email });
    }, 800);
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
            <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-password">
              Esqueceu a senha?
            </a>
          </div>

          <button type="submit" className="primary-button login-button" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar na conta"}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

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