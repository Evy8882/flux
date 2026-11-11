import { useEffect, useState } from "react";
import {
    UserRound,
    SlidersHorizontal,
    Bell,
    Database,
    Download,
    Check,
} from "lucide-react";

const defaultSettings = {
    name: "Meu perfil",
    email: "",
    monthStart: "1",
    budgetAlerts: true,
    goalAlerts: true,
    recurrenceAlerts: true,
};

function Settings() {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem("flux-settings");
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch {
            return defaultSettings;
        }
    });

    const [savedMessage, setSavedMessage] = useState(false);

    useEffect(() => {
        localStorage.setItem("flux-settings", JSON.stringify(settings));
    }, [settings]);

    function updateSetting(field, value) {
        setSettings((current) => ({
            ...current,
            [field]: value,
        }));

        setSavedMessage(false);
    }

    function exportData() {
        const data = {
            settings,
            transactions: JSON.parse(localStorage.getItem("flux-transactions") || "[]"),
            budgets: JSON.parse(localStorage.getItem("flux-budgets") || "[]"),
            goals: JSON.parse(localStorage.getItem("flux-goals") || "[]"),
            recurrences: JSON.parse(localStorage.getItem("flux-recurrences") || "[]"),
        };

        const file = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(file);
        const link = document.createElement("a");

        link.href = url;
        link.download = "flux-dados.json";
        link.click();

        URL.revokeObjectURL(url);
    }

    function handleSave() {
        localStorage.setItem("flux-settings", JSON.stringify(settings));
        setSavedMessage(true);
    }

    return (
        <div className="settings-page">
            <div className="welcome">
                <div>
                    <span className="eyebrow">PERSONALIZAÇÃO</span>
                    <h1>Configurações</h1>
                    <p>Gerencie suas informações e preferências do Flux.</p>
                </div>
            </div>

            <section className="panel settings-panel">
                <div className="settings-section-heading">
                    <div className="settings-icon">
                        <UserRound size={19} />
                    </div>
                    <div>
                        <h2>Perfil</h2>
                        <p>Informações da sua conta pessoal.</p>
                    </div>
                </div>

                <div className="settings-fields">
                    <label className="settings-field">
                        <span>Nome</span>
                        <input
                            value={settings.name}
                            onChange={(e) => updateSetting("name", e.target.value)}
                            placeholder="Seu nome"
                        />
                    </label>

                    <label className="settings-field">
                        <span>E-mail</span>
                        <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => updateSetting("email", e.target.value)}
                            placeholder="seuemail@exemplo.com"
                        />
                    </label>
                </div>
            </section>

            <section className="panel settings-panel">
                <div className="settings-section-heading">
                    <div className="settings-icon">
                        <SlidersHorizontal size={19} />
                    </div>
                    <div>
                        <h2>Preferências</h2>
                        <p>Defina como deseja organizar suas finanças.</p>
                    </div>
                </div>

                <div className="settings-option">
                    <div>
                        <strong>Início do mês financeiro</strong>
                        <p>Escolha o dia em que seu controle mensal começa.</p>
                    </div>

                    <select
                        value={settings.monthStart}
                        onChange={(e) => updateSetting("monthStart", e.target.value)}
                    >
                        <option value="1">Dia 1</option>
                        <option value="5">Dia 5</option>
                        <option value="10">Dia 10</option>
                        <option value="15">Dia 15</option>
                    </select>
                </div>

                <div className="settings-option">
                    <div>
                        <strong>Moeda utilizada</strong>
                        <p>Moeda padrão para seus registros financeiros.</p>
                    </div>
                    <span className="settings-static-value">BRL · Real brasileiro</span>
                </div>

                <div className="settings-option">
                    <div>
                        <strong>Tema</strong>
                        <p>A aparência atual do aplicativo.</p>
                    </div>
                    <span className="settings-static-value">Escuro</span>
                </div>
            </section>

            <section className="panel settings-panel">
                <div className="settings-section-heading">
                    <div className="settings-icon">
                        <Bell size={19} />
                    </div>
                    <div>
                        <h2>Notificações</h2>
                        <p>Escolha quais avisos deseja manter ativados.</p>
                    </div>
                </div>

                {[
                    {
                        field: "budgetAlerts",
                        title: "Alertas de orçamento",
                        description: "Avisos quando seus gastos se aproximarem do limite.",
                    },
                    {
                        field: "goalAlerts",
                        title: "Atualizações de metas",
                        description: "Acompanhe o progresso dos seus objetivos financeiros.",
                    },
                    {
                        field: "recurrenceAlerts",
                        title: "Lembretes de recorrências",
                        description: "Avisos sobre contas e recebimentos recorrentes.",
                    },
                ].map((item) => (
                    <label className="settings-option settings-toggle" key={item.field}>
                        <div>
                            <strong>{item.title}</strong>
                            <p>{item.description}</p>
                        </div>

                        <input
                            type="checkbox"
                            checked={settings[item.field]}
                            onChange={(e) => updateSetting(item.field, e.target.checked)}
                        />
                        <span className="toggle-track" />
                    </label>
                ))}
            </section>

            <section className="panel settings-panel">
                <div className="settings-section-heading">
                    <div className="settings-icon">
                        <Database size={19} />
                    </div>
                    <div>
                        <h2>Seus dados</h2>
                        <p>Faça uma cópia das informações armazenadas no aplicativo.</p>
                    </div>
                </div>

                <div className="settings-option">
                    <div>
                        <strong>Exportar dados</strong>
                        <p>Baixe suas transações, orçamentos, metas e recorrências.</p>
                    </div>

                    <button className="settings-export-button" onClick={exportData}>
                        <Download size={16} />
                        Exportar
                    </button>
                </div>
            </section>

            <div className="settings-footer">
                <span>
                    {savedMessage && (
                        <>
                            <Check size={15} />
                            Alterações salvas
                        </>
                    )}
                </span>

                <button className="primary-button" onClick={handleSave}>
                    Salvar alterações
                </button>
            </div>
        </div>
    );
}

export default Settings;