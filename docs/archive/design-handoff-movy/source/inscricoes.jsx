/* global React, I, Phone, Scroll, TopBar, PassengerNav */

// ============================================================================
// inscricoes.jsx — Minhas inscrições (viagens em que o passageiro se inscreveu)
// Filtros Todas / Ativas / Canceladas. Cards com data, rota, status.
// ============================================================================

function ScreenInscricoes({ t }) {
  const bookings = [
    {
      id: "INS-104",
      date: "27/05",
      time: "17:00",
      from: "campo maior",
      to: "piripiri",
      status: "Ativa",
      company: "Akinuku",
      price: 35,
    },
    {
      id: "INS-103",
      date: "24/05",
      time: "15:22",
      from: "campo maior",
      to: "piripiri",
      status: "Ativa",
      company: "Akinuku",
      price: 35,
    },
    {
      id: "INS-098",
      date: "22/05",
      time: "14:00",
      from: "campo maior",
      to: "piripiri",
      status: "Ativa",
      company: "Akinuku",
      price: 35,
    },
    {
      id: "INS-094",
      date: "20/05",
      time: "13:59",
      from: "campo maior",
      to: "piripiri",
      status: "Finalizada",
      company: "Akinuku",
      price: 35,
    },
    {
      id: "INS-088",
      date: "18/05",
      time: "13:56",
      from: "cervejão",
      to: "piripiri",
      status: "Cancelada",
      company: "Jacinto's",
      price: 40,
    },
  ];
  const filters = [
    { id: "todas", label: "Todas", n: bookings.length },
    { id: "ativas", label: "Ativas", n: bookings.filter((b) => b.status === "Ativa").length },
    {
      id: "finalizadas",
      label: "Finalizadas",
      n: bookings.filter((b) => b.status === "Finalizada").length,
    },
    {
      id: "canceladas",
      label: "Canceladas",
      n: bookings.filter((b) => b.status === "Cancelada").length,
    },
  ];

  return (
    <Phone t={t} label="W06 Minhas inscrições">
      <TopBar title="Minhas inscrições" t={t} />

      {/* Sticky search + filters */}
      <div
        style={{
          position: "sticky",
          top: 51,
          zIndex: 4,
          background: t.bg,
          borderBottom: `1px solid ${t.line}`,
          padding: "12px 16px 10px",
        }}
      >
        <div style={{ position: "relative", marginBottom: 10 }}>
          <I.search
            size={15}
            color={t.muted}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            placeholder="Buscar por origem, destino ou empresa"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px 10px 34px",
              borderRadius: 11,
              border: `1px solid ${t.line}`,
              background: t.surface,
              fontSize: 13,
              fontFamily: "inherit",
              color: t.ink,
              outline: "none",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 4,
            marginLeft: -16,
            paddingLeft: 16,
            marginRight: -16,
            paddingRight: 16,
          }}
        >
          {filters.map((s, i) => (
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
      </div>

      <Scroll style={{ top: 51 + 100, bottom: 78 }}>
        <div style={{ padding: "12px 16px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bookings.map((b, i) => (
              <BookingCard key={i} t={t} {...b} />
            ))}
          </div>
        </div>
      </Scroll>

      <PassengerNav active="inscricoes" t={t} />
    </Phone>
  );
}

function BookingCard({ t, id, date, time, from, to, status, company, price }) {
  const colorByStatus = {
    Ativa: { fg: t.ink, bg: t.ink, ink: t.surface },
    Finalizada: { fg: t.ink2, bg: t.lineSoft, ink: t.ink2 },
    Cancelada: { fg: t.danger, bg: t.dangerSoft, ink: t.danger },
  };
  const c = colorByStatus[status] || colorByStatus.Ativa;
  const isCancelled = status === "Cancelada";

  return (
    <button
      style={{
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "inherit",
        background: t.surface,
        border: `1px solid ${t.line}`,
        borderRadius: 14,
        padding: 14,
        width: "100%",
        opacity: isCancelled ? 0.7 : 1,
      }}
    >
      {/* Top: data + status + chevron */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: t.ink }}>
          <I.calendar size={14} color={t.muted} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: -0.2,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {date}, {time}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              background: status === "Ativa" ? t.ink : c.bg,
              color: status === "Ativa" ? t.surface : c.ink,
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: 99,
              textDecoration: isCancelled ? "line-through" : "none",
            }}
          >
            {status}
          </span>
          <I.chevron size={14} color={t.muted} />
        </div>
      </div>

      {/* Rota */}
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          color: t.ink2,
        }}
      >
        <span style={{ fontWeight: 700, color: t.ink }}>{from}</span>
        <I.arrowRight size={13} color={t.muted} stroke={2} />
        <span style={{ fontWeight: 700, color: t.ink }}>{to}</span>
      </div>

      {/* Linha inferior — empresa + id + preço */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: `1px dashed ${t.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          color: t.muted,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, color: t.ink2 }}>{company}</span>
          <span style={{ width: 3, height: 3, borderRadius: 99, background: t.muted }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{id}</span>
        </div>
        <span style={{ fontWeight: 700, color: t.ink, fontFamily: "'JetBrains Mono', monospace" }}>
          R$ {price}
        </span>
      </div>
    </button>
  );
}

Object.assign(window, { ScreenInscricoes });
