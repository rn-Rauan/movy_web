/* global React, Phone, TopBar, Scroll, Card, Bar, StatusPill, Route, BottomNav,
   I, ScreenViagens, ScreenTemplates */

// ============================================================================
// SCREEN — Detalhe da viagem
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

// ============================================================================
// Modal shell (bottom sheet on top of dimmed background)
// ============================================================================

function ModalPhone({ t, label, behind, title, children, ctaLabel, ctaIcon, sheetTop = 90 }) {
  return (
    <Phone t={t} label={label}>
      {/* Background screen */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0 }}>{behind}</div>
        <div style={{ position: "absolute", inset: 0, background: "rgba(15,15,20,0.42)" }} />
      </div>

      {/* Bottom sheet */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: sheetTop,
          bottom: 0,
          background: t.surface,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          boxShadow: "0 -8px 30px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Drag handle */}
        <div style={{ padding: "10px 0 4px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 38, height: 4, borderRadius: 99, background: t.line }} />
        </div>

        {/* Header */}
        <div
          style={{
            padding: "6px 18px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${t.lineSoft}`,
          }}
        >
          <h2
            style={{ margin: 0, fontSize: 17, fontWeight: 800, color: t.ink, letterSpacing: -0.3 }}
          >
            {title}
          </h2>
          <button
            style={{
              width: 28,
              height: 28,
              borderRadius: 99,
              border: 0,
              background: t.lineSoft,
              color: t.ink2,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <I.x size={14} stroke={2.4} />
          </button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 18px 12px" }}>{children}</div>

        {/* CTA */}
        {ctaLabel && (
          <div
            style={{
              padding: "10px 18px 16px",
              borderTop: `1px solid ${t.lineSoft}`,
              background: t.surface,
            }}
          >
            <button
              style={{
                width: "100%",
                border: 0,
                cursor: "pointer",
                background: t.ink,
                color: "#fff",
                padding: "13px",
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
              {ctaIcon}
              {ctaLabel}
            </button>
          </div>
        )}
      </div>
    </Phone>
  );
}

// Form atoms
function FormLabel({ t, children, optional, hint }) {
  return (
    <div style={{ marginBottom: 6, display: "flex", alignItems: "baseline", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: t.ink, letterSpacing: -0.1 }}>
        {children}
      </label>
      {optional && <span style={{ fontSize: 10, color: t.muted, fontWeight: 600 }}>opcional</span>}
      {hint && <span style={{ fontSize: 11, color: t.muted, marginLeft: "auto" }}>{hint}</span>}
    </div>
  );
}

function Input({ t, value, placeholder, mono, prefix, suffix, type = "text" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: t.surface,
        border: `1px solid ${t.line}`,
        borderRadius: 10,
        padding: "0 12px",
        fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
      }}
    >
      {prefix && <span style={{ color: t.muted, fontSize: 13, marginRight: 6 }}>{prefix}</span>}
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: 0,
          outline: "none",
          background: "transparent",
          padding: "11px 0",
          fontSize: 13,
          color: t.ink,
          fontWeight: 600,
          fontFamily: "inherit",
        }}
      />
      {suffix && <span style={{ color: t.muted, fontSize: 13, marginLeft: 6 }}>{suffix}</span>}
    </div>
  );
}

function Select({ t, value, placeholder, leading }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: t.surface,
        border: `1px solid ${t.line}`,
        borderRadius: 10,
        padding: "11px 12px",
        cursor: "pointer",
      }}
    >
      {leading}
      <div
        style={{
          flex: 1,
          fontSize: 13,
          color: value ? t.ink : t.muted,
          fontWeight: value ? 700 : 500,
        }}
      >
        {value || placeholder}
      </div>
      <I.chevronDown size={14} color={t.muted} />
    </div>
  );
}

function Hint({ t, children }) {
  return (
    <div style={{ fontSize: 11, color: t.muted, marginTop: 5, lineHeight: 1.4 }}>{children}</div>
  );
}

function Check({ t, label, checked, sub }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
      <div
        style={{
          flex: "0 0 auto",
          width: 18,
          height: 18,
          borderRadius: 5,
          border: `1.8px solid ${checked ? t.ink : t.line}`,
          background: checked ? t.ink : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          marginTop: 1,
        }}
      >
        {checked && <I.check size={11} stroke={3} />}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 11, color: t.muted, marginTop: 1, lineHeight: 1.4 }}>{sub}</div>
        )}
      </div>
    </label>
  );
}

// ============================================================================
// MODAL — Nova viagem
// ============================================================================

function ModalNewTrip({ t }) {
  return (
    <ModalPhone
      t={t}
      label="06 Nova viagem (modal)"
      behind={<ScreenViagens t={t} />}
      title="Nova viagem"
      ctaLabel="Criar viagem"
      ctaIcon={<I.plus size={15} stroke={2.4} />}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <FormLabel t={t}>Template de rota</FormLabel>
          <Select
            t={t}
            placeholder="Selecione um template…"
            leading={<I.list size={14} color={t.muted} />}
          />
        </div>

        <div>
          <FormLabel t={t} hint="O horário vem do template">
            Data de partida
          </FormLabel>
          <Input t={t} placeholder="dd/mm/aaaa" mono />
        </div>

        <div>
          <FormLabel t={t}>Capacidade total</FormLabel>
          <Input t={t} placeholder="40" suffix="assentos" mono />
        </div>

        <div>
          <FormLabel t={t}>Status inicial</FormLabel>
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 3,
              background: t.surface2,
              border: `1px solid ${t.line}`,
              borderRadius: 10,
            }}
          >
            {["Rascunho", "Agendada"].map((s, i) => (
              <button
                key={s}
                style={{
                  flex: 1,
                  border: 0,
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: 7,
                  background: i === 0 ? t.surface : "transparent",
                  boxShadow: i === 0 ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  fontSize: 12,
                  fontWeight: i === 0 ? 800 : 500,
                  color: i === 0 ? t.ink : t.muted,
                  fontFamily: "inherit",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <Hint t={t}>Rascunho não aparece pra passageiros até você publicar.</Hint>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <FormLabel t={t}>Motorista</FormLabel>
            <Select
              t={t}
              placeholder="Sem motorista"
              leading={<I.user size={14} color={t.muted} />}
            />
          </div>
          <div>
            <FormLabel t={t}>Veículo</FormLabel>
            <Select t={t} placeholder="Sem veículo" leading={<I.bus size={14} color={t.muted} />} />
          </div>
        </div>

        <div
          style={{
            background: t.accentSoft,
            border: `1px solid ${t.accent}22`,
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <I.alert size={14} color={t.accent} />
          <div style={{ fontSize: 11, color: t.ink2, lineHeight: 1.45 }}>
            Sem motorista e veículo, a viagem fica como <strong>Rascunho</strong> até você
            completar.
          </div>
        </div>
      </div>
    </ModalPhone>
  );
}

// ============================================================================
// MODAL — Novo template
// ============================================================================

function ModalNewTemplate({ t }) {
  return (
    <ModalPhone
      t={t}
      label="07 Novo template (modal)"
      behind={<ScreenTemplates t={t} />}
      title="Novo template"
      ctaLabel="Criar template"
      ctaIcon={<I.plus size={15} stroke={2.4} />}
      sheetTop={56}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <FormLabel t={t}>Origem</FormLabel>
            <Input t={t} placeholder="Terminal" />
          </div>
          <div>
            <FormLabel t={t}>Destino</FormLabel>
            <Input t={t} placeholder="Universidade" />
          </div>
        </div>

        <div>
          <FormLabel t={t}>Turno</FormLabel>
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 3,
              background: t.surface2,
              border: `1px solid ${t.line}`,
              borderRadius: 10,
            }}
          >
            {["Manhã", "Tarde", "Noite", "Madrug."].map((s, i) => (
              <button
                key={s}
                style={{
                  flex: 1,
                  border: 0,
                  cursor: "pointer",
                  padding: "7px 4px",
                  borderRadius: 7,
                  background: i === 0 ? t.surface : "transparent",
                  boxShadow: i === 0 ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  fontSize: 11,
                  fontWeight: i === 0 ? 800 : 500,
                  color: i === 0 ? t.ink : t.muted,
                  fontFamily: "inherit",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <FormLabel t={t}>Partida</FormLabel>
            <Input t={t} placeholder="--:--" mono suffix={<I.clock size={13} color={t.muted} />} />
          </div>
          <div>
            <FormLabel t={t}>Chegada</FormLabel>
            <Input t={t} placeholder="--:--" mono suffix={<I.clock size={13} color={t.muted} />} />
          </div>
        </div>
        <Hint t={t}>
          Horários em Brasília (UTC−3). Se a viagem cruza meia-noite, a chegada pode ser anterior à
          partida.
        </Hint>

        <div>
          <FormLabel t={t}>Capacidade padrão</FormLabel>
          <Input t={t} placeholder="20" suffix="assentos" mono />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <FormLabel t={t}>Motorista padrão</FormLabel>
            <Select t={t} placeholder="Nenhum" leading={<I.user size={14} color={t.muted} />} />
          </div>
          <div>
            <FormLabel t={t}>Veículo padrão</FormLabel>
            <Select t={t} placeholder="Nenhum" leading={<I.bus size={14} color={t.muted} />} />
          </div>
        </div>
        <Hint t={t}>Defina os dois pra publicar viagens automaticamente sem revisão.</Hint>

        {/* Paradas */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 8,
            }}
          >
            <FormLabel t={t}>
              Paradas <span style={{ color: t.muted, fontWeight: 500 }}>· mín. 2</span>
            </FormLabel>
            <button
              style={{
                border: 0,
                background: "transparent",
                color: t.accent,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontFamily: "inherit",
              }}
            >
              <I.plus size={13} stroke={2.4} /> Adicionar
            </button>
          </div>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
            <StopRow t={t} idx={1} placeholder="Ex: Rodoviária" />
            <StopRow t={t} idx={2} placeholder="Ex: Centro" />
            <StopRow t={t} idx={3} placeholder="Ex: Universidade" />
          </div>
        </div>

        {/* Preços */}
        <div>
          <FormLabel t={t}>Preços</FormLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <PriceCol t={t} label="Ida" value="12,00" />
            <PriceCol t={t} label="Volta" value="12,00" />
            <PriceCol t={t} label="Ida + volta" value="20,00" accent />
          </div>
        </div>

        {/* Options */}
        <div
          style={{
            background: t.surface2,
            border: `1px solid ${t.line}`,
            borderRadius: 12,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Check
            t={t}
            checked={true}
            label="Visível no marketplace"
            sub="Apareça na busca pública pra novos passageiros."
          />
          <Check
            t={t}
            checked={true}
            label="Recorrente"
            sub="O agendamento automático gera essas viagens periodicamente."
          />
          <Check
            t={t}
            checked={false}
            label="Auto-cancelar se receita mínima não for atingida"
            sub="Cancela viagens com baixa inscrição até 30min antes da partida."
          />
        </div>
      </div>
    </ModalPhone>
  );
}

function StopRow({ t, idx, placeholder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 99,
          flex: "0 0 auto",
          background: t.lineSoft,
          color: t.ink2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {idx}
      </div>
      <div style={{ flex: 1 }}>
        <Input t={t} placeholder={placeholder} />
      </div>
      <button
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          flex: "0 0 auto",
          border: `1px solid ${t.line}`,
          background: t.surface,
          color: t.muted,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <I.x size={13} />
      </button>
    </div>
  );
}

function PriceCol({ t, label, value, accent }) {
  return (
    <div
      style={{
        background: accent ? t.accentSoft : t.surface2,
        border: `1px solid ${accent ? t.accent + "33" : t.line}`,
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: accent ? t.accent : t.muted,
          fontWeight: 700,
          letterSpacing: 0.3,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: t.muted, fontWeight: 700 }}>R$</span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: t.ink,
            letterSpacing: -0.5,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenTripDetail,
  ModalNewTrip,
  ModalNewTemplate,
  ModalPhone,
  Timeline,
  SectionLabel,
});
