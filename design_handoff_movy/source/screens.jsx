/* global React */

// ============================================================================
// JRegu's — design tokens (overridable via Tweaks)
// ============================================================================

const PALETTES = {
  terracotta: {
    bg: "#f3eee5",
    surface: "#ffffff",
    surface2: "#faf6ed",
    ink: "#1c1b1f",
    ink2: "#4a4954",
    muted: "#8a8892",
    line: "#e9e2d3",
    lineSoft: "#f0ead9",
    accent: "#c8553d",
    accentInk: "#fff",
    accentSoft: "#f4dfd6",
    success: "#3a7a3e",
    successSoft: "#e2efde",
    danger: "#a8281e",
    dangerSoft: "#f3d8d3",
    warn: "#a36810",
    warnSoft: "#f1e1bd",
    info: "#2a5da8",
    infoSoft: "#dde7f4",
  },
  ocean: {
    bg: "#eef2f4",
    surface: "#ffffff",
    surface2: "#f5f8f9",
    ink: "#0c1a22",
    ink2: "#3a4a55",
    muted: "#7d8a92",
    line: "#dfe6ea",
    lineSoft: "#ebf0f3",
    accent: "#0e6b7a",
    accentInk: "#fff",
    accentSoft: "#d6e9ec",
    success: "#2e6b56",
    successSoft: "#dceae3",
    danger: "#a8281e",
    dangerSoft: "#f3d8d3",
    warn: "#9a6610",
    warnSoft: "#efdfba",
    info: "#1c4f80",
    infoSoft: "#d8e3ee",
  },
  forest: {
    bg: "#f0eee4",
    surface: "#ffffff",
    surface2: "#f7f5ea",
    ink: "#161a14",
    ink2: "#3f4538",
    muted: "#82887a",
    line: "#e3e1d2",
    lineSoft: "#ece9d8",
    accent: "#3d6b2e",
    accentInk: "#fff",
    accentSoft: "#dde7d2",
    success: "#3d6b2e",
    successSoft: "#dde7d2",
    danger: "#a8281e",
    dangerSoft: "#f3d8d3",
    warn: "#9a6610",
    warnSoft: "#efdfba",
    info: "#2a5da8",
    infoSoft: "#dde7f4",
  },
};

// ============================================================================
// Icons (inline SVG — 24/stroke)
// ============================================================================

const Icon = ({
  d,
  size = 20,
  stroke = 1.6,
  fill = "none",
  color = "currentColor",
  children,
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children || <path d={d} />}
  </svg>
);

