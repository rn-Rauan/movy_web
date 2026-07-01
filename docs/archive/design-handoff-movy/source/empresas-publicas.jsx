/* global React, I, Phone, Scroll, TopBar, PassengerNav */

// ============================================================================
// empresas-publicas.jsx — Lista de empresas cadastradas que o passageiro
// pode visualizar e entrar em contato.
// ============================================================================

function ScreenEmpresasPublicas({ t }) {
  const companies = [
    {
      name: "Jacinto's",
      city: "Nossa Senhora de Nazaré · PI",
      email: "jacintos@email.com",
      phone: "86 98125-0203",
      trips: 8,
      rating: 4.7,
    },
    {
      name: "Akinuku",
      city: "Campo Maior · PI",
      email: "contato@akinuku.com",
      phone: "86 99812-4400",
      trips: 24,
      rating: 4.9,
    },
    {
      name: "Vai e Vem",
      city: "Teresina · PI",
      email: "reservas@vaievem.com",
      phone: "86 99933-1207",
      trips: 16,
      rating: 4.6,
    },
    {
      name: "Norte Express",
      city: "Parnaíba · PI",
      email: "oi@norteexpress.com",
      phone: "86 98800-1290",
      trips: 11,
      rating: 4.5,
    },
  ];

  return (
    <Phone t={t} label="W05 Empresas — pública">
      <TopBar title="Empresas" t={t} />

      {/* Sub-hint */}
      <div
        style={{
          padding: "12px 18px 6px",
          background: t.surface,
          borderBottom: `1px solid ${t.lineSoft}`,
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: t.muted, lineHeight: 1.4 }}>
          Escolha uma empresa para ver suas viagens ou entrar em contato.
        </p>
      </div>

      {/* Sticky search */}
      <div
        style={{
          position: "sticky",
          top: 51,
          zIndex: 4,
          background: t.bg,
          padding: "12px 16px 10px",
          borderBottom: `1px solid ${t.line}`,
        }}
      >
        <div style={{ position: "relative" }}>
          <I.search
            size={15}
            color={t.muted}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            placeholder="Buscar empresa pelo nome"
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
      </div>

      <Scroll style={{ top: 51 + 40 + 56, bottom: 78 }}>
        <div style={{ padding: "12px 16px 24px" }}>
          <div
            style={{
              marginBottom: 10,
              padding: "0 2px",
              fontSize: 11,
              fontWeight: 700,
              color: t.muted,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {companies.length} empresas
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {companies.map((c, i) => (
              <CompanyCard key={i} t={t} {...c} />
            ))}
          </div>
        </div>
      </Scroll>

      <PassengerNav active="empresas" t={t} />
    </Phone>
  );
}

function CompanyCard({ t, name, city, email, phone, trips, rating }) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.line}`,
        borderRadius: 14,
        padding: 14,
      }}
    >
      {/* Top: avatar + nome + cidade */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div
          style={{
            flex: "0 0 auto",
            width: 44,
            height: 44,
            borderRadius: 12,
            background: t.surface2,
            border: `1px solid ${t.line}`,
            color: t.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <I.building size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: t.ink, letterSpacing: -0.3 }}>
              {name}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontSize: 11,
                fontWeight: 700,
                color: t.ink2,
              }}
            >
              <span style={{ color: t.warn, fontSize: 13 }}>★</span> {rating}
            </div>
          </div>
          <div
            style={{
              marginTop: 3,
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: t.muted,
            }}
          >
            <I.pin size={12} /> {city}
          </div>
          <div
            style={{
              marginTop: 6,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "2px 8px",
              borderRadius: 99,
              background: t.accentSoft,
              color: t.accent,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            <I.bus size={11} /> {trips} viagens ativas
          </div>
        </div>
      </div>

      {/* Contato */}
      <div
        style={{
          paddingTop: 12,
          borderTop: `1px dashed ${t.line}`,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <ContactLine t={t} icon={<I.mail size={13} color={t.muted} />} value={email} />
        <ContactLine t={t} icon={<I.phone size={13} color={t.muted} />} value={phone} />
      </div>

      {/* Ações */}
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button
          style={{
            border: `1px solid ${t.line}`,
            background: t.surface,
            color: t.ink,
            padding: "10px 12px",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <I.bus size={13} /> Ver viagens
        </button>
        <button
          style={{
            border: 0,
            background: t.ink,
            color: t.surface,
            padding: "10px 12px",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <I.phone size={13} /> Contato
        </button>
      </div>
    </div>
  );
}

function ContactLine({ t, icon, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: t.ink2 }}>
      {icon}
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

Object.assign(window, { ScreenEmpresasPublicas });
