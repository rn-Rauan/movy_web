/* global React, Phone, TopBar, Scroll, Card, I */

// ============================================================================
// empresa.jsx — Tela da empresa: plano, link público, agendamento, dados
// ============================================================================

function ScreenEmpresa({ t }) {
  const [auto, setAuto] = React.useState(true);
  const [autoOpen, setAutoOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const usages = [
    { label: "Veículos", icon: I.car, used: 1, total: 1 },
    { label: "Motoristas", icon: I.users, used: 1, total: 1 },
    { label: "Viagens / mês", icon: I.bus, used: 5, total: 5 },
  ];

  const copy = () => {
    try {
      navigator.clipboard?.writeText("jregu.app/jregu-s");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {}
  };

  return (
    <Phone t={t} label="03 Empresa">
      <TopBar title="Empresa" t={t} />
      <Scroll>
        <div
          style={{ padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Plan card — hero */}
          <div
            style={{
              background: t.ink,
              color: "#fff",
              borderRadius: 18,
              padding: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: t.accent,
                    color: t.accentInk,
                    padding: "3px 8px",
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                  }}
                >
                  <I.bolt size={10} fill={t.accentInk} stroke={t.accentInk} /> PLANO FREE
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    opacity: 0.6,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                  }}
                >
                  Mensalidade
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      letterSpacing: -1,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    R$ 0,00
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>/mês</div>
                </div>
                <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                  Válido até 19/06, 17:25
                </div>
              </div>
            </div>

            {/* Usage bars */}
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {usages.map((u) => {
                const pct = (u.used / u.total) * 100;
                const full = pct >= 100;
                return (
                  <div key={u.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 5,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <u.icon size={13} color={full ? t.accent : "rgba(255,255,255,0.7)"} />
                        <span style={{ opacity: 0.85 }}>{u.label}</span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: full ? t.accent : "#fff",
                        }}
                      >
                        {u.used}
                        <span style={{ opacity: 0.5, fontWeight: 500 }}>/{u.total}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 99,
                        background: "rgba(255,255,255,0.1)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: full ? t.accent : "rgba(255,255,255,0.6)",
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                style={{
                  flex: 1,
                  border: 0,
                  background: t.accent,
                  color: t.accentInk,
                  padding: "10px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Fazer upgrade →
              </button>
              <button
                style={{
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "transparent",
                  color: "#fff",
                  padding: "10px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Pagamentos
              </button>
            </div>
          </div>

          {/* Share public link */}
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.line}`,
              borderRadius: 14,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: t.accentSoft,
                  color: t.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <I.share size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>
                  Sua página pública
                </div>
                <div style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>
                  Compartilhe pra clientes verem suas viagens
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                background: t.surface2,
                border: `1px solid ${t.line}`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12.5,
                  color: t.ink2,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  minWidth: 0,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                <span style={{ color: t.muted }}>jregu.app/</span>
                <span style={{ color: t.accent, fontWeight: 800 }}>jregu-s</span>
              </div>
              <button
                onClick={copy}
                style={{
                  border: 0,
                  borderLeft: `1px solid ${t.line}`,
                  background: copied ? t.success : t.ink,
                  color: "#fff",
                  padding: "0 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  transition: "background .15s",
                }}
              >
                {copied ? <I.check size={14} stroke={2.5} /> : <I.copy size={14} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <button
                style={{
                  flex: 1,
                  border: `1px solid ${t.line}`,
                  background: t.surface,
                  padding: "8px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.ink2,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <I.share size={13} /> Compartilhar
              </button>
              <button
                style={{
                  flex: 1,
                  border: `1px solid ${t.line}`,
                  background: t.surface,
                  padding: "8px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.ink2,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <I.qr size={13} /> QR code
              </button>
              <button
                style={{
                  flex: 1,
                  border: `1px solid ${t.line}`,
                  background: t.surface,
                  padding: "8px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.ink2,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <I.external size={13} /> Abrir
              </button>
            </div>
          </div>

          {/* Auto-schedule — collapsible */}
          <Card t={t} style={{ padding: 0 }}>
            <button
              onClick={() => setAutoOpen(!autoOpen)}
              style={{
                width: "100%",
                textAlign: "left",
                border: 0,
                background: "transparent",
                cursor: "pointer",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                fontFamily: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: auto ? t.accentSoft : t.lineSoft,
                    color: auto ? t.accent : t.muted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                  }}
                >
                  <I.refresh size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.ink, letterSpacing: -0.2 }}>
                    Agendamento automático
                  </div>
                  <div style={{ fontSize: 11, color: t.muted, marginTop: 1, lineHeight: 1.3 }}>
                    {auto ? (
                      <span>
                        <span style={{ color: t.success, fontWeight: 700 }}>● Ativo</span> · 14 dias
                        · 19:33 · a cada 15min
                      </span>
                    ) : (
                      <span>Desativado · clique pra configurar</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
                {/* iOS toggle */}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setAuto(!auto);
                  }}
                  style={{
                    display: "inline-block",
                    cursor: "pointer",
                    width: 40,
                    height: 24,
                    borderRadius: 99,
                    background: auto ? t.success : t.line,
                    position: "relative",
                    transition: "background .15s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: auto ? 18 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: 99,
                      background: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      transition: "left .15s",
                    }}
                  />
                </span>
                <I.chevronDown
                  size={16}
                  color={t.muted}
                  style={{
                    transition: "transform .2s",
                    transform: autoOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </div>
            </button>

            {autoOpen && auto && (
              <div
                style={{
                  padding: "4px 14px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  borderTop: `1px solid ${t.lineSoft}`,
                  marginTop: 0,
                }}
              >
                <div style={{ paddingTop: 12 }} />
                <Field
                  t={t}
                  label="Antecedência"
                  hint="Cria viagens com 14 dias de antecedência"
                  value="14 dias"
                />
                <Field
                  t={t}
                  label="Horário de criação diária"
                  hint="Brasília · sistema gera as próximas viagens"
                  value="19:33"
                  icon={I.clock}
                />
                <Field
                  t={t}
                  label="Verificação de cancelamento"
                  hint="Recomendado: a cada 15 minutos"
                  value="A cada 15 min"
                />
              </div>
            )}
            {autoOpen && !auto && (
              <div
                style={{
                  padding: "14px",
                  borderTop: `1px solid ${t.lineSoft}`,
                  fontSize: 12,
                  color: t.muted,
                  lineHeight: 1.5,
                }}
              >
                Ative o agendamento automático no toggle acima pra criar viagens recorrentes a
                partir dos seus templates e cancelar viagens sem inscritos suficientes.
              </div>
            )}
          </Card>

          {/* Company info */}
          <Card t={t}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: t.accentSoft,
                    color: t.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: -0.5,
                  }}
                >
                  JR
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: t.ink, letterSpacing: -0.3 }}>
                    JRegu's
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: t.muted,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    /jregu-s
                  </div>
                </div>
              </div>
              <button
                style={{
                  border: `1px solid ${t.line}`,
                  background: t.surface,
                  padding: "6px 12px",
                  borderRadius: 99,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.ink2,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <I.pencil size={12} /> Editar
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <InfoRow t={t} icon={I.hash} label="CNPJ" value="12.345.678/JR00-12" />
              <InfoRow t={t} icon={I.mail} label="E-mail" value="jregus@email.com" />
              <InfoRow t={t} icon={I.phone} label="Telefone" value="(86) 96996-9696" />
              <InfoRow t={t} icon={I.pin} label="Endereço" value="Rua dos Bobos, 9" />
              <InfoRow
                t={t}
                icon={I.bolt}
                label="Status"
                value={
                  <span
                    style={{
                      color: t.success,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      style={{ width: 6, height: 6, borderRadius: 99, background: t.success }}
                    />{" "}
                    Ativa
                  </span>
                }
                last
              />
            </div>
          </Card>

          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Card t={t} style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <I.car size={20} color={t.ink2} />
                <I.chevron size={14} color={t.muted} />
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: t.ink,
                  letterSpacing: -1,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                1
              </div>
              <div style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>
                Veículo cadastrado
              </div>
            </Card>
            <Card t={t} style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <I.users size={20} color={t.ink2} />
                <I.chevron size={14} color={t.muted} />
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: t.ink,
                  letterSpacing: -1,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                1
              </div>
              <div style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>Motorista ativo</div>
            </Card>
          </div>
        </div>
      </Scroll>
    </Phone>
  );
}

// ----------------------------------------------------------------------------
// Local helpers (used only by Empresa)
// ----------------------------------------------------------------------------

function Field({ t, label, hint, value, icon: Ic = null }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: t.ink2,
          fontWeight: 700,
          marginBottom: 5,
          letterSpacing: 0.2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          padding: "10px 12px",
          background: t.surface2,
          border: `1px solid ${t.line}`,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: t.ink,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {value}
        </div>
        {Ic ? <Ic size={14} color={t.muted} /> : <I.chevronDown size={14} color={t.muted} />}
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: t.muted, marginTop: 4, lineHeight: 1.4 }}>{hint}</div>
      )}
    </div>
  );
}

function InfoRow({ t, icon: Ic, label, value, last }) {
  return (
    <div
      style={{
        padding: "10px 0",
        borderBottom: last ? "none" : `1px solid ${t.lineSoft}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Ic size={15} color={t.muted} />
      <div
        style={{
          fontSize: 11,
          color: t.muted,
          fontWeight: 600,
          width: 70,
          letterSpacing: 0.2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: t.ink,
          fontWeight: 600,
          marginLeft: "auto",
          textAlign: "right",
        }}
      >
        {value}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenEmpresa });
