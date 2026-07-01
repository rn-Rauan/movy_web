/* global React, I, Phone, Scroll, TopBar, PassengerNav */

// ============================================================================
// explorar.jsx — Tela "Explorar" do passageiro (lista de viagens disponíveis)
// Substitui a antiga "Viagens" pública. Filtros, busca e cards de viagem.
// ============================================================================

function ScreenExplorar({ t }) {
  const trips = [
    {
      from: "Campo Maior",
      to: "Piripiri",
      date: "27/05",
      time: "17:00",
      vagas: 8,
      total: 30,
      price: 35,
      company: "Akinuku",
    },
    {
      from: "Teresina",
      to: "Parnaíba",
      date: "27/05",
      time: "19:30",
      vagas: 4,
      total: 40,
      price: 65,
      company: "Vai e Vem",
    },
    {
      from: "Campo Maior",
      to: "Teresina",
      date: "28/05",
      time: "06:00",
      vagas: 22,
      total: 30,
      price: 40,
      company: "Akinuku",
    },
    {
      from: "Piripiri",
      to: "Campo Maior",
      date: "28/05",
      time: "18:00",
      vagas: 14,
      total: 30,
      price: 35,
      company: "Akinuku",
    },
    {
      from: "Teresina",
      to: "Campo Maior",
      date: "29/05",
      time: "07:30",
      vagas: 1,
      total: 30,
      price: 42,
      company: "Norte Express",
    },
  ];

  return (
    <Phone t={t} label="W04 Explorar — viagens">
      <TopBar title="Explorar" t={t} />

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
            placeholder="Origem, destino ou empresa"
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
        <ExploreSegment t={t} options={["Qualquer", "Hoje", "Amanhã", "Esta sem."]} selected={0} />
        <div style={{ height: 6 }} />
        <ExploreSegment t={t} options={["Todos", "Manhã", "Tarde", "Noite"]} selected={0} />
      </div>

      <Scroll style={{ top: 51 + 124, bottom: 78 }}>
        <div style={{ padding: "12px 16px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
              padding: "0 2px",
            }}
          >
            <span style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>
              <span style={{ color: t.ink, fontWeight: 700 }}>9 viagens</span> encontradas
            </span>
            <button
              style={{
                border: `1px solid ${t.line}`,
                background: t.surface,
                color: t.ink2,
                padding: "5px 10px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Mais próxima <I.chevronDown size={11} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {trips.map((tr, i) => (
              <ExploreTripCard key={i} t={t} {...tr} />
            ))}
          </div>
        </div>
      </Scroll>

      <PassengerNav active="explorar" t={t} />
    </Phone>
  );
}

function ExploreSegment({ t, options, selected = 0 }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        padding: 3,
        background: t.surface2,
        border: `1px solid ${t.line}`,
        borderRadius: 10,
      }}
    >
      {options.map((o, i) => (
        <button
          key={o}
          style={{
            flex: 1,
            border: 0,
            cursor: "pointer",
            padding: "6px 4px",
            borderRadius: 8,
            background: i === selected ? t.ink : "transparent",
            color: i === selected ? t.surface : t.ink2,
            fontSize: 11,
            fontWeight: i === selected ? 700 : 600,
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function ExploreTripCard({ t, from, to, date, time, vagas, total, price, company }) {
  const fewLeft = vagas <= 5;
  const pct = (vagas / total) * 100;
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.line}`,
        borderRadius: 14,
        padding: 14,
      }}
    >
      {/* Top row — time/date + company */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: -0.5,
              color: t.ink,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1,
            }}
          >
            {time}
          </div>
          <div style={{ marginTop: 3, fontSize: 11, color: t.muted, fontWeight: 700 }}>{date}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 99,
              background: t.accentSoft,
              color: t.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 800,
            }}
          >
            {company[0]}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.ink2 }}>{company}</span>
        </div>
      </div>

      {/* Route */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              color: t.muted,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Origem
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 14,
              fontWeight: 800,
              color: t.ink,
              letterSpacing: -0.2,
            }}
          >
            {from}
          </div>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 4px", minWidth: 60 }}
        >
          <div style={{ width: 6, height: 6, borderRadius: 99, border: `1.6px solid ${t.ink}` }} />
          <div style={{ flex: 1, borderTop: `1.5px dashed ${t.line}` }} />
          <I.bus size={12} color={t.accent} />
          <div style={{ flex: 1, borderTop: `1.5px dashed ${t.line}` }} />
          <div style={{ width: 6, height: 6, borderRadius: 99, background: t.accent }} />
        </div>
        <div style={{ minWidth: 0, textAlign: "right" }}>
          <div
            style={{
              fontSize: 10,
              color: t.muted,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Destino
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 14,
              fontWeight: 800,
              color: t.ink,
              letterSpacing: -0.2,
            }}
          >
            {to}
          </div>
        </div>
      </div>

      {/* Bottom — vagas + preço + reservar */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <I.users size={13} color={t.muted} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: fewLeft ? t.warn : t.ink2 }}>
              {fewLeft ? `Só ${vagas} vagas` : `${vagas}/${total} vagas`}
            </div>
            <div
              style={{
                marginTop: 4,
                width: 60,
                height: 4,
                borderRadius: 99,
                background: t.lineSoft,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: fewLeft ? t.warn : t.accent,
                }}
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 9,
                color: t.muted,
                fontWeight: 600,
                letterSpacing: 0.3,
                textTransform: "uppercase",
              }}
            >
              a partir de
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: t.ink,
                letterSpacing: -0.3,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1,
              }}
            >
              R$ {price}
            </div>
          </div>
          <button
            style={{
              background: t.ink,
              color: t.surface,
              border: 0,
              padding: "9px 14px",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Reservar <I.chevron size={11} stroke={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenExplorar });
