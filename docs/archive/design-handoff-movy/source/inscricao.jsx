/* global React, I, Phone, Scroll, TopBar, PassengerNav, FormField */

// ============================================================================
// inscricao.jsx — Tela de inscrição numa viagem (formulário final)
// Acessada via "Inscrever-se" na tela de detalhe da viagem.
// ============================================================================

function ScreenInscricao({ t }) {
  const trip = {
    from: "Campo Maior",
    to: "Piripiri",
    date: "27/05",
    time: "17:00",
    company: "Akinuku",
    price: 35,
  };

  const stops = ["Rodoviária Central", "Posto Shell · BR-343", "Av. Getúlio Vargas, 1240"];
  const destStops = ["Terminal Central", "Praça da Bandeira", "Rotatória do Mercadinho"];
  const paymentMethods = [
    {
      id: "pix",
      label: "PIX",
      sub: "Aprovação na hora",
      icon: <I.bolt size={14} color={t.accent || "#c8553d"} />,
    },
    {
      id: "card",
      label: "Cartão de crédito",
      sub: "Até 3x sem juros",
      icon: <I.money size={14} />,
    },
    {
      id: "cash",
      label: "Dinheiro na viagem",
      sub: "Pague ao embarcar",
      icon: <I.money size={14} />,
    },
  ];

  return (
    <Phone t={t} label="W08 Inscrição — formulário">
      <TopBar title="Inscrição" t={t} back />

      <Scroll style={{ top: 51, bottom: 96 + 82 }}>
        <div style={{ padding: "14px 16px 24px" }}>
          {/* Stepper compacto */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <StepDot t={t} state="done" n={1} label="Viagem" />
            <div style={{ flex: 1, height: 1, background: t.accent }} />
            <StepDot t={t} state="active" n={2} label="Inscrição" />
            <div style={{ flex: 1, height: 1, background: t.line }} />
            <StepDot t={t} state="todo" n={3} label="Pagar" />
          </div>

          {/* Resumo da viagem */}
          <div
            style={{
              background: t.accentSoft,
              border: `1px solid ${t.accentSoft}`,
              borderRadius: 14,
              padding: 14,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: t.accent,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Viagem
            </div>
            <div
              style={{
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 17,
                fontWeight: 800,
                color: t.ink,
                letterSpacing: -0.3,
              }}
            >
              <span>{trip.from}</span>
              <I.arrowRight size={14} stroke={2.2} color={t.accent} />
              <span>{trip.to}</span>
            </div>
            <div
              style={{
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 12,
                color: t.ink2,
                fontWeight: 600,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <I.calendar size={12} /> {trip.date},{" "}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                  {trip.time}
                </span>
              </span>
              <span style={{ width: 3, height: 3, borderRadius: 99, background: t.muted }} />
              <span>{trip.company}</span>
            </div>
          </div>

          {/* Formulário */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FormField t={t} as="select" label="Tipo de viagem" placeholder="Escolha o tipo" />
            <FormField
              t={t}
              as="select"
              label="Parada de embarque"
              placeholder=""
              value={stops[0]}
              hint={`${stops.length} pontos disponíveis em Campo Maior`}
            />
            <FormField
              t={t}
              as="select"
              label="Parada de desembarque"
              placeholder=""
              value={destStops[0]}
              hint={`${destStops.length} pontos disponíveis em Piripiri`}
            />

            {/* Método de pagamento — radio visual */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: t.ink2,
                  letterSpacing: 0.1,
                  marginBottom: 8,
                }}
              >
                Método de pagamento
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {paymentMethods.map((m, i) => {
                  const selected = i === 0;
                  return (
                    <button
                      key={m.id}
                      style={{
                        textAlign: "left",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        background: selected ? t.accentSoft : t.surface,
                        border: `1.5px solid ${selected ? t.accent : t.line}`,
                        borderRadius: 12,
                        padding: "11px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          flex: "0 0 auto",
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: selected ? t.surface : t.surface2,
                          border: `1px solid ${t.line}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: selected ? t.accent : t.ink2,
                        }}
                      >
                        {m.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>{m.sub}</div>
                      </div>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 99,
                          border: `2px solid ${selected ? t.accent : t.line}`,
                          background: selected ? t.accent : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {selected && <I.check size={10} color={t.accentInk || "#fff"} stroke={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Scroll>

      {/* Sticky CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 82,
          left: 0,
          right: 0,
          background: t.surface,
          borderTop: `1px solid ${t.line}`,
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            fontSize: 12,
            color: t.ink2,
            fontWeight: 600,
          }}
        >
          <span>1 passageiro · PIX</span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              color: t.ink,
              fontSize: 14,
            }}
          >
            R$ {trip.price.toFixed(2).replace(".", ",")}
          </span>
        </div>
        <button
          style={{
            width: "100%",
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
          Confirmar inscrição <I.arrowRight size={14} stroke={2.2} />
        </button>
      </div>

      <PassengerNav active="explorar" t={t} />
    </Phone>
  );
}

function StepDot({ t, state, n, label }) {
  const styles = {
    done: { bg: t.accent, ink: t.accentInk || "#fff", ring: t.accent, labelColor: t.ink2 },
    active: { bg: t.ink, ink: t.surface, ring: t.ink, labelColor: t.ink },
    todo: { bg: t.surface, ink: t.muted, ring: t.line, labelColor: t.muted },
  }[state];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 99,
          background: styles.bg,
          color: styles.ink,
          border: `1.5px solid ${styles.ring}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {state === "done" ? <I.check size={11} stroke={3} /> : n}
      </div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: styles.labelColor,
          letterSpacing: 0.2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenInscricao });
