/* global React, Phone, TopBar, Scroll, Card, I */

// ============================================================================
// templates.jsx — Lista de templates de rotas recorrentes
// ============================================================================

function ScreenTemplates({ t }) {
  const templates = [
    { name: 'Campo Maior → Piripiri', schedule: 'Diário · 20:00', total: 30, active: true },
    { name: 'Piripiri → Campo Maior', schedule: 'Diário · 06:30', total: 30, active: true },
    { name: 'Especial fim-de-semana', schedule: 'Sex/Sáb · 22:00', total: 45, active: false },
  ];

  return (
    <Phone t={t} label="05 Templates">
      <TopBar title="Templates" t={t} action={
        <button style={{
          background: t.accent, color: t.accentInk, border: 0,
          padding: '7px 12px', borderRadius: 99, cursor: 'pointer',
          fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: 'inherit',
        }}>
          <I.plus size={14} stroke={2.4} /> Novo
        </button>
      } />
      <Scroll>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {templates.map((tpl, i) => (
            <Card key={i} t={t} style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>{tpl.name}</div>
                  <div style={{ fontSize: 12, color: t.muted, marginTop: 3 }}>{tpl.schedule}</div>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                  background: tpl.active ? t.successSoft : t.lineSoft,
                  color: tpl.active ? t.success : t.muted,
                  letterSpacing: 0.3,
                }}>{tpl.active ? 'ATIVO' : 'PAUSADO'}</div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, color: t.ink2, fontSize: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><I.users size={13} /> {tpl.total} vagas</span>
                <span style={{ width: 3, height: 3, borderRadius: 99, background: t.muted }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><I.bus size={13} /> Akinuku</span>
              </div>
            </Card>
          ))}
        </div>
      </Scroll>
    </Phone>
  );
}

Object.assign(window, { ScreenTemplates });
