/* global React, Phone, TopBar, Scroll, Card, I */

// ============================================================================
// perfil.jsx — Tela de perfil do usuário (conta + ações)
// ============================================================================

function ScreenPerfil({ t }) {
  return (
    <Phone t={t} label="04 Perfil">
      <TopBar title="Perfil" t={t} />
      <Scroll>
        <div style={{ padding: '14px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Profile header */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 18,
            padding: 18, textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            {/* subtle gradient backdrop */}
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 70% at 50% 0%, ${t.accentSoft} 0%, transparent 70%)`, opacity: 0.7, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 99, margin: '0 auto 12px',
                background: t.ink, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 800, letterSpacing: -0.5,
                border: `3px solid ${t.surface}`,
                boxShadow: `0 4px 16px ${t.accentSoft}`,
              }}>JR</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.ink, letterSpacing: -0.5 }}>Jacintos Regus</div>
              <div style={{ fontSize: 13, color: t.muted, fontWeight: 500, marginTop: 2 }}>jacinto@email.com</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
                <button style={{
                  background: t.ink, color: '#fff', border: 0,
                  padding: '8px 16px', borderRadius: 99, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontFamily: 'inherit',
                }}><I.pencil size={12} /> Editar perfil</button>
                <button style={{
                  background: t.surface, border: `1px solid ${t.line}`, color: t.ink2,
                  padding: '8px 14px', borderRadius: 99, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                }}>Compartilhar</button>
              </div>
            </div>
          </div>

          {/* Info block */}
          <Card t={t} style={{ padding: 4 }}>
            <PerfilInfoRow t={t} icon={I.user} label="Nome" value="Jacintos Regus" />
            <PerfilInfoRow t={t} icon={I.mail} label="E-mail" value="jacinto@email.com" last />
          </Card>

          {/* Trabalhar como motorista */}
          <div style={{
            background: t.accentSoft,
            border: `1px solid ${t.accent}22`,
            borderRadius: 14, padding: 16,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: t.accent, color: t.accentInk,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flex: '0 0 auto',
              }}>
                <I.id size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>Trabalhar como motorista</div>
                <div style={{ fontSize: 12, color: t.ink2, lineHeight: 1.45, marginTop: 4 }}>
                  Para motoristas que vão trabalhar para uma empresa cadastrada no sistema.
                </div>
              </div>
            </div>
            <button style={{
              width: '100%', marginTop: 14,
              background: t.ink, color: '#fff', border: 0,
              padding: '12px', borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>Ativar perfil de motorista <I.arrowRight size={14} /></button>
          </div>

          {/* Conta */}
          <div>
            <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>Conta</div>
            <Card t={t} style={{ padding: 4 }}>
              <PerfilAction t={t} icon={I.lock} label="Alterar senha" hint="Última alteração há 32 dias" />
              <PerfilAction t={t} icon={I.bolt} label="Notificações" hint="Push, e-mail, SMS" />
              <PerfilAction t={t} icon={I.alert} label="Privacidade & dados" hint="Exportar, excluir conta" last />
            </Card>
          </div>

          {/* Logout */}
          <button style={{
            background: t.surface, border: `1px solid ${t.dangerSoft}`,
            color: t.danger, padding: '14px',
            borderRadius: 14, cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <I.logout size={16} /> Sair da conta
          </button>

          <div style={{ textAlign: 'center', color: t.muted, fontSize: 10, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>v 2.4.1 · build 2026.05</div>
        </div>
      </Scroll>
    </Phone>
  );
}

// ----------------------------------------------------------------------------
// Local helpers (used only by Perfil)
// ----------------------------------------------------------------------------

function PerfilInfoRow({ t, icon: Ic, label, value, last }) {
  return (
    <div style={{
      padding: '12px',
      borderBottom: last ? 'none' : `1px solid ${t.lineSoft}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: t.surface2, color: t.ink2,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
      }}>
        <Ic size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: t.muted, fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: 14, color: t.ink, fontWeight: 600, marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function PerfilAction({ t, icon: Ic, label, hint, last }) {
  return (
    <button style={{
      width: '100%', textAlign: 'left', border: 0, background: 'transparent', cursor: 'pointer',
      padding: '12px',
      borderBottom: last ? 'none' : `1px solid ${t.lineSoft}`,
      display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: 'inherit',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: t.surface2, color: t.ink2,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
      }}>
        <Ic size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: t.ink, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>{hint}</div>
      </div>
      <I.chevron size={16} color={t.muted} />
    </button>
  );
}

Object.assign(window, { ScreenPerfil });
