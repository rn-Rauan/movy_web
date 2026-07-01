/* global React, Phone, TopBar, Scroll, Card, Bar, StatusPill, Route, I */

// ============================================================================
// viagens.jsx — Lista de viagens com filtros, busca e ordenação
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

Object.assign(window, { ScreenViagens });
