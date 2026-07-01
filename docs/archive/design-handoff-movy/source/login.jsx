/* global React, I, Phone, Scroll, PublicTopBar, FormField */

// ============================================================================
// login.jsx — Tela de login (não logado)
// ============================================================================

function ScreenLogin({ t }) {
  return (
    <Phone t={t} label="W02 Entrar">
      <PublicTopBar t={t} showEntrar={false} />
      <Scroll style={{ top: 51, bottom: 0 }}>
        <div style={{ padding: "40px 22px 24px" }}>
          {/* Logo + título */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: t.ink,
                margin: "0 auto 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <I.bus size={26} color={t.surface} />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: -0.8,
                color: t.ink,
              }}
            >
              Entrar
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: t.muted }}>
              Acesse sua conta para reservar viagens
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FormField t={t} label="E-mail" placeholder="você@email.com" type="email" />
            <FormField
              t={t}
              label="Senha"
              placeholder="••••••••"
              type="password"
              rightLink={
                <a
                  href="#"
                  style={{ fontSize: 11, color: t.accent, fontWeight: 700, textDecoration: "none" }}
                >
                  Esqueci
                </a>
              }
            />
          </div>

          <button
            style={{
              marginTop: 18,
              width: "100%",
              padding: "13px 16px",
              borderRadius: 12,
              border: 0,
              cursor: "pointer",
              fontFamily: "inherit",
              background: t.ink,
              color: t.surface,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Entrar
          </button>

          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: t.line }} />
            <span
              style={{
                fontSize: 10,
                color: t.muted,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              ou
            </span>
            <div style={{ flex: 1, height: 1, background: t.line }} />
          </div>

          <button
            style={{
              marginTop: 14,
              width: "100%",
              padding: "11px 16px",
              borderRadius: 12,
              border: `1px solid ${t.line}`,
              background: t.surface,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              color: t.ink,
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 99,
                background: t.lineSoft,
                display: "inline-block",
              }}
            />
            Continuar com Google
          </button>

          <div style={{ marginTop: 22, textAlign: "center", fontSize: 13, color: t.muted }}>
            Não tem conta?{" "}
            <a href="#" style={{ color: t.ink, fontWeight: 700, textDecoration: "none" }}>
              Cadastre-se
            </a>
          </div>
        </div>
      </Scroll>
    </Phone>
  );
}

Object.assign(window, { ScreenLogin });