const I = {
  arrowLeft: (p) => <Icon {...p} d="M19 12H5M12 19l-7-7 7-7" />,
  arrowRight: (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7" />,
  chevron: (p) => <Icon {...p} d="M9 6l6 6-6 6" />,
  chevronDown: (p) => <Icon {...p} d="M6 9l6 6 6-6" />,
  logout: (p) => (
    <Icon {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  ),
  search: (p) => (
    <Icon {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  ),
  plus: (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  bus: (p) => (
    <Icon {...p}>
      <rect x="3" y="4" width="18" height="14" rx="2.5" />
      <path d="M3 12h18" />
      <circle cx="7.5" cy="20" r="1.5" />
      <circle cx="16.5" cy="20" r="1.5" />
      <path d="M6 7h12" />
    </Icon>
  ),
  grid: (p) => (
    <Icon {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  ),
  doc: (p) => (
    <Icon {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </Icon>
  ),
  building: (p) => (
    <Icon {...p}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 8h0M15 8h0M9 12h0M15 12h0M9 16h0M15 16h0" />
    </Icon>
  ),
  user: (p) => (
    <Icon {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
    </Icon>
  ),
  calendar: (p) => (
    <Icon {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </Icon>
  ),
  trending: (p) => (
    <Icon {...p}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </Icon>
  ),
  users: (p) => (
    <Icon {...p}>
      <circle cx="9" cy="9" r="3.5" />
      <path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M16 14c3 0 5 2 5 5" />
    </Icon>
  ),
  car: (p) => (
    <Icon {...p}>
      <path d="M5 14h14l-1.5-5h-11L5 14z" />
      <rect x="3" y="14" width="18" height="5" rx="1.5" />
      <circle cx="7.5" cy="19" r="1.2" />
      <circle cx="16.5" cy="19" r="1.2" />
    </Icon>
  ),
  pct: (p) => (
    <Icon {...p}>
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
      <path d="M19 5 5 19" />
    </Icon>
  ),
  pencil: (p) => (
    <Icon {...p}>
      <path d="M16 3l5 5L8 21H3v-5z" />
    </Icon>
  ),
  lock: (p) => (
    <Icon {...p}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
  ),
  mail: (p) => (
    <Icon {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </Icon>
  ),
  phone: (p) => (
    <Icon {...p}>
      <path d="M4 5c0-1 1-2 2-2h2l2 5-2 1c1 3 3 5 6 6l1-2 5 2v2c0 1-1 2-2 2C9 19 5 15 4 5z" />
    </Icon>
  ),
  pin: (p) => (
    <Icon {...p}>
      <path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  ),
  hash: (p) => <Icon {...p} d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />,
  id: (p) => (
    <Icon {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="12" r="2.5" />
      <path d="M14 10h4M14 14h3" />
    </Icon>
  ),
  bolt: (p) => <Icon {...p} d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  check: (p) => <Icon {...p} d="M4 12l5 5L20 6" />,
  x: (p) => <Icon {...p} d="M6 6l12 12M18 6 6 18" />,
  clock: (p) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),
  alert: (p) => (
    <Icon {...p}>
      <path d="M12 9v4M12 17h0" />
      <circle cx="12" cy="12" r="9" />
    </Icon>
  ),
  refresh: (p) => (
    <Icon {...p}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </Icon>
  ),
  share: (p) => (
    <Icon {...p}>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="17" cy="6" r="2.5" />
      <circle cx="17" cy="18" r="2.5" />
      <path d="m8 11 7-4M8 13l7 4" />
    </Icon>
  ),
  copy: (p) => (
    <Icon {...p}>
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M3 16V5a2 2 0 0 1 2-2h11" />
    </Icon>
  ),
  qr: (p) => (
    <Icon {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM14 19h3M19 14v7M21 17h-2" />
    </Icon>
  ),
  external: (p) => (
    <Icon {...p}>
      <path d="M14 3h7v7" />
      <path d="M21 3l-9 9" />
      <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
    </Icon>
  ),
  pinFilled: (p) => (
    <Icon {...p} fill="currentColor" stroke="none">
      <path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" />
    </Icon>
  ),
  list: (p) => <Icon {...p} d="M4 6h16M4 12h16M4 18h16" />,
  ticket: (p) => (
    <Icon {...p}>
      <path d="M3 9a2 2 0 0 0 0 4v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0 0-4V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
      <path d="M13 5v2M13 11v2M13 17v2" />
    </Icon>
  ),
  swap: (p) => (
    <Icon {...p}>
      <path d="M17 3l4 4-4 4M21 7H7" />
      <path d="M7 13l-4 4 4 4M3 17h14" />
    </Icon>
  ),
  money: (p) => (
    <Icon {...p}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7 12h0M17 12h0" />
    </Icon>
  ),
};

// ============================================================================
// Status pill
// ============================================================================

const STATUS = {
  Agendada: { dot: "info", label: "Agendada" },
  Confirmada: { dot: "success", label: "Confirmada" },
  Cancelada: { dot: "danger", label: "Cancelada" },
  Rascunho: { dot: "muted", label: "Rascunho" },
  Finalizada: { dot: "ink2", label: "Finalizada" },
};

function StatusPill({ status, t, soft = true }) {
  const meta = STATUS[status] || STATUS.Agendada;
  const colorMap = {
    info: { fg: t.info, bg: t.infoSoft },
    success: { fg: t.success, bg: t.successSoft },
    danger: { fg: t.danger, bg: t.dangerSoft },
    muted: { fg: t.muted, bg: t.lineSoft },
    ink2: { fg: t.ink2, bg: t.lineSoft },
  };
  const c = colorMap[meta.dot];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px 3px 7px",
        borderRadius: 999,
        background: soft ? c.bg : "transparent",
        color: c.fg,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.1,
        fontFamily: "'Manrope', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 99, background: c.fg }} />
      {meta.label}
    </span>
  );
}

// ============================================================================
// Route visual: A ── ─ ─ ─ ─→ B with stops
// ============================================================================

function RouteVisual({ from, to, t, dense = false }) {
  const stopSize = dense ? 8 : 10;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: stopSize,
            height: stopSize,
            borderRadius: 99,
            border: `2px solid ${t.ink}`,
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          height: 1,
          borderTop: `1.5px dashed ${t.line}`,
          position: "relative",
          minWidth: 18,
        }}
      >
        <I.arrowRight
          size={12}
          color={t.muted}
          style={{ position: "absolute", right: -6, top: -7 }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{ width: stopSize, height: stopSize, borderRadius: 99, background: t.accent }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: "1 0 auto", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            marginLeft: -((stopSize + 10) * 2 + 18),
            paddingLeft: 0,
          }}
        ></div>
      </div>
    </div>
  );
}

// Inline route line specifically for trip cards — labels above the dots.
function Route({ from, to, t, big = false }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 10,
        width: "100%",
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 }}
      >
        <div
          style={{
            fontSize: 10,
            color: t.muted,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Origem
        </div>
        <div style={{ fontSize: big ? 17 : 15, fontWeight: 700, color: t.ink, lineHeight: 1.2 }}>
          {from}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 4px" }}>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: 99,
            border: `1.8px solid ${t.ink}`,
            flex: "0 0 auto",
          }}
        />
        <div
          style={{ flex: 1, position: "relative", borderTop: `1.5px dashed ${t.line}`, height: 0 }}
        />
        <I.bus size={14} color={t.accent} style={{ flex: "0 0 auto" }} />
        <div
          style={{ flex: 1, position: "relative", borderTop: `1.5px dashed ${t.line}`, height: 0 }}
        />
        <div
          style={{ width: 7, height: 7, borderRadius: 99, background: t.accent, flex: "0 0 auto" }}
        />
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 0 }}
      >
        <div
          style={{
            fontSize: 10,
            color: t.muted,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Destino
        </div>
        <div
          style={{
            fontSize: big ? 17 : 15,
            fontWeight: 700,
            color: t.ink,
            lineHeight: 1.2,
            textAlign: "right",
          }}
        >
          {to}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Bottom nav
// ============================================================================

function BottomNav({ active, onChange, t }) {
  const items = [
    { id: "dashboard", label: "Dashboard", Icon: I.grid },
    { id: "viagens", label: "Viagens", Icon: I.bus },
    { id: "templates", label: "Templates", Icon: I.doc },
    { id: "empresa", label: "Empresa", Icon: I.building },
    { id: "perfil", label: "Perfil", Icon: I.user },
  ];
  return (
    <nav
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background: t.surface,
        borderTop: `1px solid ${t.line}`,
        padding: "8px 6px 14px",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 2,
      }}
    >
      {items.map(({ id, label, Icon: Ic }) => {
        const on = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange && onChange(id)}
            style={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "6px 4px 4px",
              borderRadius: 10,
              color: on ? t.accent : t.muted,
              fontFamily: "'Manrope', sans-serif",
              fontSize: 10,
              fontWeight: on ? 700 : 500,
              letterSpacing: 0.1,
            }}
          >
            <div
              style={{
                padding: "4px 12px",
                borderRadius: 99,
                background: on ? t.accentSoft : "transparent",
                transition: "background .15s",
              }}
            >
              <Ic size={20} stroke={on ? 2 : 1.6} />
            </div>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ============================================================================
// Top bar
// ============================================================================

function TopBar({ title, t, back, action }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        background: t.surface,
        borderBottom: `1px solid ${t.line}`,
        padding: "14px 18px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {back && (
          <button
            style={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              padding: 2,
              color: t.ink,
              display: "flex",
            }}
          >
            <I.arrowLeft size={20} />
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: t.ink, letterSpacing: -0.3 }}>
          {title}
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {action}
        <button
          style={{
            border: 0,
            background: "transparent",
            cursor: "pointer",
            padding: 6,
            color: t.ink2,
            display: "flex",
          }}
        >
          <I.logout size={18} />
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// Reusable bits
// ============================================================================

function Card({ children, t, style }) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.line}`,
        borderRadius: 14,
        padding: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Bar({ value, max, color, t, height = 6 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ height, borderRadius: 99, background: t.lineSoft, overflow: "hidden" }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color || t.accent,
          borderRadius: 99,
          transition: "width .3s",
        }}
      />
    </div>
  );
}

function Phone({ children, t, label }) {
  return (
    <div
      style={{
        width: 390,
        height: 844,
        background: t.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Manrope', sans-serif",
        color: t.ink,
        WebkitFontSmoothing: "antialiased",
      }}
      data-screen-label={label}
    >
      {children}
    </div>
  );
}

function Scroll({ children, style }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 56,
        left: 0,
        right: 0,
        bottom: 78,
        overflow: "auto",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// SCREEN — Dashboard
// ============================================================================

function ScreenDashboard({ t, dense, onOpenReport }) {
  const trips = [
    {
      date: "22/05",
      time: "20:00",
      from: "Campo Maior",
      to: "Piripiri",
      booked: 0,
      total: 30,
      status: "Agendada",
    },
    {
      date: "25/05",
      time: "20:00",
      from: "Campo Maior",
      to: "Piripiri",
      booked: 8,
      total: 30,
      status: "Agendada",
    },
    {
      date: "26/05",
      time: "20:00",
      from: "Campo Maior",
      to: "Piripiri",
      booked: 14,
      total: 30,
      status: "Confirmada",
    },
    {
      date: "27/05",
      time: "20:00",
      from: "Campo Maior",
      to: "Piripiri",
      booked: 2,
      total: 30,
      status: "Agendada",
    },
  ];
  const week = [36, 72, 24, 96, 168, 132, 108]; // revenue R$ per day
  const weekMax = Math.max(...week);
  const days = ["Q", "S", "D", "S", "T", "Q", "Q"];
  const totalBooked = trips.reduce((s, x) => s + x.booked, 0);
  const totalSeats = trips.reduce((s, x) => s + x.total, 0);
  const estimatedRevenue = totalBooked * 20; // R$ 20 ida+volta

  return (
    <Phone t={t} label="01 Dashboard">
      <TopBar title="Dashboard" t={t} />
      <Scroll>
        <div style={{ padding: "14px 16px 24px" }}>
          {/* Greeting */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                color: t.muted,
                fontWeight: 600,
                letterSpacing: 0.3,
                textTransform: "uppercase",
              }}
            >
              Boa tarde
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: t.ink,
                letterSpacing: -0.5,
                lineHeight: 1.1,
                marginTop: 2,
              }}
            >
              Jacintos, bem-vindo
            </div>
          </div>

          {/* Hero KPI: Receita estipulada */}
          <div
            style={{
              background: t.ink,
              color: "#fff",
              borderRadius: 18,
              padding: 16,
              marginBottom: 12,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.6,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                  }}
                >
                  Receita estipulada
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                  <span
                    style={{
                      fontSize: 18,
                      opacity: 0.55,
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    R$
                  </span>
                  <div
                    style={{
                      fontSize: 40,
                      fontWeight: 800,
                      letterSpacing: -1.5,
                      fontFamily: "'JetBrains Mono', monospace",
                      lineHeight: 1,
                    }}
                  >
                    {estimatedRevenue.toLocaleString("pt-BR")}
                    <span style={{ fontSize: 22, opacity: 0.5 }}>,00</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                  {totalBooked} de {totalSeats} vagas vendidas
                </div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  flex: "0 0 auto",
                }}
              >
                <I.trending size={12} />
                Esta semana
              </div>
            </div>
            {/* Mini chart — revenue per day */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 44 }}>
              {week.map((v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      borderRadius: 4,
                      height: `${(v / weekMax) * 36 + 4}px`,
                      background: i === 4 ? t.accent : "rgba(255,255,255,0.18)",
                    }}
                  />
                  <div style={{ fontSize: 9, opacity: 0.5, fontWeight: 600 }}>{days[i]}</div>
                </div>
              ))}
            </div>

            {/* CTA: full report */}
            <button
              onClick={onOpenReport}
              style={{
                width: "100%",
                marginTop: 14,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                padding: "10px 12px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12.5,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <I.trending size={14} /> Ver relatório completo do mês
              </span>
              <I.arrowRight size={14} stroke={2.2} />
            </button>
          </div>

          {/* KPI Grid */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}
          >
            <Card t={t} style={{ padding: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: t.muted,
                  marginBottom: 8,
                }}
              >
                <I.bus size={14} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.2 }}>
                  Viagens ativas
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: t.ink,
                    letterSpacing: -1,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  4
                </div>
                <div style={{ fontSize: 11, color: t.muted }}>de 5 total</div>
              </div>
              <div style={{ marginTop: 8 }}>
                <Bar value={4} max={5} t={t} color={t.accent} height={4} />
              </div>
            </Card>
            <Card t={t} style={{ padding: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: t.muted,
                  marginBottom: 8,
                }}
              >
                <I.calendar size={14} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.2 }}>
                  Próximos 7 dias
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: t.ink,
                    letterSpacing: -1,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  4
                </div>
                <div style={{ fontSize: 11, color: t.muted }}>partidas</div>
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 2 }}>
                {[1, 1, 0, 1, 1, 0, 0].map((d, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background: d ? t.accent : t.lineSoft,
                    }}
                  />
                ))}
              </div>
            </Card>
            <Card t={t} style={{ padding: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: t.muted,
                  marginBottom: 8,
                }}
              >
                <I.users size={14} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.2 }}>
                  Passageiros
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: t.ink,
                    letterSpacing: -1,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {totalBooked}
                </div>
                <div style={{ fontSize: 11, color: t.muted }}>inscritos</div>
              </div>
              <div style={{ fontSize: 10, color: t.muted, marginTop: 8 }}>
                {totalSeats - totalBooked} vagas disponíveis
              </div>
            </Card>
            <Card t={t} style={{ padding: 12, background: t.surface2 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: t.warn,
                  marginBottom: 8,
                }}
              >
                <I.alert size={14} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.2 }}>Atenção</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.ink, lineHeight: 1.25 }}>
                1 viagem sem inscritos
              </div>
              <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>
                Risco de cancelamento automático
              </div>
            </Card>
          </div>

          {/* Próximas viagens */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 10,
              padding: "0 2px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 800,
                color: t.ink,
                letterSpacing: -0.2,
              }}
            >
              Próximas viagens
            </h2>
            <button
              style={{
                border: 0,
                background: "transparent",
                color: t.accent,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              Ver todas <I.chevron size={14} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {trips.map((trip, i) => (
              <Card key={i} t={t} style={{ padding: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: t.ink,
                        letterSpacing: -0.5,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {trip.date}
                    </div>
                    <div style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>{trip.time}</div>
                  </div>
                  <StatusPill status={trip.status} t={t} />
                </div>
                <Route from={trip.from} to={trip.to} t={t} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Bar
                      value={trip.booked}
                      max={trip.total}
                      t={t}
                      color={trip.booked > trip.total * 0.5 ? t.success : t.accent}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: t.ink2,
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {trip.booked}
                    <span style={{ color: t.muted, fontWeight: 500 }}>/{trip.total}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Scroll>
    </Phone>
  );
}

// ============================================================================
// SCREEN — Viagens
// ============================================================================

function ScreenViagens({ t }) {
  const trips = [
    {
      date: "21/05",
      time: "20:00",
      from: "Campo Maior",
      to: "Piripiri",
      booked: 0,
      total: 30,
      status: "Cancelada",
      driver: "Akinuku",
    },
    {
      date: "22/05",
      time: "20:00",
      from: "Campo Maior",
      to: "Piripiri",
      booked: 0,
      total: 30,
      status: "Agendada",
      driver: "Akinuku",
    },
    {
      date: "25/05",
      time: "20:00",
      from: "Campo Maior",
      to: "Piripiri",
      booked: 8,
      total: 30,
      status: "Agendada",
      driver: "Akinuku",
    },
    {
      date: "26/05",
      time: "20:00",
      from: "Campo Maior",
      to: "Piripiri",
      booked: 14,
      total: 30,
      status: "Confirmada",
      driver: "Akinuku",
    },
    {
      date: "27/05",
      time: "20:00",
      from: "Campo Maior",
      to: "Piripiri",
      booked: 2,
      total: 30,
      status: "Agendada",
      driver: "Akinuku",
    },
  ];
  const dates = ["Qualquer", "Hoje", "Amanhã", "Esta sem.", "Próx. sem."];
  const status = [
    { id: "todas", label: "Todas", n: 12 },
    { id: "rascunho", label: "Rascunho", n: 1 },
    { id: "agendada", label: "Agendada", n: 6 },
    { id: "confirmada", label: "Confirmada", n: 2 },
    { id: "cancelada", label: "Cancelada", n: 2 },
    { id: "finalizada", label: "Finalizada", n: 1 },
  ];

  return (
    <Phone t={t} label="02 Viagens">
      <TopBar
        title="Viagens"
        t={t}
        back
        action={
          <button
            style={{
              background: t.accent,
              color: t.accentInk,
              border: 0,
              padding: "7px 12px",
              borderRadius: 99,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            <I.plus size={14} stroke={2.4} /> Nova
          </button>
        }
      />
      <Scroll>
        <div style={{ padding: "12px 16px 24px" }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <I.search
              size={16}
              color={t.muted}
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              placeholder="Buscar por origem ou destino"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 14px 11px 38px",
                border: `1px solid ${t.line}`,
                borderRadius: 12,
                fontSize: 13,
                fontFamily: "inherit",
                background: t.surface,
                color: t.ink,
                outline: "none",
              }}
            />
          </div>

          {/* Date segmented */}
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 3,
              background: t.surface2,
              border: `1px solid ${t.line}`,
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            {dates.map((d, i) => (
              <button
                key={d}
                style={{
                  flex: 1,
                  border: 0,
                  cursor: "pointer",
                  padding: "7px 4px",
                  borderRadius: 9,
                  background: i === 0 ? t.surface : "transparent",
                  boxShadow: i === 0 ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  fontSize: 11,
                  fontWeight: i === 0 ? 700 : 500,
                  color: i === 0 ? t.ink : t.muted,
                  fontFamily: "inherit",
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Status chips with counts */}
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              marginBottom: 16,
              paddingBottom: 4,
              marginLeft: -16,
              paddingLeft: 16,
              marginRight: -16,
              paddingRight: 16,
            }}
          >
            {status.map((s, i) => (
              <button
                key={s.id}
                style={{
                  flex: "0 0 auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 11px",
                  borderRadius: 99,
                  border: i === 0 ? "none" : `1px solid ${t.line}`,
                  background: i === 0 ? t.ink : t.surface,
                  color: i === 0 ? t.surface : t.ink2,
                  fontSize: 12,
                  fontWeight: i === 0 ? 700 : 500,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
                <span
                  style={{
                    background: i === 0 ? "rgba(255,255,255,0.15)" : t.lineSoft,
                    color: i === 0 ? "#fff" : t.muted,
                    borderRadius: 99,
                    padding: "1px 6px",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {s.n}
                </span>
              </button>
            ))}
          </div>

          {/* Section header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 10,
              padding: "0 2px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 12,
                color: t.muted,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              Esta semana · 5
            </h2>
            <button
              style={{
                border: 0,
                background: "transparent",
                color: t.muted,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Recentes <I.chevronDown size={12} />
            </button>
          </div>

          {/* Trip cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {trips.map((trip, i) => (
              <Card key={i} t={t} style={{ padding: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: t.ink,
                        letterSpacing: -0.5,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {trip.date}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: t.muted }}>
                      <I.clock size={11} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{trip.time}</span>
                    </div>
                  </div>
                  <StatusPill status={trip.status} t={t} />
                </div>

                <Route from={trip.from} to={trip.to} t={t} />

                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: `1px dashed ${t.line}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: t.ink2 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 99,
                        background: t.accentSoft,
                        color: t.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      A
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{trip.driver}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                      maxWidth: 180,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Bar
                        value={trip.booked}
                        max={trip.total}
                        t={t}
                        color={
                          trip.status === "Cancelada"
                            ? t.muted
                            : trip.booked > trip.total * 0.5
                              ? t.success
                              : t.accent
                        }
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: t.ink,
                      }}
                    >
                      {trip.booked}
                      <span style={{ color: t.muted, fontWeight: 500 }}>/{trip.total}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Scroll>
    </Phone>
  );
}

