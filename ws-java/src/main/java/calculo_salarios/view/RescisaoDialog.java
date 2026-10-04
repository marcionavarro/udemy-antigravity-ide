package calculo_salarios.view;

import calculo_salarios.controller.RescisaoController;
import calculo_salarios.model.ModalidadeAvisoPrevio;
import calculo_salarios.model.ResultadoRescisorio;
import calculo_salarios.model.TipoRescisao;
import com.formdev.flatlaf.FlatClientProperties;
import net.miginfocom.swing.MigLayout;

import javax.swing.*;
import javax.swing.border.CompoundBorder;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import java.awt.*;
import java.text.NumberFormat;
import java.util.Locale;

/**
 * JDialog modal para calculo das verbas rescisórias.
 * Recebe nome e salario da tela principal para contexto.
 * Nenhuma logica de negocio reside aqui.
 *
 * Tectreinamentos Informatica LTDA.
 * Departamento de RH e Departamento Pessoal
 */
public class RescisaoDialog extends JDialog {

    // Dados herdados da tela principal
    private final String nomeFuncionario;
    private final double salarioBruto;

    // =========================================================
    // Componentes — Entradas
    // =========================================================
    private JTextField                      txtDataAdmissao;
    private JTextField                      txtDataDemissao;
    private JComboBox<TipoRescisao>          cmbTipoRescisao;
    private JComboBox<ModalidadeAvisoPrevio> cmbModalidadeAviso;
    private JTextField                      txtSaldoFGTS;
    private JComboBox<String>               cmbFeriasVencidas;
    private JSpinner                        spnDiasTrabalhados;

    // =========================================================
    // Componentes — Resultados
    // =========================================================
    private JLabel lblTempoServico;
    private JLabel lblSaldoSalario;
    private JLabel lblDecimoTerceiro;
    private JLabel lblFeriasProporcional;
    private JLabel lblFeriasVencidas;
    private JLabel lblAbonoFerias;
    private JLabel lblAvisoPrevio;
    private JLabel lblMultaFGTS;
    private JLabel lblTotal;
    private JLabel lblMensagemErro;

    // =========================================================
    // Botoes
    // =========================================================
    private JButton btnCalcular;
    private JButton btnExportarPDF;
    private JButton btnFechar;

