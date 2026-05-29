/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard, DCPostIt,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle,
   PALETTES, ScreenDashboard, ScreenViagens, ScreenEmpresa, ScreenPerfil,
   ScreenTripDetail, ModalNewTrip, ModalNewTemplate,
   ScreenDashboardReport, ScreenDashboardReportOps,
   ScreenLanding, ScreenLogin, ScreenCadastro,
   ScreenExplorar, ScreenEmpresasPublicas, ScreenInscricoes,
   ScreenViagemDetalhe, ScreenInscricao,
   InteractivePhone */

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
    palette: "terracotta",
    showInteractive: true,
  }; /*EDITMODE-END*/

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const t = PALETTES[tweaks.palette] || PALETTES.terracotta;

  return (
    <React.Fragment>
      <DesignCanvas defaultZoom={0.7}>
        <DCSection
          id="screens"
          title="JRegu's — Redesign"
          subtitle="Gestão de viagens · 4 telas mobile reimaginadas com hierarquia clara, rota visualizada e dashboard com dados de verdade"
        >
          <DCArtboard id="dashboard" label="01 · Dashboard" width={390} height={844}>
            <ScreenDashboard t={t} />
          </DCArtboard>
          <DCArtboard id="viagens" label="02 · Viagens" width={390} height={844}>
            <ScreenViagens t={t} />
          </DCArtboard>
          <DCArtboard id="empresa" label="03 · Empresa" width={390} height={844}>
            <ScreenEmpresa t={t} />
          </DCArtboard>
          <DCArtboard id="perfil" label="04 · Perfil" width={390} height={844}>
            <ScreenPerfil t={t} />
          </DCArtboard>

          <DCPostIt top={-10} right={60} width={210} rotate={3}>
            Clique nos cards pra abrir um em foco. Use Tweaks no canto pra trocar paleta.
          </DCPostIt>
        </DCSection>

        <DCSection
          id="detail-and-modals"
          title="Detalhe & criação"
          subtitle="Tela de detalhe da viagem + 2 modais (Nova viagem / Novo template) como bottom sheets"
        >
          <DCArtboard id="trip-detail" label="05 · Detalhe da viagem" width={390} height={844}>
            <ScreenTripDetail t={t} />
          </DCArtboard>
          <DCArtboard id="new-trip" label="06 · Nova viagem (modal)" width={390} height={844}>
            <ModalNewTrip t={t} />
          </DCArtboard>
          <DCArtboard id="new-template" label="07 · Novo template (modal)" width={390} height={844}>
            <ModalNewTemplate t={t} />
          </DCArtboard>

          <DCPostIt top={-10} right={60} width={230} rotate={-2}>
            Modais saíram do cartão-flutuante-no-meio pra bottom sheet com drag handle. Paradas
            viraram timeline visual.
          </DCPostIt>
        </DCSection>

        <DCSection
          id="report"
          title="Relatório do mês (dashboard detalhado)"
          subtitle="Nova tela acessada pelo botão 'Ver relatório' no dashboard da home. Receita, viagens realizadas/confirmadas/canceladas, top rotas e calendário financeiro."
        >
          <DCArtboard
            id="report-finance"
            label="08 · Relatório · Financeiro em foco"
            width={390}
            height={844}
          >
            <ScreenDashboardReport t={t} />
          </DCArtboard>
          <DCArtboard
            id="report-ops"
            label="09 · Relatório · Operação em foco"
            width={390}
            height={844}
          >
            <ScreenDashboardReportOps t={t} />
          </DCArtboard>

          <DCPostIt top={-10} right={60} width={240} rotate={2}>
            Duas variações: A foca em dinheiro (receita do mês como hero + breakdown
            confirmada/pendente/perdida). B foca na operação (viagens realizadas como hero + heatmap
            diário).
          </DCPostIt>
        </DCSection>

        <DCSection
          id="publico"
          title="Público — landing & autenticação"
          subtitle="Telas externas (não logado): home enxuta, entrar e criar conta. Cada tela mora num arquivo próprio pra ser reusada no app real."
        >
          <DCArtboard id="landing" label="W01 · Landing" width={390} height={844}>
            <ScreenLanding t={t} />
          </DCArtboard>
          <DCArtboard id="login" label="W02 · Entrar" width={390} height={844}>
            <ScreenLogin t={t} />
          </DCArtboard>
          <DCArtboard id="cadastro" label="W03 · Cadastro passageiro" width={390} height={844}>
            <ScreenCadastro t={t} />
          </DCArtboard>

          <DCPostIt top={-10} right={60} width={240} rotate={-2}>
            Landing manteve a simplicidade original — só melhorou hierarquia. Cadastro tem toggle
            passageiro/empresa no topo, sem precisar duas páginas.
          </DCPostIt>
        </DCSection>

        <DCSection
          id="passageiro"
          title="Passageiro (logado) — fluxo completo"
          subtitle="Navbar de 4 abas: Explorar / Empresas / Inscrições / Perfil. Detalhe da viagem e formulário de inscrição completam o caminho até a reserva."
        >
          <DCArtboard id="explorar" label="W04 · Explorar viagens" width={390} height={844}>
            <ScreenExplorar t={t} />
          </DCArtboard>
          <DCArtboard id="empresas-publicas" label="W05 · Empresas" width={390} height={844}>
            <ScreenEmpresasPublicas t={t} />
          </DCArtboard>
          <DCArtboard id="inscricoes" label="W06 · Minhas inscrições" width={390} height={844}>
            <ScreenInscricoes t={t} />
          </DCArtboard>
          <DCArtboard id="viagem-detalhe" label="W07 · Detalhe da viagem" width={390} height={844}>
            <ScreenViagemDetalhe t={t} />
          </DCArtboard>
          <DCArtboard id="inscricao" label="W08 · Inscrever-se" width={390} height={844}>
            <ScreenInscricao t={t} />
          </DCArtboard>

          <DCPostIt top={-10} right={60} width={260} rotate={2}>
            Fluxo: Explorar → tap num card → Detalhe (W07) → Inscrever-se (W08) → Inscrições (W06)
            confirma. Empresas (W05) é caminho alternativo: ver empresa → suas viagens → mesmo
            destino.
          </DCPostIt>
        </DCSection>

        {tweaks.showInteractive && (
          <DCSection
            id="interactive"
            title="Protótipo clicável"
            subtitle="Toque na bottom-nav pra navegar — Dashboard ↔ Viagens ↔ Templates ↔ Empresa ↔ Perfil"
          >
            <DCArtboard id="proto" label="Protótipo · navegação ativa" width={390} height={844}>
              <InteractivePhone t={t} />
            </DCArtboard>

            <DCPostIt top={40} left={520} width={230} rotate={-2}>
              Tente: comece no Dashboard, toque em "Viagens" na barra inferior, depois "Empresa".
              Tudo funciona em tempo real.
            </DCPostIt>
          </DCSection>
        )}
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Paleta">
          <TweakRadio
            label="Tom"
            value={tweaks.palette}
            onChange={(v) => setTweak("palette", v)}
            options={[
              { value: "terracotta", label: "Terracota" },
              { value: "ocean", label: "Oceano" },
              { value: "forest", label: "Floresta" },
            ]}
          />
        </TweakSection>
        <TweakSection label="Apresentação">
          <TweakToggle
            label="Protótipo clicável"
            value={tweaks.showInteractive}
            onChange={(v) => setTweak("showInteractive", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
