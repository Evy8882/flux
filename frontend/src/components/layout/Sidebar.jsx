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

const menuItems = [
  { label: "Início", icon: LayoutDashboard },
  { label: "Extrato", icon: ArrowLeftRight },
  { label: "Orçamento", icon: Wallet },
  { label: "Metas", icon: Target },
  { label: "Recorrências", icon: Repeat },
];

function Sidebar({ activePage, setActivePage, sidebarOpen, setSidebarOpen }) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
      <div className="brand">
        <div className="brand-icon">F</div>

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
        {menuItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`nav-item ${activePage === label ? "active" : ""}`}
            onClick={() => setActivePage(label)}
            title={label}
          >
            <Icon size={20} />
            {sidebarOpen && <span>{label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item">
          <Settings size={20} />
          {sidebarOpen && <span>Configurações</span>}
        </button>

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