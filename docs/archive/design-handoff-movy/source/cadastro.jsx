/* global React, Phone, Scroll, PublicTopBar, FormField */

// ============================================================================
// cadastro.jsx — Tela de cadastro de passageiro
// Toggle no topo permite alternar para fluxo de empresa.
// ============================================================================

function ScreenCadastro({ t }) {
  return (
    <Phone t={t} label="W03 Cadastro passageiro">
      <PublicTopBar t={t} showEntrar={false} />
      <Scroll style={{ top: 51, bottom: 0 }}>
        <div style={{ padding: "24px 22px 24px" }}>
          {/* Toggle quem está cadastrando */}
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 3,
              marginBottom: 22,
              background: t.surface2,
              border: `1px solid ${t.line}`,
              borderRadius: 12,
            }}
          >
            <button
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 9,
                border: 0,
                cursor: "pointer",
                background: t.surface,
                color: t.ink,
                fontSize: 12,
                fontWeight: 700,
                boxShadow: "0 1px 2px rgba(0,0,0,.05)",
                fontFamily: "inherit",
              }}
            >
              Sou passageiro
            </button>
            <button
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 9,
                border: 0,
                cursor: "pointer",
                background: "transparent",
                color: t.muted,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              Tenho empresa
            </button>
          </div>

          <h1
            style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: -0.7, color: t.ink }}
          >
            Criar conta
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: t.muted }}>Leva menos de um minuto</p>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <FormField t={t} label="Nome completo" placeholder="Maria de Sousa" />
            <FormField t={t} label="E-mail" placeholder="você@email.com" />
            <FormField t={t} label="Telefone" placeholder="(86) 9 9999-9999" />
            <FormField
              t={t}
              label="Senha"
              placeholder="Mínimo 8 caracteres"
              type="password"
              hint="Use letras e números"
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
            Criar conta
          </button>

          <p
            style={{
              marginTop: 12,
              fontSize: 11,
              color: t.muted,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Ao criar conta você concorda com os{" "}
            <a href="#" style={{ color: t.ink2, fontWeight: 600 }}>
              Termos
            </a>{" "}
            e{" "}
            <a href="#" style={{ color: t.ink2, fontWeight: 600 }}>
              Privacidade
            </a>
            .
          </p>

          <div style={{ marginTop: 14, textAlign: "center", fontSize: 13, color: t.muted }}>
            Já tem conta?{" "}
            <a href="#" style={{ color: t.ink, fontWeight: 700, textDecoration: "none" }}>
              Entrar
            </a>
          </div>
        </div>
      </Scroll>
    </Phone>
  );
}

Object.assign(window, { ScreenCadastro });
