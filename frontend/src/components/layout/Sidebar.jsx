import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  Repeat,
  Settings,
  Menu,
  X,
} from "lucide-react";
import logo from "../../assets/logo.png";

const menuItems = [
  { label: "Início", path: "/", icon: LayoutDashboard },
  { label: "Extrato", path: "/extrato", icon: ArrowLeftRight },
  { label: "Orçamento", path: "/orcamento", icon: Wallet },
  { label: "Metas", path: "/metas", icon: Target },
  { label: "Recorrências", path: "/recorrencias", icon: Repeat },
];

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
      <div className="brand">
        <img
          src={logo}
          alt="Logo"
          className="logo"
          style={{ width: '48px', height: '48px', outline: "1px solid #cccc", borderRadius: '10px' }}
        />

        {sidebarOpen && <span>flux</span>}

        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <span className="menu-label">
        {sidebarOpen ? "MENU PRINCIPAL" : ""}
      </span>

      <nav>
        {menuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            title={label}
          >
            <Icon size={20} />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/configuracoes" className="nav-item">
          <Settings size={20} />
          {sidebarOpen && <span>Configurações</span>}
        </NavLink>

        <div className="profile">
          <div className="avatar">M</div>

          {sidebarOpen && (
            <div>
              <strong>Meu perfil</strong>
              <small>Conta pessoal</small>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;