    private final NumberFormat formatoMoeda = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));

    // =========================================================
    // Construtor
    // =========================================================
    public RescisaoDialog(JFrame parent, String nomeFuncionario, double salarioBruto) {
        super(parent, "Calculo Rescisorio — Tectreinamentos Informatica LTDA.", true);
        this.nomeFuncionario = nomeFuncionario;
        this.salarioBruto    = salarioBruto;
        initUI();
        new RescisaoController(this);
    }

    // =========================================================
    // Inicializacao
    // =========================================================
    private void initUI() {
        setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
        setMinimumSize(new Dimension(620, 820));

        JPanel painelRaiz = new JPanel(new MigLayout("fill, insets 0, gapy 0"));
        painelRaiz.setBackground(MainView.COR_FUNDO);

        painelRaiz.add(criarPainelHeader(), "growx, wrap");

        JPanel conteudo = new JPanel(new MigLayout("fillx, insets 20 22 20 22, gapy 14"));
        conteudo.setBackground(MainView.COR_FUNDO);
        conteudo.add(criarPainelEntradas(), "growx, wrap");
        conteudo.add(criarPainelResultados(), "growx, wrap");
        conteudo.add(criarPainelBotoes(), "growx");

        painelRaiz.add(conteudo, "growx");

        JScrollPane scroll = new JScrollPane(painelRaiz);
        scroll.setBorder(null);
        scroll.getVerticalScrollBar().setUnitIncrement(16);
        setContentPane(scroll);

        pack();
        setLocationRelativeTo(getParent());
    }

    // =========================================================
    // Header do dialog
    // =========================================================
    private JPanel criarPainelHeader() {
        JPanel header = new JPanel(new MigLayout("fillx, insets 16 25 16 25, gapy 4"));
        header.setBackground(MainView.COR_SECUNDARIA);

        JLabel titulo = new JLabel("Calculo de Verbas Rescisórias");
        titulo.setFont(new Font("Segoe UI", Font.BOLD, 18));
        titulo.setForeground(Color.WHITE);

        String nomeExibicao = (nomeFuncionario == null || nomeFuncionario.isBlank())
                ? "Nao informado" : nomeFuncionario;
        String salarioExibicao = formatoMoeda.format(salarioBruto);

        JLabel subtitulo = new JLabel("Funcionario(a): " + nomeExibicao
                + "   |   Salario Bruto: " + salarioExibicao);
        subtitulo.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        subtitulo.setForeground(MainView.COR_HEADER_TEXT);

        header.add(titulo, "wrap");
        header.add(subtitulo);

        return header;
    }

    // =========================================================
    // Painel de entradas da rescisao
    // =========================================================
    private JPanel criarPainelEntradas() {
        JPanel cartao = criarCartao("Dados da Rescisao");
        Font fonteLabel = new Font("Segoe UI", Font.BOLD, 13);
        Font fonteInfo  = new Font("Segoe UI", Font.ITALIC, 11);
        Font fonteField = new Font("Segoe UI", Font.PLAIN, 14);

        // --- Datas ---
        JLabel lblAdm = new JLabel("Data de Admissao:");
        lblAdm.setFont(fonteLabel);
        txtDataAdmissao = new JTextField();
        txtDataAdmissao.setFont(fonteField);
        txtDataAdmissao.putClientProperty(FlatClientProperties.PLACEHOLDER_TEXT, "DD/MM/AAAA");
        txtDataAdmissao.setToolTipText("Data de inicio do contrato de trabalho (formato: DD/MM/AAAA)");

        JLabel lblDem = new JLabel("Data de Demissao:");
        lblDem.setFont(fonteLabel);
        txtDataDemissao = new JTextField();
        txtDataDemissao.setFont(fonteField);
        txtDataDemissao.putClientProperty(FlatClientProperties.PLACEHOLDER_TEXT, "DD/MM/AAAA");
        txtDataDemissao.setToolTipText("Data de encerramento do contrato de trabalho (formato: DD/MM/AAAA)");

        // --- Tipo de rescisao ---
        JLabel lblTipo = new JLabel("Tipo de Rescisao:");
        lblTipo.setFont(fonteLabel);
        cmbTipoRescisao = new JComboBox<>(TipoRescisao.values());
        cmbTipoRescisao.setFont(fonteField);
        cmbTipoRescisao.setToolTipText("Selecione a modalidade de encerramento do contrato");

        JLabel lblTipoInfo = new JLabel(
                "  Sem Justa Causa: multa 40% FGTS | Acordo: multa 20% | Pedido/Justa Causa: sem multa");
        lblTipoInfo.setFont(fonteInfo);
        lblTipoInfo.setForeground(Color.GRAY);

        // --- Modalidade do Aviso Previo ---
        JLabel lblAvisoPrevio = new JLabel("Modalidade do Aviso Previo:");
        lblAvisoPrevio.setFont(fonteLabel);
        cmbModalidadeAviso = new JComboBox<>(calculo_salarios.model.ModalidadeAvisoPrevio.values());
        cmbModalidadeAviso.setFont(fonteField);
        cmbModalidadeAviso.setToolTipText("Escolha entre Aviso Previo Indenizado, Trabalhado ou Dispensado");

        // --- Saldo FGTS ---
        JLabel lblFGTS = new JLabel("Saldo Total do FGTS (R$):");
        lblFGTS.setFont(fonteLabel);
        txtSaldoFGTS = new JTextField();
        txtSaldoFGTS.setFont(fonteField);
        txtSaldoFGTS.putClientProperty(FlatClientProperties.PLACEHOLDER_TEXT, "Ex: 8500.00");
        txtSaldoFGTS.setToolTipText("Consulte o saldo pelo App FGTS (Caixa Economica Federal)");

        JLabel lblFGTSInfo = new JLabel(
                "  Consulte o saldo no App FGTS ou no site da Caixa Economica Federal");
        lblFGTSInfo.setFont(fonteInfo);
        lblFGTSInfo.setForeground(Color.GRAY);

        // --- Ferias vencidas ---
        JLabel lblFerVenc = new JLabel("Ferias Vencidas Nao Gozadas:");
        lblFerVenc.setFont(fonteLabel);
        cmbFeriasVencidas = new JComboBox<>(new String[]{
                "Nao — periodo aquisitivo nao completado",
                "Sim — 12 meses completos nao gozados"
        });
        cmbFeriasVencidas.setFont(fonteField);
        cmbFeriasVencidas.setToolTipText(
                "Se o funcionario completou 12 meses sem gozar ferias, selecione 'Sim'");

        // --- Dias trabalhados no mes ---
        JLabel lblDias = new JLabel("Dias Trabalhados no Mes de Saida:");
        lblDias.setFont(fonteLabel);
        spnDiasTrabalhados = new JSpinner(new SpinnerNumberModel(30, 1, 31, 1));
        spnDiasTrabalhados.setFont(fonteField);
        spnDiasTrabalhados.setToolTipText(
                "Numero de dias efetivamente trabalhados no mes em que ocorreu o desligamento");
        if (spnDiasTrabalhados.getEditor() instanceof JSpinner.DefaultEditor de) {
            de.getTextField().setFont(fonteField);
        }

        JLabel lblDiasInfo = new JLabel(
                "  Usado para calcular o saldo de salario do mes de saida");
        lblDiasInfo.setFont(fonteInfo);
        lblDiasInfo.setForeground(Color.GRAY);

        // Mensagem de erro
        lblMensagemErro = new JLabel(" ");
        lblMensagemErro.setFont(new Font("Segoe UI", Font.BOLD, 12));
        lblMensagemErro.setForeground(MainView.COR_ATENCAO);

        // --- Layout ---
        cartao.add(lblAdm, "split 2, gapy 0");
        cartao.add(txtDataAdmissao, "growx, wrap");

        cartao.add(lblDem, "split 2, gapy 2 0");
        cartao.add(txtDataDemissao, "growx, wrap");

        cartao.add(Box.createVerticalStrut(2), "span 2, wrap");

        cartao.add(lblTipo, "span 2, wrap");
        cartao.add(cmbTipoRescisao, "span 2, growx, wrap");
        cartao.add(lblTipoInfo, "span 2, wrap, gapy 0 4");

        cartao.add(lblAvisoPrevio, "span 2, wrap");
        cartao.add(cmbModalidadeAviso, "span 2, growx, wrap, gapy 0 6");

        cartao.add(lblFGTS, "span 2, wrap");
        cartao.add(txtSaldoFGTS, "span 2, growx, wrap");
        cartao.add(lblFGTSInfo, "span 2, wrap, gapy 0 6");

        cartao.add(lblFerVenc, "span 2, wrap");
        cartao.add(cmbFeriasVencidas, "span 2, growx, wrap");

        cartao.add(Box.createVerticalStrut(2), "span 2, wrap");

        cartao.add(lblDias, "span 2, wrap");
        cartao.add(spnDiasTrabalhados, "w 90!, wrap");
        cartao.add(lblDiasInfo, "span 2, wrap");

        cartao.add(lblMensagemErro, "span 2, growx, wrap");

        return cartao;
    }

    // =========================================================
    // Painel de resultados das verbas
    // =========================================================
    private JPanel criarPainelResultados() {
        JPanel cartao = criarCartao("Verbas Rescisórias");

        lblTempoServico = adicionarLinhaResultado(cartao, "Tempo de Servico:", "—", MainView.COR_PRIMARIA);

        JSeparator sep1 = new JSeparator();
        sep1.setForeground(MainView.COR_BORDA);
        cartao.add(sep1, "span 2, growx, wrap, gapy 4 4");

        lblSaldoSalario       = adicionarLinhaResultado(cartao, "  Saldo de Salario:", "—", Color.DARK_GRAY);
        lblDecimoTerceiro     = adicionarLinhaResultado(cartao, "  13o Salario Proporcional:", "—", Color.DARK_GRAY);
        lblFeriasProporcional = adicionarLinhaResultado(cartao, "  Ferias Proporcionais:", "—", Color.DARK_GRAY);
        lblFeriasVencidas     = adicionarLinhaResultado(cartao, "  Ferias Vencidas:", "—", Color.DARK_GRAY);
        lblAbonoFerias        = adicionarLinhaResultado(cartao, "  Abono de Ferias (1/3 Constitucional):", "—", Color.DARK_GRAY);
        lblAvisoPrevio        = adicionarLinhaResultado(cartao, "  Aviso Previo Indenizado:", "—", Color.DARK_GRAY);
        lblMultaFGTS          = adicionarLinhaResultado(cartao, "  Multa sobre o FGTS:", "—", Color.DARK_GRAY);

        JSeparator sep2 = new JSeparator();
        sep2.setForeground(MainView.COR_PRIMARIA);
        cartao.add(sep2, "span 2, growx, wrap, gapy 6 6");

        lblTotal = adicionarLinhaResultado(cartao, "TOTAL A RECEBER:", "—", MainView.COR_SUCESSO);
        // Destaque no total
        lblTotal.setFont(new Font("Segoe UI", Font.BOLD, 16));

        JLabel lblAviso = new JLabel(
                "  Valores estimados. Sujeito a deducoes de INSS e IRRF. Consulte seu DP.");
        lblAviso.setFont(new Font("Segoe UI", Font.ITALIC, 11));
        lblAviso.setForeground(Color.GRAY);
        cartao.add(lblAviso, "span 2, wrap, gapy 6 0");

        return cartao;
    }

    // =========================================================
    // Painel de botoes
    // =========================================================
    private JPanel criarPainelBotoes() {
        JPanel painel = new JPanel(new MigLayout("fillx, insets 0, gap 8"));
        painel.setBackground(MainView.COR_FUNDO);

        btnCalcular = new JButton("Calcular Rescisao");
        btnCalcular.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btnCalcular.setBackground(MainView.COR_SUCESSO);
        btnCalcular.setForeground(Color.WHITE);
        btnCalcular.setFocusPainted(false);

        btnExportarPDF = new JButton("Exportar PDF");
        btnExportarPDF.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btnExportarPDF.setBackground(new Color(46, 125, 50));
        btnExportarPDF.setForeground(Color.WHITE);
        btnExportarPDF.setFocusPainted(false);
        btnExportarPDF.setEnabled(false);
        btnExportarPDF.setToolTipText("Exportar verbas rescisórias em formato PDF");

        btnFechar = new JButton("Fechar");
        btnFechar.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btnFechar.setFocusPainted(false);

        painel.add(btnCalcular,    "h 44!, pushx, growx");
        painel.add(btnExportarPDF, "h 44!, w 150!");
        painel.add(btnFechar,      "h 44!, w 110!");

        return painel;
    }

    // =========================================================
    // Helpers de construcao de UI
    // =========================================================

    private JPanel criarCartao(String titulo) {
        JPanel cartao = new JPanel(new MigLayout("fillx, insets 16 18 16 18, gapy 5", "[grow][]"));
        cartao.setBackground(MainView.COR_CARTAO);
        cartao.setBorder(new CompoundBorder(
                new LineBorder(MainView.COR_BORDA, 1, true),
                new EmptyBorder(4, 4, 4, 4)
        ));

        JLabel lblTitulo = new JLabel(titulo);
        lblTitulo.setFont(new Font("Segoe UI", Font.BOLD, 13));
        lblTitulo.setForeground(MainView.COR_PRIMARIA);
        cartao.add(lblTitulo, "span 2, wrap, gapy 0 6");

        JSeparator separador = new JSeparator();
        separador.setForeground(new Color(200, 215, 235));
        cartao.add(separador, "span 2, growx, wrap, gapy 0 8");

        return cartao;
    }

    private JLabel adicionarLinhaResultado(JPanel painel, String chave, String valorInicial, Color cor) {
        JLabel lblChave = new JLabel(chave);
        lblChave.setFont(new Font("Segoe UI", Font.BOLD, 13));

        JLabel lblValor = new JLabel(valorInicial);
        lblValor.setFont(new Font("Segoe UI", Font.BOLD, 13));
        lblValor.setForeground(cor);
        lblValor.setHorizontalAlignment(SwingConstants.RIGHT);

        painel.add(lblChave, "");
        painel.add(lblValor, "al right, wrap");

        return lblValor;
    }

    // =========================================================
    // API Publica — chamada pelo Controller
    // =========================================================

    /** Exibe o resultado do calculo rescisorio na interface. */
    public void exibirResultado(ResultadoRescisorio r) {
        lblTempoServico.setText(r.anosServico() + " ano(s) e " + r.mesesServico() + " mes(es)");

        lblSaldoSalario.setText(formatoMoeda.format(r.saldoSalario()));
        lblSaldoSalario.setForeground(Color.DARK_GRAY);

        lblDecimoTerceiro.setText(r.decimoTerceiroProporcional() > 0
                ? formatoMoeda.format(r.decimoTerceiroProporcional()) : "Nao aplicavel");
        lblDecimoTerceiro.setForeground(r.decimoTerceiroProporcional() > 0
                ? Color.DARK_GRAY : Color.GRAY);

        lblFeriasProporcional.setText(r.feriasProporcional() > 0
                ? formatoMoeda.format(r.feriasProporcional()) : "Nao aplicavel");
        lblFeriasProporcional.setForeground(r.feriasProporcional() > 0
                ? Color.DARK_GRAY : Color.GRAY);

        lblFeriasVencidas.setText(r.feriasVencidas() > 0
                ? formatoMoeda.format(r.feriasVencidas()) : "—");
        lblFeriasVencidas.setForeground(r.feriasVencidas() > 0
                ? Color.DARK_GRAY : Color.GRAY);

        lblAbonoFerias.setText(formatoMoeda.format(r.abonoFerias()));
        lblAbonoFerias.setForeground(Color.DARK_GRAY);

        lblAvisoPrevio.setText(r.avisoPrevio() > 0
                ? formatoMoeda.format(r.avisoPrevio()) : "Nao aplicavel");
        lblAvisoPrevio.setForeground(r.avisoPrevio() > 0
                ? Color.DARK_GRAY : Color.GRAY);

        lblMultaFGTS.setText(r.multaFGTS() > 0
                ? formatoMoeda.format(r.multaFGTS()) : "Nao aplicavel");
        lblMultaFGTS.setForeground(r.multaFGTS() > 0
                ? MainView.COR_SUCESSO : Color.GRAY);

        lblTotal.setText(formatoMoeda.format(r.total()));
        lblTotal.setForeground(MainView.COR_SUCESSO);

        lblMensagemErro.setText(" ");
        btnExportarPDF.setEnabled(true);
    }

    /** Exibe uma mensagem de erro de validacao. */
    public void exibirErro(String mensagem) {
        lblMensagemErro.setText("  " + mensagem);
    }

    // =========================================================
    // Getters — expostos ao Controller
    // =========================================================
    public JTextField              getTxtDataAdmissao()    { return txtDataAdmissao; }
    public JTextField              getTxtDataDemissao()    { return txtDataDemissao; }
    public JComboBox<TipoRescisao>          getCmbTipoRescisao()    { return cmbTipoRescisao; }
    public JComboBox<calculo_salarios.model.ModalidadeAvisoPrevio> getCmbModalidadeAviso() { return cmbModalidadeAviso; }
    public JTextField                      getTxtSaldoFGTS()       { return txtSaldoFGTS; }
    public JComboBox<String>       getCmbFeriasVencidas()  { return cmbFeriasVencidas; }
    public JSpinner                getSpnDiasTrabalhados() { return spnDiasTrabalhados; }
    public JButton                 getBtnCalcular()        { return btnCalcular; }
    public JButton                 getBtnExportarPDF()     { return btnExportarPDF; }
    public JButton                 getBtnFechar()          { return btnFechar; }
    public String                  getNomeFuncionario()    { return nomeFuncionario; }
    public double                  getSalarioBruto()       { return salarioBruto; }
}
