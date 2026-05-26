/* global React, Phone, TopBar, Scroll, Card, Bar, StatusPill, Route, I */

// ============================================================================
// dashboard.jsx — Tela inicial (home) com KPIs e próximas viagens
// ============================================================================

function ScreenDashboard({ t, dense, onOpenReport }) {
  const trips = [
    { date: '22/05', time: '20:00', from: 'Campo Maior', to: 'Piripiri', booked: 0, total: 30, status: 'Agendada' },
    { date: '25/05', time: '20:00', from: 'Campo Maior', to: 'Piripiri', booked: 8, total: 30, status: 'Agendada' },
    { date: '26/05', time: '20:00', from: 'Campo Maior', to: 'Piripiri', booked: 14, total: 30, status: 'Confirmada' },
    { date: '27/05', time: '20:00', from: 'Campo Maior', to: 'Piripiri', booked: 2, total: 30, status: 'Agendada' },
  ];
  const week = [36, 72, 24, 96, 168, 132, 108]; // revenue R$ per day
  const weekMax = Math.max(...week);
  const days = ['Q', 'S', 'D', 'S', 'T', 'Q', 'Q'];
  const totalBooked = trips.reduce((s, x) => s + x.booked, 0);
  const totalSeats = trips.reduce((s, x) => s + x.total, 0);
  const estimatedRevenue = totalBooked * 20; // R$ 20 ida+volta

  return (
    <Phone t={t} label="01 Dashboard">
      <TopBar title="Dashboard" t={t} />
      <Scroll>
        <div style={{ padding: '14px 16px 24px' }}>

          {/* Greeting */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Boa tarde</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: t.ink, letterSpacing: -0.5, lineHeight: 1.1, marginTop: 2 }}>Jacintos, bem-vindo</div>
          </div>

          {/* Hero KPI: Receita estipulada */}
          <div style={{
            background: t.ink, color: '#fff', borderRadius: 18, padding: 16,
            marginBottom: 12, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Receita estipulada</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 18, opacity: 0.55, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                  <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1.5, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                    {estimatedRevenue.toLocaleString('pt-BR')}
                    <span style={{ fontSize: 22, opacity: 0.5 }}>,00</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{totalBooked} de {totalSeats} vagas vendidas</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '4px 8px',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, flex: '0 0 auto',
              }}>
                <I.trending size={12} />
                Esta semana
              </div>
            </div>
            {/* Mini chart — revenue per day */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 44 }}>
              {week.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', borderRadius: 4,
                    height: `${(v / weekMax) * 36 + 4}px`,
                    background: i === 4 ? t.accent : 'rgba(255,255,255,0.18)',
                  }} />
                  <div style={{ fontSize: 9, opacity: 0.5, fontWeight: 600 }}>{days[i]}</div>
                </div>
              ))}
            </div>

            {/* CTA: full report */}
            <button onClick={onOpenReport} style={{
              width: '100%', marginTop: 14,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <I.trending size={14} /> Ver relatório completo do mês
              </span>
              <I.arrowRight size={14} stroke={2.2} />
            </button>
          </div>

          {/* KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
            <Card t={t} style={{ padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.muted, marginBottom: 8 }}>
                <I.bus size={14} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.2 }}>Viagens ativas</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.ink, letterSpacing: -1, fontFamily: "'JetBrains Mono', monospace" }}>4</div>
                <div style={{ fontSize: 11, color: t.muted }}>de 5 total</div>
              </div>
              <div style={{ marginTop: 8 }}>
                <Bar value={4} max={5} t={t} color={t.accent} height={4} />
              </div>
            </Card>
            <Card t={t} style={{ padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.muted, marginBottom: 8 }}>
                <I.calendar size={14} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.2 }}>Próximos 7 dias</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.ink, letterSpacing: -1, fontFamily: "'JetBrains Mono', monospace" }}>4</div>
                <div style={{ fontSize: 11, color: t.muted }}>partidas</div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 2 }}>
                {[1,1,0,1,1,0,0].map((d, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: d ? t.accent : t.lineSoft }} />
                ))}
              </div>
            </Card>
            <Card t={t} style={{ padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.muted, marginBottom: 8 }}>
                <I.users size={14} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.2 }}>Passageiros</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.ink, letterSpacing: -1, fontFamily: "'JetBrains Mono', monospace" }}>{totalBooked}</div>
                <div style={{ fontSize: 11, color: t.muted }}>inscritos</div>
              </div>
              <div style={{ fontSize: 10, color: t.muted, marginTop: 8 }}>{totalSeats - totalBooked} vagas disponíveis</div>
            </Card>
            <Card t={t} style={{ padding: 12, background: t.surface2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.warn, marginBottom: 8 }}>
                <I.alert size={14} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.2 }}>Atenção</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.ink, lineHeight: 1.25 }}>1 viagem sem inscritos</div>
              <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>Risco de cancelamento automático</div>
            </Card>
          </div>

          {/* Próximas viagens */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, padding: '0 2px' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>Próximas viagens</h2>
            <button style={{ border: 0, background: 'transparent', color: t.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              Ver todas <I.chevron size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trips.map((trip, i) => (
              <Card key={i} t={t} style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: t.ink, letterSpacing: -0.5, fontFamily: "'JetBrains Mono', monospace" }}>{trip.date}</div>
                    <div style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>{trip.time}</div>
                  </div>
                  <StatusPill status={trip.status} t={t} />
                </div>
                <Route from={trip.from} to={trip.to} t={t} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Bar value={trip.booked} max={trip.total} t={t} color={trip.booked > trip.total * 0.5 ? t.success : t.accent} />
                  </div>
                  <div style={{ fontSize: 11, color: t.ink2, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                    {trip.booked}<span style={{ color: t.muted, fontWeight: 500 }}>/{trip.total}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Scroll>
    </Phone>
  );
}

Object.assign(window, { ScreenDashboard });
