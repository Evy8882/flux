import { Search, Bell, Plus } from "lucide-react";

function Topbar({ activePage, openModal }) {
  return (
    <header className="topbar">
      <div>
        <span className="breadcrumb">Flux /</span>
        <strong>{activePage}</strong>
      </div>

      <div className="top-actions">
        <button className="icon-button">
          <Search size={19} />
        </button>

        <button className="icon-button">
          <Bell size={19} />
        </button>

        <button className="primary-button" onClick={openModal}>
          <Plus size={18} />
          Nova transação
        </button>
      </div>
    </header>
  );
}

export default Topbar;