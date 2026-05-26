/* global React, Phone, ScreenViagens, ScreenTemplates, I */

// ============================================================================
// modals.jsx — Bottom-sheet modals (Nova viagem / Novo template)
// ============================================================================

// ----------------------------------------------------------------------------
// Modal shell — bottom sheet sobre tela escurecida
// ----------------------------------------------------------------------------

function ModalPhone({ t, label, behind, title, children, ctaLabel, ctaIcon, sheetTop = 90 }) {
  return (
    <Phone t={t} label={label}>
      {/* Background screen */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0 }}>{behind}</div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,15,20,0.42)' }} />
      </div>

      {/* Bottom sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: sheetTop, bottom: 0,
        background: t.surface,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Drag handle */}
        <div style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 38, height: 4, borderRadius: 99, background: t.line }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '6px 18px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${t.lineSoft}`,
        }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: t.ink, letterSpacing: -0.3 }}>{title}</h2>
          <button style={{
            width: 28, height: 28, borderRadius: 99,
            border: 0, background: t.lineSoft, color: t.ink2, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.x size={14} stroke={2.4} /></button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px 12px' }}>
          {children}
        </div>

        {/* CTA */}
        {ctaLabel && (
          <div style={{ padding: '10px 18px 16px', borderTop: `1px solid ${t.lineSoft}`, background: t.surface }}>
            <button style={{
              width: '100%', border: 0, cursor: 'pointer',
              background: t.ink, color: '#fff',
              padding: '13px', borderRadius: 12,
              fontFamily: 'inherit', fontSize: 14, fontWeight: 800, letterSpacing: -0.2,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {ctaIcon}
              {ctaLabel}
            </button>
          </div>
        )}
      </div>
    </Phone>
  );
}

// ----------------------------------------------------------------------------
// Form atoms (used only by the modals)
// ----------------------------------------------------------------------------

function FormLabel({ t, children, optional, hint }) {
  return (
    <div style={{ marginBottom: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: t.ink, letterSpacing: -0.1 }}>{children}</label>
      {optional && <span style={{ fontSize: 10, color: t.muted, fontWeight: 600 }}>opcional</span>}
      {hint && <span style={{ fontSize: 11, color: t.muted, marginLeft: 'auto' }}>{hint}</span>}
    </div>
  );
}

function Input({ t, value, placeholder, mono, prefix, suffix, type = 'text' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 10,
      padding: '0 12px',
      fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
    }}>
      {prefix && <span style={{ color: t.muted, fontSize: 13, marginRight: 6 }}>{prefix}</span>}
      <input type={type} defaultValue={value} placeholder={placeholder}
        style={{
          flex: 1, border: 0, outline: 'none', background: 'transparent',
          padding: '11px 0', fontSize: 13, color: t.ink, fontWeight: 600,
          fontFamily: 'inherit',
        }} />
      {suffix && <span style={{ color: t.muted, fontSize: 13, marginLeft: 6 }}>{suffix}</span>}
    </div>
  );
}

function Select({ t, value, placeholder, leading }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 10,
      padding: '11px 12px',
      cursor: 'pointer',
    }}>
      {leading}
      <div style={{ flex: 1, fontSize: 13, color: value ? t.ink : t.muted, fontWeight: value ? 700 : 500 }}>{value || placeholder}</div>
      <I.chevronDown size={14} color={t.muted} />
    </div>
  );
}

function Hint({ t, children }) {
  return <div style={{ fontSize: 11, color: t.muted, marginTop: 5, lineHeight: 1.4 }}>{children}</div>;
}

function Check({ t, label, checked, sub }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
      <div style={{
        flex: '0 0 auto', width: 18, height: 18, borderRadius: 5,
        border: `1.8px solid ${checked ? t.ink : t.line}`,
        background: checked ? t.ink : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', marginTop: 1,
      }}>{checked && <I.check size={11} stroke={3} />}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: t.muted, marginTop: 1, lineHeight: 1.4 }}>{sub}</div>}
      </div>
    </label>
  );
}

// ============================================================================
// MODAL — Nova viagem
// ============================================================================

