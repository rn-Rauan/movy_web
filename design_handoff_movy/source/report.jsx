/* global React, Phone, TopBar, Scroll, Card, Bar, StatusPill, I */

// ============================================================================
// report.jsx — Relatório do mês (duas variações: financeiro e operação)
// ============================================================================

function ScreenDashboardReport({ t, variant = 'finance' }) {
  // Mock data — Maio/26
  const month = {
    label: 'Maio 2026',
    revTotal: 5840,
    revConfirmed: 4120,
    revPending: 1280,
    revLost: 440,
    deltaPct: 18.2,
    prevRev: 4940,
    weeks: [820, 1140, 1680, 2200],
    weeksLabels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    trips: { realized: 18, confirmed: 7, scheduled: 6, canceled: 4, draft: 1 },
    passengers: 187,
    avgOccupation: 62,
    topRoutes: [
      { from: 'Campo Maior', to: 'Piripiri', trips: 12, rev: 3840, occ: 78 },
      { from: 'Piripiri', to: 'Campo Maior', trips: 5, rev: 1480, occ: 54 },
      { from: 'Especial fim-de-semana', to: '', trips: 1, rev: 520, occ: 41 },
    ],
    upcoming: [
      { date: '28/05', label: 'Repasse semanal', amount: 1840, kind: 'in' },
      { date: '01/06', label: 'Mensalidade plano Pro', amount: 79, kind: 'out' },
      { date: '04/06', label: 'Repasse semanal', amount: 2120, kind: 'in' },
    ],
  };
  const totalTrips = month.trips.realized + month.trips.confirmed + month.trips.scheduled + month.trips.canceled;
  const weekMax = Math.max(...month.weeks);
  const fmt = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (n) => n.toLocaleString('pt-BR');

  return (
    <Phone t={t} label={`Relatório · ${variant === 'finance' ? 'Financeiro' : 'Operação'}`}>
      <TopBar title="Relatório do mês" t={t} back action={
        <button style={{
          border: `1px solid ${t.line}`, background: t.surface,
          padding: '6px 10px', borderRadius: 99, cursor: 'pointer',
          fontSize: 11, fontWeight: 700, color: t.ink2,
          fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          {month.label} <I.chevronDown size={12} />
        </button>
      } />

      <Scroll>
        <div style={{ padding: '14px 16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* ===== HERO: Receita do mês ===== */}
          <div style={{
            background: t.ink, color: '#fff', borderRadius: 18,
            padding: 16, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Receita do mês</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 16, opacity: 0.55, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                  <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1.5, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                    {fmtInt(month.revTotal)}<span style={{ fontSize: 20, opacity: 0.5 }}>,00</span>
                  </div>
                </div>
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    color: '#7fd49d', fontWeight: 700,
                    background: 'rgba(127,212,157,0.12)',
                    padding: '2px 7px', borderRadius: 99,
                  }}>
                    <I.trending size={10} stroke={2.4} /> +{month.deltaPct}%
                  </span>
                  <span style={{ opacity: 0.55 }}>vs {fmt(month.prevRev)} em abril</span>
                </div>
              </div>
            </div>

            {/* Stacked bar — confirmada vs pendente vs perdida */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ flex: month.revConfirmed, background: t.accent }} />
                <div style={{ flex: month.revPending, background: 'rgba(255,255,255,0.55)' }} />
                <div style={{ flex: month.revLost, background: 'rgba(255,255,255,0.18)' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11 }}>
                <RevLegend dot={t.accent} label="Confirmada" value={fmt(month.revConfirmed)} />
                <RevLegend dot="rgba(255,255,255,0.55)" label="Pendente" value={fmt(month.revPending)} />
                <RevLegend dot="rgba(255,255,255,0.18)" label="Perdida" value={fmt(month.revLost)} muted />
              </div>
            </div>
          </div>

          {/* ===== Receita por semana ===== */}
          <Card t={t} style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Receita por semana</div>
                <div style={{ fontSize: 14, color: t.ink, fontWeight: 800, marginTop: 2, letterSpacing: -0.2 }}>Aceleração na última semana</div>
              </div>
              <div style={{ display: 'flex', gap: 2, padding: 2, background: t.surface2, border: `1px solid ${t.line}`, borderRadius: 8 }}>
                {['Semana', 'Dia'].map((s, i) => (
                  <button key={s} style={{
                    border: 0, cursor: 'pointer', padding: '4px 10px',
                    background: i === 0 ? t.surface : 'transparent',
                    borderRadius: 6, fontSize: 11, fontWeight: i === 0 ? 800 : 600,
                    color: i === 0 ? t.ink : t.muted, fontFamily: 'inherit',
                    boxShadow: i === 0 ? '0 1px 1.5px rgba(0,0,0,0.05)' : 'none',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 110, paddingBottom: 4, borderBottom: `1px dashed ${t.line}` }}>
              {month.weeks.map((v, i) => {
                const h = (v / weekMax) * 88;
                const isLast = i === month.weeks.length - 1;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: isLast ? t.accent : t.ink2,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>R$ {fmtInt(v)}</div>
                    <div style={{
                      width: '100%', borderRadius: '6px 6px 2px 2px',
                      height: `${h}px`,
                      background: isLast ? t.accent : t.lineSoft,
                      border: isLast ? 'none' : `1px solid ${t.line}`,
                      borderBottom: 0,
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {month.weeksLabels.map((l) => (
                <div key={l} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: t.muted, fontWeight: 700 }}>{l}</div>
              ))}
            </div>
          </Card>

          {/* ===== Viagens do mês ===== */}
          <div>
            <SectionTitle t={t} title="Viagens do mês" sub={`${totalTrips} no total`} action="Ver lista →" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <TripStatCard t={t} label="Realizadas" value={month.trips.realized} sub="já aconteceram" tone="success" />
              <TripStatCard t={t} label="Confirmadas" value={month.trips.confirmed} sub="prontas pra rodar" tone="info" />
              <TripStatCard t={t} label="Agendadas" value={month.trips.scheduled} sub="aguardando inscritos" tone="muted" />
              <TripStatCard t={t} label="Canceladas" value={month.trips.canceled} sub={`R$ ${fmt(month.revLost)} perdidos`} tone="danger" />
            </div>
          </div>

          {/* ===== KPI strip ===== */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0,
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
            overflow: 'hidden',
          }}>
            <MiniKPI t={t} label="Passageiros" value={fmtInt(month.passengers)} icon={I.users} />
            <MiniKPI t={t} label="Ocup. média" value={`${month.avgOccupation}%`} icon={I.pct} divide />
            <MiniKPI t={t} label="Ticket médio" value={`R$ ${fmt(month.revTotal / month.passengers).split(',')[0]}`} icon={I.money} divide />
          </div>

          {/* ===== Top rotas ===== */}
          <div>
            <SectionTitle t={t} title="Top rotas" sub="Maior receita" action="Ver todas →" />
            <Card t={t} style={{ padding: 4 }}>
              {month.topRoutes.map((r, i) => (
                <RouteRow key={i} t={t} route={r} rank={i + 1} last={i === month.topRoutes.length - 1} fmt={fmt} />
              ))}
            </Card>
          </div>

          {/* ===== Próximos repasses ===== */}
          <div>
            <SectionTitle t={t} title="Calendário financeiro" sub="Próximos 14 dias" />
            <Card t={t} style={{ padding: 4 }}>
              {month.upcoming.map((u, i) => (
                <UpcomingRow key={i} t={t} item={u} last={i === month.upcoming.length - 1} fmt={fmt} />
              ))}
            </Card>
          </div>

          {/* ===== Export ===== */}
          <button style={{
            background: t.surface, border: `1px solid ${t.line}`,
            color: t.ink, padding: '12px', borderRadius: 12, cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <I.doc size={15} /> Exportar relatório (.csv)
          </button>

        </div>
      </Scroll>
    </Phone>
  );
}

// ============================================================================
// Variação B — Operação em foco
// ============================================================================

function ScreenDashboardReportOps({ t }) {
  const month = {
    label: 'Maio 2026',
    revTotal: 5840,
    revConfirmed: 4120,
    revPending: 1280,
    deltaPct: 18.2,
    trips: { realized: 18, confirmed: 7, scheduled: 6, canceled: 4 },
    passengers: 187,
    avgOccupation: 62,
    days: [
      [0,40,60,0,80,120,40],
      [60,80,40,120,160,80,60],
      [80,120,60,180,220,140,80],
      [120,160,80,240,300,200,160],
    ],
    topRoutes: [
      { from: 'Campo Maior', to: 'Piripiri', trips: 12, rev: 3840, occ: 78 },
      { from: 'Piripiri', to: 'Campo Maior', trips: 5, rev: 1480, occ: 54 },
      { from: 'Especial fim-de-semana', to: '', trips: 1, rev: 520, occ: 41 },
    ],
  };
  const dayMax = Math.max(...month.days.flat());
  const totalTrips = month.trips.realized + month.trips.confirmed + month.trips.scheduled + month.trips.canceled;
  const dayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const fmt = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (n) => n.toLocaleString('pt-BR');

  return (
    <Phone t={t} label="Relatório · Operação">
      <TopBar title="Relatório do mês" t={t} back action={
        <button style={{
          border: `1px solid ${t.line}`, background: t.surface,
          padding: '6px 10px', borderRadius: 99, cursor: 'pointer',
          fontSize: 11, fontWeight: 700, color: t.ink2,
          fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          {month.label} <I.chevronDown size={12} />
        </button>
      } />
      <Scroll>
        <div style={{ padding: '14px 16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* ===== Hero — viagens realizadas (com receita ao lado) ===== */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`,
            borderRadius: 18, padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, paddingRight: 12, borderRight: `1px solid ${t.lineSoft}` }}>
                <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>Viagens realizadas</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <div style={{ fontSize: 38, fontWeight: 800, color: t.ink, letterSpacing: -1.5, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{month.trips.realized}</div>
                  <div style={{ fontSize: 13, color: t.muted }}>de {totalTrips}</div>
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: t.ink2 }}>
                  <span style={{ color: t.success, fontWeight: 800 }}>{month.passengers}</span> passageiros · ocup. <span style={{ fontWeight: 800, color: t.ink }}>{month.avgOccupation}%</span>
                </div>
              </div>
              <div style={{ flex: 1, paddingLeft: 0 }}>
                <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>Receita</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: t.muted, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: t.ink, letterSpacing: -0.8, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{fmtInt(month.revTotal)}</div>
                </div>
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 3, color: t.success, fontWeight: 700, fontSize: 11 }}>
                  <I.trending size={11} stroke={2.4} /> +{month.deltaPct}% vs abril
                </div>
              </div>
            </div>

            {/* Status segmented bar */}
            <div>
              <div style={{ fontSize: 10, color: t.muted, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>Status das viagens</div>
              <div style={{ display: 'flex', height: 26, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.line}` }}>
                <StatusSegment t={t} flex={month.trips.realized} color={t.success} label={month.trips.realized} title="Real." />
                <StatusSegment t={t} flex={month.trips.confirmed} color={t.info} label={month.trips.confirmed} title="Confir." />
                <StatusSegment t={t} flex={month.trips.scheduled} color={t.muted} label={month.trips.scheduled} title="Agend." />
                <StatusSegment t={t} flex={month.trips.canceled} color={t.danger} label={month.trips.canceled} title="Cancel." last />
              </div>
            </div>
          </div>

          {/* ===== Heatmap ===== */}
          <Card t={t} style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Receita diária · mês</div>
                <div style={{ fontSize: 14, color: t.ink, fontWeight: 800, marginTop: 2, letterSpacing: -0.2 }}>Quintas concentram a maior receita</div>
              </div>
              <div style={{ fontSize: 10, color: t.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>Menos</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[0.12, 0.3, 0.55, 0.85].map((a) => (
                    <span key={a} style={{ width: 10, height: 10, borderRadius: 2, background: t.accent, opacity: a, display: 'block' }} />
                  ))}
                </div>
                <span>Mais</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(7, 1fr)', gap: 4, alignItems: 'center' }}>
              <div />
              {dayLabels.map((d, i) => (
                <div key={i} style={{ fontSize: 10, color: t.muted, fontWeight: 700, textAlign: 'center' }}>{d}</div>
              ))}
              {month.days.map((wk, wi) => (
                <React.Fragment key={wi}>
                  <div style={{ fontSize: 10, color: t.muted, fontWeight: 600, paddingRight: 6 }}>S{wi + 1}</div>
                  {wk.map((v, di) => {
                    const intensity = v === 0 ? 0 : 0.12 + (v / dayMax) * 0.88;
                    return (
                      <div key={di} style={{
                        aspectRatio: '1', borderRadius: 4,
                        background: v === 0 ? t.lineSoft : t.accent,
                        opacity: v === 0 ? 1 : intensity,
                      }} title={`R$ ${v}`} />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </Card>

          {/* ===== Status detalhado ===== */}
          <div>
            <SectionTitle t={t} title="Detalhamento" sub={`${totalTrips} viagens no mês`} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <TripStatCard t={t} label="Realizadas" value={month.trips.realized} sub={`R$ ${fmt(3320)} pago`} tone="success" />
              <TripStatCard t={t} label="Confirmadas" value={month.trips.confirmed} sub="prontas pra rodar" tone="info" />
              <TripStatCard t={t} label="Agendadas" value={month.trips.scheduled} sub="aguardando inscritos" tone="muted" />
              <TripStatCard t={t} label="Canceladas" value={month.trips.canceled} sub="3 por baixa inscrição" tone="danger" />
            </div>
          </div>

          {/* ===== Top rotas ===== */}
          <div>
            <SectionTitle t={t} title="Top rotas" sub="Maior receita" action="Ver todas →" />
            <Card t={t} style={{ padding: 4 }}>
              {month.topRoutes.map((r, i) => (
                <RouteRow key={i} t={t} route={r} rank={i + 1} last={i === month.topRoutes.length - 1} fmt={fmt} />
              ))}
            </Card>
          </div>

        </div>
      </Scroll>
    </Phone>
  );
}

// ----------------------------------------------------------------------------
// Sub-components (used only by Report)
// ----------------------------------------------------------------------------

function SectionTitle({ t, title, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, padding: '0 2px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>{title}</h2>
        {sub && <span style={{ fontSize: 11, color: t.muted, fontWeight: 600 }}>· {sub}</span>}
      </div>
      {action && (
        <button style={{
          border: 0, background: 'transparent', color: t.accent,
          fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>{action}</button>
      )}
    </div>
  );
}

function RevLegend({ dot, label, value, muted }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, opacity: muted ? 0.6 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, opacity: 0.7, fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase' }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: dot }} /> {label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
        <span style={{ opacity: 0.55, fontWeight: 600 }}>R$ </span>{value}
      </div>
    </div>
  );
}

function TripStatCard({ t, label, value, sub, tone }) {
  const tones = {
    success: { bg: t.successSoft, fg: t.success },
    info: { bg: t.infoSoft, fg: t.info },
    danger: { bg: t.dangerSoft, fg: t.danger },
    muted: { bg: t.lineSoft, fg: t.muted },
  };
  const c = tones[tone] || tones.muted;
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
      padding: 12, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 8px', borderRadius: 99,
        background: c.bg, color: c.fg,
        fontSize: 10, fontWeight: 800, letterSpacing: 0.3, textTransform: 'uppercase',
      }}>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: c.fg }} /> {label}
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: t.ink, letterSpacing: -1.2, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ fontSize: 11, color: t.muted, marginTop: 4, lineHeight: 1.3 }}>{sub}</div>
    </div>
  );
}

function MiniKPI({ t, label, value, icon: Ic, divide }) {
  return (
    <div style={{
      padding: 12,
      borderLeft: divide ? `1px solid ${t.lineSoft}` : 'none',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: t.muted }}>
        <Ic size={12} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: t.ink, letterSpacing: -0.5, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function RouteRow({ t, route, rank, last, fmt }) {
  return (
    <div style={{
      padding: '12px 10px',
      borderBottom: last ? 'none' : `1px solid ${t.lineSoft}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6, flex: '0 0 auto',
        background: rank === 1 ? t.accent : t.lineSoft,
        color: rank === 1 ? t.accentInk : t.ink2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
      }}>{rank}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.ink, lineHeight: 1.2, letterSpacing: -0.1 }}>
          {route.from}{route.to ? ` → ${route.to}` : ''}
        </div>
        <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>
          {route.trips} viagens · ocup. {route.occ}%
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: t.ink, fontFamily: "'JetBrains Mono', monospace", letterSpacing: -0.3 }}>
          <span style={{ color: t.muted, fontWeight: 600 }}>R$ </span>{fmt(route.rev)}
        </div>
      </div>
    </div>
  );
}

function UpcomingRow({ t, item, last, fmt }) {
  const isIn = item.kind === 'in';
  return (
    <div style={{
      padding: '12px 10px',
      borderBottom: last ? 'none' : `1px solid ${t.lineSoft}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flex: '0 0 auto',
        background: t.surface2, border: `1px solid ${t.line}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        lineHeight: 1,
      }}>
        <div style={{ fontSize: 9, color: t.muted, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>{item.date.split('/')[1]}</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: t.ink, fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>{item.date.split('/')[0]}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>{item.label}</div>
        <div style={{ fontSize: 11, color: isIn ? t.success : t.warn, fontWeight: 700, letterSpacing: 0.2, textTransform: 'uppercase', marginTop: 1 }}>
          {isIn ? 'Entrada' : 'Saída'}
        </div>
      </div>
      <div style={{
        fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
        color: isIn ? t.success : t.danger, letterSpacing: -0.3,
      }}>
        {isIn ? '+' : '−'}<span style={{ opacity: 0.55, fontWeight: 600 }}>R$ </span>{fmt(item.amount)}
      </div>
    </div>
  );
}

function StatusSegment({ t, flex, color, label, title, last }) {
  return (
    <div style={{
      flex, background: color,
      borderRight: last ? 'none' : `1px solid ${t.surface}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#fff', lineHeight: 1, padding: '2px 0', minWidth: 28,
    }}>
      <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.85, letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 1 }}>{title}</div>
    </div>
  );
}

Object.assign(window, { ScreenDashboardReport, ScreenDashboardReportOps });
