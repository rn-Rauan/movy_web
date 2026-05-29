/* global React, I, Phone, Scroll, PublicTopBar */

// ============================================================================
// landing.jsx — Tela inicial pública (não logado)
// Layout simples: hero curto + 2 cards (passageiro/empresa) + "Como funciona"
// ============================================================================

function ScreenLanding({ t }) {
  return (
    <Phone t={t} label="W01 Landing">
      <PublicTopBar t={t} />
      <Scroll style={{ top: 51, bottom: 0 }}>
        <div style={{ padding: "28px 18px 32px" }}>
          {/* Hero */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px 4px 8px",
                background: t.accentSoft,
                borderRadius: 99,
                marginBottom: 14,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 99, background: t.accent }} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: t.accent,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                }}
              >
                +1.240 viagens essa semana
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: -1,
                color: t.ink,
                textWrap: "balance",
              }}
            >
              Viagens compartilhadas pra empresas e passageiros.
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: 14,
                color: t.ink2,
                lineHeight: 1.5,
              }}
            >
              Reserve sua próxima viagem ou gerencie sua frota em um só lugar.
            </p>
          </div>

          {/* Dois cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <LandingAudienceCard
              t={t}
              kind="passenger"
              title="Quero reservar viagens"
              body="Encontre viagens perto de você e garanta sua vaga em segundos."
              cta="Ver viagens"
            />
            <LandingAudienceCard
              t={t}
              kind="company"
              title="Tenho empresa de transporte"
              body="Cadastre sua empresa, organize sua frota e cobre passageiros."
              cta="Cadastrar empresa"
            />
          </div>

          {/* Como funciona */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: t.muted,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                marginBottom: 12,
                paddingLeft: 2,
              }}
            >
              Como funciona
            </div>
            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.line}`,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              {[
                { n: 1, t: "Cadastre", d: "Crie sua conta em poucos passos." },
                { n: 2, t: "Gerencie", d: "Organize viagens, rotas e motoristas." },
                { n: 3, t: "Embarque", d: "Pague no app, vaga garantida." },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 14px",
                    borderTop: i ? `1px solid ${t.line}` : "none",
                  }}
                >
                  <div
                    style={{
                      flex: "0 0 auto",
                      width: 28,
                      height: 28,
                      borderRadius: 99,
                      background: t.ink,
                      color: t.surface,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {s.n}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>{s.t}</div>
                    <div style={{ marginTop: 1, fontSize: 12, color: t.muted, lineHeight: 1.4 }}>
                      {s.d}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer mínimo */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 16,
              borderTop: `1px solid ${t.line}`,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: t.muted,
            }}
          >
            <span>© 2026 movy</span>
            <div style={{ display: "flex", gap: 14 }}>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
                Termos
              </a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
                Suporte
              </a>
            </div>
          </div>
        </div>
      </Scroll>
    </Phone>
  );
}

function LandingAudienceCard({ t, kind, title, body, cta }) {
  const isCompany = kind === "company";
  return (
    <button
      style={{
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "inherit",
        background: isCompany ? t.ink : t.surface,
        color: isCompany ? t.surface : t.ink,
        border: isCompany ? "none" : `1px solid ${t.line}`,
        borderRadius: 16,
        padding: 18,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          width: 42,
          height: 42,
          borderRadius: 12,
          background: isCompany ? "rgba(255,255,255,0.1)" : t.accentSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isCompany ? (
          <I.building size={20} color={t.accent} />
        ) : (
          <I.pinFilled size={20} color={t.accent} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: -0.3,
            color: isCompany ? t.surface : t.ink,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 3,
            fontSize: 12,
            lineHeight: 1.45,
            color: isCompany ? "rgba(255,255,255,0.65)" : t.muted,
          }}
        >
          {body}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            fontWeight: 700,
            color: isCompany ? t.surface : t.accent,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {cta} <I.arrowRight size={12} stroke={2.4} />
        </div>
      </div>
    </button>
  );
}

Object.assign(window, { ScreenLanding });
