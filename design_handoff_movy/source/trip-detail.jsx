/* global React, Phone, TopBar, Scroll, Card, Bar, StatusPill, I */

// ============================================================================
// trip-detail.jsx — Detalhe completo de uma viagem (timeline, motorista, etc)
// ============================================================================

function ScreenTripDetail({ t }) {
  const trip = {
    date: "22/05",
    dateLong: "Quinta · 22 de maio",
    departure: "20:00",
    arrival: "21:00",
    from: "Campo Maior",
    to: "Piripiri",
    booked: 0,
    total: 30,
    status: "Agendada",
    paradas: [
      { name: "Rodoviária", sub: "Embarque principal" },
      { name: "Parada Centro", sub: "Praça da Bandeira" },
      { name: "Faculdade Piripiri", sub: "Portaria sul" },
    ],
    driver: { name: "Akinuku", cnh: "123456789", cat: "A, D", val: "29/10/2026", active: true },
    vehicle: { name: "Onibus Jacintu\u2019s amarelo", plate: "ABC1D23", seats: 30 },
  };

  return (
    <Phone t={t} label="05 Detalhe da viagem">
      <TopBar
        title="Detalhe da viagem"
        t={t}
        back
        action={
          <button
            style={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              padding: 4,
              color: t.ink2,
            }}
          >
            <I.share size={18} />
          </button>
        }
      />
      <Scroll style={{ bottom: 90 }}>
        <div
          style={{ padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}
        >
          {/* Hero */}
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.line}`,
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
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: t.muted,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                  }}
                >
                  {trip.dateLong}
                </div>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: t.ink,
                    letterSpacing: -1.5,
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: 2,
                    lineHeight: 1,
                  }}
                >
                  {trip.departure}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: t.muted,
                    marginTop: 4,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <I.clock size={11} /> Chega às{" "}
                  <span
                    style={{
                      color: t.ink2,
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {trip.arrival}
                  </span>
                </div>
              </div>
              <StatusPill status={trip.status} t={t} />
            </div>

            {/* Visual timeline */}
            <Timeline
              t={t}
              from={trip.from}
              to={trip.to}
              departure={trip.departure}
              arrival={trip.arrival}
              paradas={trip.paradas}
            />

            {/* Lugares */}
            <div
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: `1px dashed ${t.line}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <I.users size={16} color={t.ink2} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 5,
                  }}
                >
                  <div style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>Ocupação</div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: t.ink,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {trip.booked}
                    <span style={{ color: t.muted, fontWeight: 500 }}> / {trip.total} lugares</span>
                  </div>
                </div>
                <Bar value={trip.booked} max={trip.total} t={t} color={t.accent} />
              </div>
            </div>
          </div>

          {/* Motorista */}
          <Card t={t}>
            <SectionLabel t={t} icon={I.id}>
              Motorista
            </SectionLabel>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0 4px",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: t.accentSoft,
                  color: t.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: -0.5,
                }}
              >
                A
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>
                    {trip.driver.name}
                  </div>
                  {trip.driver.active && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 7px",
                        borderRadius: 99,
                        background: t.successSoft,
                        color: t.success,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 0.2,
                      }}
                    >
                      <span
                        style={{ width: 5, height: 5, borderRadius: 99, background: t.success }}
                      />{" "}
                      Ativo
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: t.muted,
                    marginTop: 2,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  CNH {trip.driver.cnh} · Cat. {trip.driver.cat} · Val. {trip.driver.val}
                </div>
              </div>
              <button
                style={{
                  border: `1px solid ${t.line}`,
                  background: t.surface,
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.ink2,
                }}
              >
                <I.swap size={14} />
              </button>
            </div>
          </Card>

          {/* Veículo */}
          <Card t={t}>
            <SectionLabel t={t} icon={I.bus}>
              Veículo
            </SectionLabel>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0 4px",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#fef3c7",
                  color: "#92580a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <I.bus size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>
                  {trip.vehicle.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: t.muted,
                    marginTop: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      background: t.lineSoft,
                      color: t.ink2,
                      padding: "2px 6px",
                      borderRadius: 4,
                      letterSpacing: 0.5,
                    }}
                  >
                    {trip.vehicle.plate}
                  </span>
                  <span>{trip.vehicle.seats} assentos</span>
                </div>
              </div>
              <button
                style={{
                  border: `1px solid ${t.line}`,
                  background: t.surface,
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.ink2,
                }}
              >
                <I.swap size={14} />
              </button>
            </div>
          </Card>

          {/* Inscrições */}
          <Card t={t}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <SectionLabel t={t} icon={I.ticket} compact>
                Inscrições
              </SectionLabel>
              <span
                style={{
                  fontSize: 11,
                  color: t.muted,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                0 / {trip.total}
              </span>
            </div>
            <div
              style={{
                background: t.surface2,
                border: `1px dashed ${t.line}`,
                borderRadius: 10,
                padding: "20px 16px",
                textAlign: "center",
              }}
            >
              <I.users size={22} color={t.muted} />
              <div style={{ fontSize: 13, color: t.ink2, fontWeight: 700, marginTop: 6 }}>
                Nenhum passageiro ainda
              </div>
              <div style={{ fontSize: 11, color: t.muted, marginTop: 2, lineHeight: 1.4 }}>
                Compartilhe o link público pra começar a receber inscrições.
              </div>
            </div>
          </Card>
        </div>
      </Scroll>

      {/* Sticky action bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: t.surface,
          borderTop: `1px solid ${t.line}`,
          padding: "10px 16px 14px",
          display: "flex",
          gap: 8,
        }}
      >
        <button
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            flex: "0 0 auto",
            border: `1px solid ${t.dangerSoft}`,
            background: t.surface,
            color: t.danger,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <I.x size={18} stroke={2} />
        </button>
        <button
          style={{
            flex: 1,
            border: 0,
            cursor: "pointer",
            background: t.ink,
            color: "#fff",
            padding: "12px",
            borderRadius: 12,
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: -0.2,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <I.check size={16} stroke={2.4} /> Confirmar viagem
        </button>
      </div>
    </Phone>
  );
}

// ----------------------------------------------------------------------------
// Local helpers (used only by Trip Detail)
// ----------------------------------------------------------------------------

function SectionLabel({ t, icon: Ic, children, compact }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        color: t.ink2,
        marginBottom: compact ? 0 : 4,
      }}
    >
      <Ic size={14} />
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: t.muted,
        }}
      >
        {children}
      </span>
    </div>
  );
}

function Timeline({ t, from, to, departure, arrival, paradas }) {
  const all = [
    { name: from, sub: `Partida · ${departure}`, kind: "start" },
    ...paradas.map((p) => ({ ...p, kind: "stop" })),
    { name: to, sub: `Chegada · ${arrival}`, kind: "end" },
  ];
  return (
    <div style={{ position: "relative" }}>
      {/* Vertical line */}
      <div
        style={{
          position: "absolute",
          left: 9,
          top: 10,
          bottom: 10,
          width: 0,
          borderLeft: `2px dashed ${t.line}`,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {all.map((p, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, position: "relative" }}
          >
            <div
              style={{
                width: 20,
                flex: "0 0 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 2,
              }}
            >
              {p.kind === "start" && (
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 99,
                    border: `2.5px solid ${t.ink}`,
                    background: t.surface,
                  }}
                />
              )}
              {p.kind === "end" && (
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 99,
                    background: t.accent,
                    boxShadow: `0 0 0 3px ${t.accentSoft}`,
                  }}
                />
              )}
              {p.kind === "stop" && (
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 99,
                    background: t.muted,
                    boxShadow: `0 0 0 3px ${t.surface}`,
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 0 }}>
              <div
                style={{
                  fontSize: p.kind === "stop" ? 13 : 15,
                  fontWeight: p.kind === "stop" ? 600 : 800,
                  color: t.ink,
                  letterSpacing: -0.2,
                  lineHeight: 1.15,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: t.muted,
                  marginTop: 1,
                  fontFamily: p.kind === "stop" ? "inherit" : "'JetBrains Mono', monospace",
                }}
              >
                {p.sub}
              </div>
            </div>
            {p.kind === "start" && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: t.lineSoft,
                  color: t.ink2,
                  letterSpacing: 0.3,
                  alignSelf: "center",
                }}
              >
                ORIGEM
              </span>
            )}
            {p.kind === "end" && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: t.accentSoft,
                  color: t.accent,
                  letterSpacing: 0.3,
                  alignSelf: "center",
                }}
              >
                DESTINO
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenTripDetail, Timeline, SectionLabel });
