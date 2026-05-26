/* global React */

// ============================================================================
// shared.jsx — design tokens, icons & reusable shell primitives
// Used by every screen file. Load this BEFORE any screen-*.jsx.
// ============================================================================

// ----------------------------------------------------------------------------
// Design tokens (overridable via Tweaks)
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// Icons (inline SVG — 24/stroke)
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// Status pill
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// Route visual (labels above the dots — used in trip cards)
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// Bottom nav
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// Top bar
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// Reusable bits
// ----------------------------------------------------------------------------

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

// Export to window for cross-file access
Object.assign(window, {
  PALETTES,
  Icon,
  I,
  STATUS,
  StatusPill,
  Route,
  BottomNav,
  TopBar,
  Card,
  Bar,
  Phone,
  Scroll,
});
