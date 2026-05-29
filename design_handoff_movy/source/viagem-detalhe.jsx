/* global React, I, Phone, Scroll, TopBar, PassengerNav, StatusPill */

// ============================================================================
// viagem-detalhe.jsx — Tela de detalhe da viagem (visão do passageiro)
// Mostra rota completa, horários, vagas, empresa, e CTA "Inscrever-se".
// ============================================================================

function ScreenViagemDetalhe({ t }) {
  const trip = {
    date: "Quarta, 27 de maio de 2026",
    status: "Agendada",
    from: "Campo Maior",
    fromAddr: "Rodoviária · Av. Getúlio Vargas",
    to: "Piripiri",
    toAddr: "Terminal Central · Praça da Bandeira",
    timeStart: "17:00",
    timeEnd: "18:00",
    duration: "~1h",
    vagas: 30,
    company: "Akinuku",
    rating: 4.9,
    driver: "Alessandro",
    price: 35,
  };

  return (
    <Phone t={t} label="W07 Detalhe da viagem">
      <TopBar
        title="Detalhes"
        t={t}
        back
        action={
          <button
            style={{
              border: `1px solid ${t.line}`,
              background: t.surface,
              color: t.ink,
              padding: "6px 12px",
              borderRadius: 99,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <I.share size={12} /> Compartilhar
          </button>
        }
      />

      <Scroll style={{ top: 51, bottom: 96 + 82 }}>
        <div style={{ padding: "16px 16px 24px" }}>
          {/* Hero card — saída em destaque */}
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.line}`,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: t.muted,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                  }}
                >
                  Saída
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 17,
                    fontWeight: 800,
                    color: t.ink,
                    letterSpacing: -0.4,
                    textWrap: "balance",
                  }}
                >
                  {trip.date}
                </div>
              </div>
              <StatusPill status={trip.status} t={t} />
            </div>

            {/* Rota com timeline vertical */}
            <div
              style={{ marginTop: 14, display: "grid", gridTemplateColumns: "20px 1fr", gap: 10 }}
            >
              {/* timeline */}
              <div style={{ position: "relative", paddingTop: 5 }}>
                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 99,
                    border: `2px solid ${t.ink}`,
                    background: t.surface,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 4,
                    top: 16,
                    bottom: 6,
                    borderLeft: `2px dashed ${t.line}`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    width: 9,
                    height: 9,
                    borderRadius: 99,
                    background: t.accent,
                  }}
                />
              </div>
              <div>
                <div style={{ paddingBottom: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.ink, letterSpacing: -0.3 }}>
                    {trip.from}
                  </div>
                  <div style={{ marginTop: 2, fontSize: 12, color: t.muted }}>{trip.fromAddr}</div>
                  <div
                    style={{
                      marginTop: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      color: t.ink2,
                      fontWeight: 700,
                    }}
                  >
                    <I.clock size={11} color={t.muted} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {trip.timeStart}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.ink, letterSpacing: -0.3 }}>
                    {trip.to}
                  </div>
                  <div style={{ marginTop: 2, fontSize: 12, color: t.muted }}>{trip.toAddr}</div>
                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        color: t.ink2,
                        fontWeight: 700,
                      }}
                    >
                      <I.clock size={11} color={t.muted} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {trip.timeEnd}
                      </span>
                    </span>
                    <span style={{ fontSize: 11, color: t.muted, fontWeight: 600 }}>
                      · chegada estimada
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadados */}
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: `1px dashed ${t.line}`,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 6,
              }}
            >
              {[
                { k: "Duração", v: trip.duration, icon: <I.clock size={13} color={t.muted} /> },
                {
                  k: "Vagas",
                  v: `${trip.vagas} livres`,
                  icon: <I.users size={13} color={t.muted} />,
                },
                {
                  k: "Preço",
                  v: `R$ ${trip.price}`,
                  icon: <I.money size={13} color={t.muted} />,
                  strong: true,
                },
              ].map((m, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      color: t.muted,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                    }}
                  >
                    {m.icon} {m.k}
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      fontSize: m.strong ? 16 : 13,
                      fontWeight: 800,
                      color: t.ink,
                      fontFamily: m.strong ? "'JetBrains Mono', monospace" : "inherit",
                      letterSpacing: -0.3,
                    }}
                  >
                    {m.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empresa */}
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.line}`,
              borderRadius: 14,
              padding: 14,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                flex: "0 0 auto",
                width: 42,
                height: 42,
                borderRadius: 12,
                background: t.surface2,
                border: `1px solid ${t.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <I.building size={20} color={t.ink} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>
                  {trip.company}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.ink2 }}>
                  <span style={{ color: t.warn }}>★</span> {trip.rating}
                </span>
              </div>
              <div style={{ marginTop: 1, fontSize: 11, color: t.muted }}>
                Motorista: {trip.driver}
              </div>
            </div>
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
              <I.chevron size={16} />
            </button>
          </div>

          {/* Termos rápidos */}
          <div
            style={{
              background: t.surface2,
              border: `1px solid ${t.lineSoft}`,
              borderRadius: 12,
              padding: 12,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <I.alert size={15} color={t.ink2} />
            <div style={{ fontSize: 11, color: t.ink2, lineHeight: 1.45 }}>
              Apresente-se 15 min antes da saída. Cancelamento gratuito até 2h antes — depois disso,
              sem reembolso.
            </div>
          </div>
        </div>
      </Scroll>

      {/* CTA fixo acima da nav */}
      <div
        style={{
          position: "absolute",
          bottom: 82,
          left: 0,
          right: 0,
          background: t.surface,
          borderTop: `1px solid ${t.line}`,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              color: t.muted,
              fontWeight: 700,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            Total
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: t.ink,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: -0.5,
              lineHeight: 1,
            }}
          >
            R$ {trip.price}
          </div>
        </div>
        <button
          style={{
            flex: 1,
            background: t.ink,
            color: t.surface,
            border: 0,
            padding: "13px 16px",
            borderRadius: 12,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Inscrever-se <I.arrowRight size={14} stroke={2.2} />
        </button>
      </div>

      <PassengerNav active="explorar" t={t} />
    </Phone>
  );
}

Object.assign(window, { ScreenViagemDetalhe });
