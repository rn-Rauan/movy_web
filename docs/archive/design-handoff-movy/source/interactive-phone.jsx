/* global React, Phone, BottomNav,
   ScreenDashboard, ScreenViagens, ScreenTemplates, ScreenEmpresa, ScreenPerfil,
   ScreenDashboardReport */

// ============================================================================
// interactive-phone.jsx — Wrapper que junta as telas com a bottom-nav ativa
// ============================================================================

function InteractivePhone({ t, defaultScreen = "dashboard" }) {
  const [screen, setScreen] = React.useState(defaultScreen);
  const screens = {
    dashboard: <ScreenDashboard t={t} onOpenReport={() => setScreen("report")} />,
    report: <ScreenDashboardReport t={t} />,
    viagens: <ScreenViagens t={t} />,
    templates: <ScreenTemplates t={t} />,
    empresa: <ScreenEmpresa t={t} />,
    perfil: <ScreenPerfil t={t} />,
  };
  return (
    <Phone t={t} label={`Interactive · ${screen}`}>
      <div style={{ position: "absolute", inset: 0 }}>{screens[screen]}</div>
      <BottomNav active={screen === "report" ? "dashboard" : screen} onChange={setScreen} t={t} />
    </Phone>
  );
}

Object.assign(window, { InteractivePhone });