function ModalNewTrip({ t }) {
  return (
    <ModalPhone t={t} label="06 Nova viagem (modal)"
      behind={<ScreenViagens t={t} />}
      title="Nova viagem"
      ctaLabel="Criar viagem"
      ctaIcon={<I.plus size={15} stroke={2.4} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div>
          <FormLabel t={t}>Template de rota</FormLabel>
          <Select t={t} placeholder="Selecione um template…"
            leading={<I.list size={14} color={t.muted} />} />
        </div>

        <div>
          <FormLabel t={t} hint="O horário vem do template">Data de partida</FormLabel>
          <Input t={t} placeholder="dd/mm/aaaa" mono />
        </div>

        <div>
          <FormLabel t={t}>Capacidade total</FormLabel>
          <Input t={t} placeholder="40" suffix="assentos" mono />
        </div>

        <div>
          <FormLabel t={t}>Status inicial</FormLabel>
          <div style={{
            display: 'flex', gap: 4, padding: 3,
            background: t.surface2, border: `1px solid ${t.line}`,
            borderRadius: 10,
          }}>
            {['Rascunho', 'Agendada'].map((s, i) => (
              <button key={s} style={{
                flex: 1, border: 0, cursor: 'pointer', padding: '8px',
                borderRadius: 7,
                background: i === 0 ? t.surface : 'transparent',
                boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                fontSize: 12, fontWeight: i === 0 ? 800 : 500,
                color: i === 0 ? t.ink : t.muted, fontFamily: 'inherit',
              }}>{s}</button>
            ))}
          </div>
          <Hint t={t}>Rascunho não aparece pra passageiros até você publicar.</Hint>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <FormLabel t={t}>Motorista</FormLabel>
            <Select t={t} placeholder="Sem motorista"
              leading={<I.user size={14} color={t.muted} />} />
          </div>
          <div>
            <FormLabel t={t}>Veículo</FormLabel>
            <Select t={t} placeholder="Sem veículo"
              leading={<I.bus size={14} color={t.muted} />} />
          </div>
        </div>

        <div style={{
          background: t.accentSoft, border: `1px solid ${t.accent}22`,
          borderRadius: 10, padding: '10px 12px',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <I.alert size={14} color={t.accent} />
          <div style={{ fontSize: 11, color: t.ink2, lineHeight: 1.45 }}>
            Sem motorista e veículo, a viagem fica como <strong>Rascunho</strong> até você completar.
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
    <ModalPhone t={t} label="07 Novo template (modal)"
      behind={<ScreenTemplates t={t} />}
      title="Novo template"
      ctaLabel="Criar template"
      ctaIcon={<I.plus size={15} stroke={2.4} />}
      sheetTop={56}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
          <div style={{
            display: 'flex', gap: 4, padding: 3,
            background: t.surface2, border: `1px solid ${t.line}`,
            borderRadius: 10,
          }}>
            {['Manhã', 'Tarde', 'Noite', 'Madrug.'].map((s, i) => (
              <button key={s} style={{
                flex: 1, border: 0, cursor: 'pointer', padding: '7px 4px',
                borderRadius: 7,
                background: i === 0 ? t.surface : 'transparent',
                boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                fontSize: 11, fontWeight: i === 0 ? 800 : 500,
                color: i === 0 ? t.ink : t.muted, fontFamily: 'inherit',
              }}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <FormLabel t={t}>Partida</FormLabel>
            <Input t={t} placeholder="--:--" mono suffix={<I.clock size={13} color={t.muted} />} />
          </div>
          <div>
            <FormLabel t={t}>Chegada</FormLabel>
            <Input t={t} placeholder="--:--" mono suffix={<I.clock size={13} color={t.muted} />} />
          </div>
        </div>
        <Hint t={t}>Horários em Brasília (UTC−3). Se a viagem cruza meia-noite, a chegada pode ser anterior à partida.</Hint>

        <div>
          <FormLabel t={t}>Capacidade padrão</FormLabel>
          <Input t={t} placeholder="20" suffix="assentos" mono />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <FormLabel t={t}>Motorista padrão</FormLabel>
            <Select t={t} placeholder="Nenhum"
              leading={<I.user size={14} color={t.muted} />} />
          </div>
          <div>
            <FormLabel t={t}>Veículo padrão</FormLabel>
            <Select t={t} placeholder="Nenhum"
              leading={<I.bus size={14} color={t.muted} />} />
          </div>
        </div>
        <Hint t={t}>Defina os dois pra publicar viagens automaticamente sem revisão.</Hint>

        {/* Paradas */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <FormLabel t={t}>Paradas <span style={{ color: t.muted, fontWeight: 500 }}>· mín. 2</span></FormLabel>
            <button style={{
              border: 0, background: 'transparent', color: t.accent,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'inherit',
            }}><I.plus size={13} stroke={2.4} /> Adicionar</button>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <StopRow t={t} idx={1} placeholder="Ex: Rodoviária" />
            <StopRow t={t} idx={2} placeholder="Ex: Centro" />
            <StopRow t={t} idx={3} placeholder="Ex: Universidade" />
          </div>
        </div>

        {/* Preços */}
        <div>
          <FormLabel t={t}>Preços</FormLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <PriceCol t={t} label="Ida" value="12,00" />
            <PriceCol t={t} label="Volta" value="12,00" />
            <PriceCol t={t} label="Ida + volta" value="20,00" accent />
          </div>
        </div>

        {/* Options */}
        <div style={{
          background: t.surface2, border: `1px solid ${t.line}`,
          borderRadius: 12, padding: 14,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <Check t={t} checked={true} label="Visível no marketplace"
            sub="Apareça na busca pública pra novos passageiros." />
          <Check t={t} checked={true} label="Recorrente"
            sub="O agendamento automático gera essas viagens periodicamente." />
          <Check t={t} checked={false} label="Auto-cancelar se receita mínima não for atingida"
            sub="Cancela viagens com baixa inscrição até 30min antes da partida." />
        </div>

      </div>
    </ModalPhone>
  );
}

function StopRow({ t, idx, placeholder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 99, flex: '0 0 auto',
        background: t.lineSoft, color: t.ink2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
      }}>{idx}</div>
      <div style={{ flex: 1 }}>
        <Input t={t} placeholder={placeholder} />
      </div>
      <button style={{
        width: 32, height: 32, borderRadius: 8, flex: '0 0 auto',
        border: `1px solid ${t.line}`, background: t.surface,
        color: t.muted, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><I.x size={13} /></button>
    </div>
  );
}

function PriceCol({ t, label, value, accent }) {
  return (
    <div style={{
      background: accent ? t.accentSoft : t.surface2,
      border: `1px solid ${accent ? t.accent + '33' : t.line}`,
      borderRadius: 10, padding: '10px 12px',
    }}>
      <div style={{ fontSize: 10, color: accent ? t.accent : t.muted, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: t.muted, fontWeight: 700 }}>R$</span>
        <span style={{
          fontSize: 16, fontWeight: 800, color: t.ink, letterSpacing: -0.5,
          fontFamily: "'JetBrains Mono', monospace",
        }}>{value}</span>
      </div>
    </div>
  );
}

Object.assign(window, { ModalPhone, ModalNewTrip, ModalNewTemplate });