// ============================================================================
// SCREEN — Empresa
// ============================================================================

function ScreenEmpresa({ t }) {
  const [auto, setAuto] = React.useState(true);
  const [autoOpen, setAutoOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const usages = [
    { label: "Veículos", icon: I.car, used: 1, total: 1 },
    { label: "Motoristas", icon: I.users, used: 1, total: 1 },
    { label: "Viagens / mês", icon: I.bus, used: 5, total: 5 },
  ];

  const copy = () => {
    try {
      navigator.clipboard?.writeText("jregu.app/jregu-s");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {}
  };

  return (
    <Phone t={t} label="03 Empresa">
      <TopBar title="Empresa" t={t} />
      <Scroll>
        <div
          style={{ padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Plan card — hero */}
          <div
            style={{
              background: t.ink,
              color: "#fff",
              borderRadius: 18,
              padding: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: t.accent,
                    color: t.accentInk,
                    padding: "3px 8px",
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                  }}
                >
                  <I.bolt size={10} fill={t.accentInk} stroke={t.accentInk} /> PLANO FREE
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    opacity: 0.6,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                  }}
                >
                  Mensalidade
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      letterSpacing: -1,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    R$ 0,00
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>/mês</div>
                </div>
                <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                  Válido até 19/06, 17:25
                </div>
              </div>
            </div>

            {/* Usage bars */}
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {usages.map((u) => {
                const pct = (u.used / u.total) * 100;
                const full = pct >= 100;
                return (
                  <div key={u.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 5,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <u.icon size={13} color={full ? t.accent : "rgba(255,255,255,0.7)"} />
                        <span style={{ opacity: 0.85 }}>{u.label}</span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: full ? t.accent : "#fff",
                        }}
                      >
                        {u.used}
                        <span style={{ opacity: 0.5, fontWeight: 500 }}>/{u.total}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 99,
                        background: "rgba(255,255,255,0.1)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: full ? t.accent : "rgba(255,255,255,0.6)",
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                style={{
                  flex: 1,
                  border: 0,
                  background: t.accent,
                  color: t.accentInk,
                  padding: "10px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Fazer upgrade →
              </button>
              <button
                style={{
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "transparent",
                  color: "#fff",
                  padding: "10px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Pagamentos
              </button>
            </div>
          </div>

          {/* Share public link */}
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.line}`,
              borderRadius: 14,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: t.accentSoft,
                  color: t.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <I.share size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>
                  Sua página pública
                </div>
                <div style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>
                  Compartilhe pra clientes verem suas viagens
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                background: t.surface2,
                border: `1px solid ${t.line}`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12.5,
                  color: t.ink2,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  minWidth: 0,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                <span style={{ color: t.muted }}>jregu.app/</span>
                <span style={{ color: t.accent, fontWeight: 800 }}>jregu-s</span>
              </div>
              <button
                onClick={copy}
                style={{
                  border: 0,
                  borderLeft: `1px solid ${t.line}`,
                  background: copied ? t.success : t.ink,
                  color: "#fff",
                  padding: "0 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  transition: "background .15s",
                }}
              >
                {copied ? <I.check size={14} stroke={2.5} /> : <I.copy size={14} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <button
                style={{
                  flex: 1,
                  border: `1px solid ${t.line}`,
                  background: t.surface,
                  padding: "8px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.ink2,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <I.share size={13} /> Compartilhar
              </button>
              <button
                style={{
                  flex: 1,
                  border: `1px solid ${t.line}`,
                  background: t.surface,
                  padding: "8px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.ink2,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <I.qr size={13} /> QR code
              </button>
              <button
                style={{
                  flex: 1,
                  border: `1px solid ${t.line}`,
                  background: t.surface,
                  padding: "8px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.ink2,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <I.external size={13} /> Abrir
              </button>
            </div>
          </div>

          {/* Auto-schedule — collapsible */}
          <Card t={t} style={{ padding: 0 }}>
            <button
              onClick={() => setAutoOpen(!autoOpen)}
              style={{
                width: "100%",
                textAlign: "left",
                border: 0,
                background: "transparent",
                cursor: "pointer",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                fontFamily: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: auto ? t.accentSoft : t.lineSoft,
                    color: auto ? t.accent : t.muted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                  }}
                >
                  <I.refresh size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>
                    Agendamento automático
                  </div>
                  <div style={{ fontSize: 11, color: t.muted, marginTop: 1, lineHeight: 1.3 }}>
                    {auto ? (
                      <span>
                        <span style={{ color: t.success, fontWeight: 700 }}>● Ativo</span> · 14 dias
                        · 19:33 · a cada 15min
                      </span>
                    ) : (
                      <span>Desativado · clique pra configurar</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
                {/* iOS toggle */}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setAuto(!auto);
                  }}
                  style={{
                    display: "inline-block",
                    cursor: "pointer",
                    width: 40,
                    height: 24,
                    borderRadius: 99,
                    background: auto ? t.success : t.line,
                    position: "relative",
                    transition: "background .15s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: auto ? 18 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: 99,
                      background: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      transition: "left .15s",
                    }}
                  />
                </span>
                <I.chevronDown
                  size={16}
                  color={t.muted}
                  style={{
                    transition: "transform .2s",
                    transform: autoOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </div>
            </button>

            {autoOpen && auto && (
              <div
                style={{
                  padding: "4px 14px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  borderTop: `1px solid ${t.lineSoft}`,
                  marginTop: 0,
                }}
              >
                <div style={{ paddingTop: 12 }} />
                <Field
                  t={t}
                  label="Antecedência"
                  hint="Cria viagens com 14 dias de antecedência"
                  value="14 dias"
                />
                <Field
                  t={t}
                  label="Horário de criação diária"
                  hint="Brasília · sistema gera as próximas viagens"
                  value="19:33"
                  icon={I.clock}
                />
                <Field
                  t={t}
                  label="Verificação de cancelamento"
                  hint="Recomendado: a cada 15 minutos"
                  value="A cada 15 min"
                />
              </div>
            )}
            {autoOpen && !auto && (
              <div
                style={{
                  padding: "14px",
                  borderTop: `1px solid ${t.lineSoft}`,
                  fontSize: 12,
                  color: t.muted,
                  lineHeight: 1.5,
                }}
              >
                Ative o agendamento automático no toggle acima pra criar viagens recorrentes a
                partir dos seus templates e cancelar viagens sem inscritos suficientes.
              </div>
            )}
          </Card>

          {/* Company info */}
          <Card t={t}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: t.accentSoft,
                    color: t.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: -0.5,
                  }}
                >
                  JR
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: t.ink, letterSpacing: -0.3 }}>
                    JRegu's
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: t.muted,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    /jregu-s
                  </div>
                </div>
              </div>
              <button
                style={{
                  border: `1px solid ${t.line}`,
                  background: t.surface,
                  padding: "6px 12px",
                  borderRadius: 99,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.ink2,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <I.pencil size={12} /> Editar
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <InfoRow t={t} icon={I.hash} label="CNPJ" value="12.345.678/JR00-12" />
              <InfoRow t={t} icon={I.mail} label="E-mail" value="jregus@email.com" />
              <InfoRow t={t} icon={I.phone} label="Telefone" value="(86) 96996-9696" />
              <InfoRow t={t} icon={I.pin} label="Endereço" value="Rua dos Bobos, 9" />
              <InfoRow
                t={t}
                icon={I.bolt}
                label="Status"
                value={
                  <span
                    style={{
                      color: t.success,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      style={{ width: 6, height: 6, borderRadius: 99, background: t.success }}
                    />{" "}
                    Ativa
                  </span>
                }
                last
              />
            </div>
          </Card>

          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Card t={t} style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <I.car size={20} color={t.ink2} />
                <I.chevron size={14} color={t.muted} />
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: t.ink,
                  letterSpacing: -1,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                1
              </div>
              <div style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>
                Veículo cadastrado
              </div>
            </Card>
            <Card t={t} style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <I.users size={20} color={t.ink2} />
                <I.chevron size={14} color={t.muted} />
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: t.ink,
                  letterSpacing: -1,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                1
              </div>
              <div style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>Motorista ativo</div>
            </Card>
          </div>
        </div>
      </Scroll>
    </Phone>
  );
}

function Field({ t, label, hint, value, icon: Ic = null }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: t.ink2,
          fontWeight: 700,
          marginBottom: 5,
          letterSpacing: 0.2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          padding: "10px 12px",
          background: t.surface2,
          border: `1px solid ${t.line}`,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: t.ink,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {value}
        </div>
        {Ic ? <Ic size={14} color={t.muted} /> : <I.chevronDown size={14} color={t.muted} />}
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: t.muted, marginTop: 4, lineHeight: 1.4 }}>{hint}</div>
      )}
    </div>
  );
}

function InfoRow({ t, icon: Ic, label, value, last }) {
  return (
    <div
      style={{
        padding: "10px 0",
        borderBottom: last ? "none" : `1px solid ${t.lineSoft}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Ic size={15} color={t.muted} />
      <div
        style={{
          fontSize: 11,
          color: t.muted,
          fontWeight: 600,
          width: 70,
          letterSpacing: 0.2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: t.ink,
          fontWeight: 600,
          marginLeft: "auto",
          textAlign: "right",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN — Perfil
// ============================================================================

function ScreenPerfil({ t }) {
  return (
    <Phone t={t} label="04 Perfil">
      <TopBar title="Perfil" t={t} />
      <Scroll>
        <div
          style={{ padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Profile header */}
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.line}`,
              borderRadius: 18,
              padding: 18,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* subtle gradient backdrop */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(60% 70% at 50% 0%, ${t.accentSoft} 0%, transparent 70%)`,
                opacity: 0.7,
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 99,
                  margin: "0 auto 12px",
                  background: t.ink,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  border: `3px solid ${t.surface}`,
                  boxShadow: `0 4px 16px ${t.accentSoft}`,
                }}
              >
                JR
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.ink, letterSpacing: -0.5 }}>
                Jacintos Regus
              </div>
              <div style={{ fontSize: 13, color: t.muted, fontWeight: 500, marginTop: 2 }}>
                jacinto@email.com
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
                <button
                  style={{
                    background: t.ink,
                    color: "#fff",
                    border: 0,
                    padding: "8px 16px",
                    borderRadius: 99,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: "inherit",
                  }}
                >
                  <I.pencil size={12} /> Editar perfil
                </button>
                <button
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.line}`,
                    color: t.ink2,
                    padding: "8px 14px",
                    borderRadius: 99,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "inherit",
                  }}
                >
                  Compartilhar
                </button>
              </div>
            </div>
          </div>

          {/* Info block */}
          <Card t={t} style={{ padding: 4 }}>
            <InfoRow2 t={t} icon={I.user} label="Nome" value="Jacintos Regus" />
            <InfoRow2 t={t} icon={I.mail} label="E-mail" value="jacinto@email.com" last />
          </Card>

          {/* Trabalhar como motorista */}
          <div
            style={{
              background: t.accentSoft,
              border: `1px solid ${t.accent}22`,
              borderRadius: 14,
              padding: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: t.accent,
                  color: t.accentInk,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                <I.id size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>
                  Trabalhar como motorista
                </div>
                <div style={{ fontSize: 12, color: t.ink2, lineHeight: 1.45, marginTop: 4 }}>
                  Para motoristas que vão trabalhar para uma empresa cadastrada no sistema.
                </div>
              </div>
            </div>
            <button
              style={{
                width: "100%",
                marginTop: 14,
                background: t.ink,
                color: "#fff",
                border: 0,
                padding: "12px",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              Ativar perfil de motorista <I.arrowRight size={14} />
            </button>
          </div>

          {/* Conta */}
          <div>
            <div
              style={{
                fontSize: 11,
                color: t.muted,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                marginBottom: 8,
                padding: "0 4px",
              }}
            >
              Conta
            </div>
            <Card t={t} style={{ padding: 4 }}>
              <Action
                t={t}
                icon={I.lock}
                label="Alterar senha"
                hint="Última alteração há 32 dias"
              />
              <Action t={t} icon={I.bolt} label="Notificações" hint="Push, e-mail, SMS" />
              <Action
                t={t}
                icon={I.alert}
                label="Privacidade & dados"
                hint="Exportar, excluir conta"
                last
              />
            </Card>
          </div>

          {/* Logout */}
          <button
            style={{
              background: t.surface,
              border: `1px solid ${t.dangerSoft}`,
              color: t.danger,
              padding: "14px",
              borderRadius: 14,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <I.logout size={16} /> Sair da conta
          </button>

          <div
            style={{
              textAlign: "center",
              color: t.muted,
              fontSize: 10,
              marginTop: 4,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            v 2.4.1 · build 2026.05
          </div>
        </div>
      </Scroll>
    </Phone>
  );
}

function InfoRow2({ t, icon: Ic, label, value, last }) {
  return (
    <div
      style={{
        padding: "12px",
        borderBottom: last ? "none" : `1px solid ${t.lineSoft}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: t.surface2,
          color: t.ink2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        <Ic size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            color: t.muted,
            fontWeight: 600,
            letterSpacing: 0.2,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 14, color: t.ink, fontWeight: 600, marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function Action({ t, icon: Ic, label, hint, last }) {
  return (
    <button
      style={{
        width: "100%",
        textAlign: "left",
        border: 0,
        background: "transparent",
        cursor: "pointer",
        padding: "12px",
        borderBottom: last ? "none" : `1px solid ${t.lineSoft}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: t.surface2,
          color: t.ink2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        <Ic size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: t.ink, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>{hint}</div>
      </div>
      <I.chevron size={16} color={t.muted} />
    </button>
  );
}

// ============================================================================
// Phone with interactive bottom nav
// ============================================================================

function InteractivePhone({ t, defaultScreen = "dashboard" }) {
  const [screen, setScreen] = React.useState(defaultScreen);
  const Report = window.ScreenDashboardReport;
  const screens = {
    dashboard: <ScreenDashboard t={t} onOpenReport={() => setScreen("report")} />,
    report: Report ? <Report t={t} /> : <ScreenDashboard t={t} />,
    viagens: <ScreenViagens t={t} />,
    templates: <ScreenTemplates t={t} />,
    empresa: <ScreenEmpresa t={t} />,
    perfil: <ScreenPerfil t={t} />,
  };
  return (
    <Phone t={t} label={`Interactive · ${screen}`}>
      {/* render selected screen but strip its phone wrapper */}
      <div style={{ position: "absolute", inset: 0 }}>{screens[screen]}</div>
      <BottomNav active={screen === "report" ? "dashboard" : screen} onChange={setScreen} t={t} />
    </Phone>
  );
}

// Lightweight Templates screen for completeness (interactive only)
function ScreenTemplates({ t }) {
  return (
    <Phone t={t} label="05 Templates">
      <TopBar
        title="Templates"
        t={t}
        action={
          <button
            style={{
              background: t.accent,
              color: t.accentInk,
              border: 0,
              padding: "7px 12px",
              borderRadius: 99,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "inherit",
            }}
          >
            <I.plus size={14} stroke={2.4} /> Novo
          </button>
        }
      />
      <Scroll>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { name: "Campo Maior → Piripiri", schedule: "Diário · 20:00", total: 30, active: true },
            { name: "Piripiri → Campo Maior", schedule: "Diário · 06:30", total: 30, active: true },
            {
              name: "Especial fim-de-semana",
              schedule: "Sex/Sáb · 22:00",
              total: 45,
              active: false,
            },
          ].map((tpl, i) => (
            <Card key={i} t={t} style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>
                    {tpl.name}
                  </div>
                  <div style={{ fontSize: 12, color: t.muted, marginTop: 3 }}>{tpl.schedule}</div>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 99,
                    background: tpl.active ? t.successSoft : t.lineSoft,
                    color: tpl.active ? t.success : t.muted,
                    letterSpacing: 0.3,
                  }}
                >
                  {tpl.active ? "ATIVO" : "PAUSADO"}
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: t.ink2,
                  fontSize: 12,
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <I.users size={13} /> {tpl.total} vagas
                </span>
                <span style={{ width: 3, height: 3, borderRadius: 99, background: t.muted }} />
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <I.bus size={13} /> Akinuku
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Scroll>
    </Phone>
  );
}

// Export everything
Object.assign(window, {
  PALETTES,
  Icon,
  I,
  StatusPill,
  Route,
  RouteVisual,
  BottomNav,
  TopBar,
  Card,
  Bar,
  Phone,
  Scroll,
  Field,
  InfoRow,
  InfoRow2,
  Action,
  ScreenDashboard,
  ScreenViagens,
  ScreenEmpresa,
  ScreenPerfil,
  ScreenTemplates,
  InteractivePhone,
});
