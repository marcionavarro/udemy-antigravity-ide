package calculo_salarios.view;

import calculo_salarios.model.CalculoSalarial;
import calculo_salarios.model.ResultadoSalarial;
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
 * View principal do sistema de calculo salarial.
 * Responsabilidade exclusiva: exibir dados e encaminhar eventos ao controller.
 * Nenhuma logica de negocio deve residir aqui.
 *
 * Tectreinamentos Informatica LTDA.
 * Departamento de RH e Departamento Pessoal
 */
public class MainView extends JFrame {

    // =========================================================
    // Paleta de cores corporativa
    // =========================================================
    static final Color COR_PRIMARIA     = new Color(21, 101, 192);   // #1565C0 - Azul corporativo
    static final Color COR_SECUNDARIA   = new Color(13, 71, 161);    // #0D47A1 - Azul escuro
    static final Color COR_HEADER_TEXT  = new Color(187, 222, 251);  // #BBDEFB - Azul claro
    static final Color COR_SAUDACAO     = new Color(144, 202, 249);  // #90CAF9 - Azul muito claro
    static final Color COR_SUCESSO      = new Color(27, 94, 32);     // #1B5E20 - Verde escuro
    static final Color COR_ATENCAO      = new Color(183, 28, 28);    // #B71C1C - Vermelho
    static final Color COR_ALERTA       = new Color(230, 81, 0);     // #E65100 - Laranja
    static final Color COR_FUNDO        = new Color(245, 247, 250);  // #F5F7FA - Cinza claro
    static final Color COR_CARTAO       = Color.WHITE;
    static final Color COR_BORDA        = new Color(218, 228, 240);  // #DAE4F0

    // =========================================================
    // Fontes
    // =========================================================
    private static final String FONTE = "Segoe UI";

    // =========================================================
    // Componentes — Entradas
    // =========================================================
    private JTextField txtNome;
    private JTextField txtSalario;
    private JSpinner   spnFaltas;
    private JSpinner   spnDependentes;

    // =========================================================
    // Componentes — Resultados
    // =========================================================
    private JLabel lblSaudacao;
    private JLabel lblAvisoMinimo;
    private JLabel lblDescontoINSS;
    private JLabel lblDescontoIRRF;
    private JLabel lblDescontoFaltas;
    private JLabel lblSalarioLiquido;
    private JLabel lblRendaAnual;
    private JLabel lblDecimoTerceiro;
    private JLabel lblFerias;
    private JLabel lblDiasFerias;

    // =========================================================
    // Botoes de acao
    // =========================================================
    private JButton btnLimpar;
    private JButton btnExportarPDF;
    private JButton btnHistorico;
    private JButton btnRescisao;

    private final NumberFormat formatoMoeda = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));

    // =========================================================
    // Construtor
    // =========================================================
    public MainView() {
        initUI();
    }

    // =========================================================
    // Inicializacao e montagem da interface
    // =========================================================
    private void initUI() {
        setTitle("Tectreinamentos Informatica LTDA. — Sistema de RH");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(600, 820));

        JPanel painelRaiz = new JPanel(new MigLayout("fill, insets 0, gapy 0"));
        painelRaiz.setBackground(COR_FUNDO);

        painelRaiz.add(criarPainelHeader(), "growx, wrap");

        JPanel painelConteudo = new JPanel(new MigLayout("fillx, insets 20 22 20 22, gapy 14"));
        painelConteudo.setBackground(COR_FUNDO);
        painelConteudo.add(criarPainelEntradas(), "growx, wrap");
        painelConteudo.add(criarPainelResultados(), "growx, wrap");
        painelConteudo.add(criarPainelBotoes(), "growx, wrap");
        painelConteudo.add(criarRodape(), "growx, al center");

        painelRaiz.add(painelConteudo, "growx");
        setContentPane(painelRaiz);

        pack();
        setLocationRelativeTo(null);
    }

    // =========================================================
    // Header corporativo
    // =========================================================
    private JPanel criarPainelHeader() {
        JPanel header = new JPanel(new MigLayout("fillx, insets 18 25 18 25, gapy 4"));
        header.setBackground(COR_PRIMARIA);

        JLabel lblEmpresa = new JLabel("Tectreinamentos Informatica LTDA.");
        lblEmpresa.setFont(new Font(FONTE, Font.BOLD, 20));
        lblEmpresa.setForeground(Color.WHITE);

        JLabel lblDepto = new JLabel("Departamento de RH e Departamento Pessoal");
        lblDepto.setFont(new Font(FONTE, Font.PLAIN, 13));
        lblDepto.setForeground(COR_HEADER_TEXT);

        lblSaudacao = new JLabel("Bem-vindo(a)! Informe seus dados para calcular em tempo real.");
        lblSaudacao.setFont(new Font(FONTE, Font.ITALIC, 12));
        lblSaudacao.setForeground(COR_SAUDACAO);

        header.add(lblEmpresa, "wrap");
        header.add(lblDepto, "wrap");
        header.add(lblSaudacao);

        return header;
    }

    // =========================================================
    // Painel de entradas do usuario
    // =========================================================
    private JPanel criarPainelEntradas() {
        JPanel cartao = criarCartao("Dados do Funcionario(a)");
        Font fonteLabel = new Font(FONTE, Font.BOLD, 13);
        Font fonteInfo  = new Font(FONTE, Font.ITALIC, 11);

        // --- Nome ---
        JLabel lblNome = new JLabel("Seu Nome Completo:");
        lblNome.setFont(fonteLabel);
        txtNome = new JTextField();
        txtNome.setFont(new Font(FONTE, Font.PLAIN, 14));
        txtNome.putClientProperty(FlatClientProperties.PLACEHOLDER_TEXT, "Ex: Maria Oliveira");
        txtNome.setToolTipText("Insira seu nome completo para personalizacao da interface");

        // --- Salario ---
        JLabel lblSalario = new JLabel("Salario Bruto Mensal (R$):");
        lblSalario.setFont(fonteLabel);
        txtSalario = new JTextField();
        txtSalario.setFont(new Font(FONTE, Font.PLAIN, 14));
        txtSalario.putClientProperty(FlatClientProperties.PLACEHOLDER_TEXT, "Ex: 3500.00");
        txtSalario.setToolTipText("Informe o salario bruto mensal em reais (use ponto ou virgula para decimais)");

        lblAvisoMinimo = new JLabel(" ");
        lblAvisoMinimo.setFont(fonteInfo);
        lblAvisoMinimo.setForeground(COR_ALERTA);

        // --- Faltas ---
        JLabel lblFaltas = new JLabel("Numero de Faltas Injustificadas no Mes:");
        lblFaltas.setFont(fonteLabel);
        spnFaltas = new JSpinner(new SpinnerNumberModel(0, 0, 31, 1));
        spnFaltas.setFont(new Font(FONTE, Font.PLAIN, 14));
        spnFaltas.setToolTipText(
                "Desconto: valor do dia (salario/30) + DSR (Descanso Semanal Remunerado) por semana com falta");
        configurarEditor(spnFaltas);

        JLabel lblFaltasInfo = new JLabel(
                "  Desconto = dia nao trabalhado + DSR da semana  |  Impacto nas ferias conforme CLT Art. 130");
        lblFaltasInfo.setFont(fonteInfo);
        lblFaltasInfo.setForeground(Color.GRAY);

        // --- Dependentes IRRF ---
        JLabel lblDep = new JLabel("Numero de Dependentes para IRRF:");
        lblDep.setFont(fonteLabel);
        spnDependentes = new JSpinner(new SpinnerNumberModel(0, 0, 20, 1));
        spnDependentes.setFont(new Font(FONTE, Font.PLAIN, 14));
        spnDependentes.setToolTipText("Cada dependente deduz R$ 189,59 da base de calculo do IRRF (Tabela mai/2025)");
        configurarEditor(spnDependentes);

        JLabel lblDepInfo = new JLabel("  Deducao por dependente: R$ 189,59 (Tabela IRRF mai/2025)");
        lblDepInfo.setFont(fonteInfo);
        lblDepInfo.setForeground(Color.GRAY);

        // --- Layout ---
        cartao.add(lblNome, "wrap");
        cartao.add(txtNome, "growx, wrap");
        cartao.add(Box.createVerticalStrut(4), "wrap");

        cartao.add(lblSalario, "wrap");
        cartao.add(txtSalario, "growx, wrap");
        cartao.add(lblAvisoMinimo, "wrap, gapy 0 2");

        cartao.add(lblFaltas, "wrap");
        cartao.add(spnFaltas, "w 90!, wrap");
        cartao.add(lblFaltasInfo, "wrap, gapy 0 4");

        cartao.add(lblDep, "wrap");
        cartao.add(spnDependentes, "w 90!, wrap");
        cartao.add(lblDepInfo, "wrap");

        return cartao;
    }

    // =========================================================
    // Painel de resultados em tempo real
    // =========================================================
    private JPanel criarPainelResultados() {
        JPanel cartao = criarCartao("Resultados em Tempo Real");

        // Subtitulo da secao de descontos
        JLabel lblSubDescontos = new JLabel("DESCONTOS:");
        lblSubDescontos.setFont(new Font(FONTE, Font.BOLD, 11));
        lblSubDescontos.setForeground(Color.GRAY);
        cartao.add(lblSubDescontos, "span 2, wrap, gapy 0 2");

        lblDescontoINSS   = adicionarLinhaResultado(cartao, "  Desconto INSS (Tabela Progressiva 2025):", "—", Color.GRAY);
        lblDescontoIRRF   = adicionarLinhaResultado(cartao, "  Desconto IRRF (Tabela mai/2025):", "—", Color.GRAY);
        lblDescontoFaltas = adicionarLinhaResultado(cartao, "  Desconto Faltas + DSR (CLT Art. 473):", "—", Color.GRAY);

        // Separador
        JSeparator sep = new JSeparator();
        sep.setForeground(COR_BORDA);
        cartao.add(sep, "span 2, growx, wrap, gapy 8 8");

        // Subtitulo dos ganhos
        JLabel lblSubGanhos = new JLabel("GANHOS E PROJECOES:");
        lblSubGanhos.setFont(new Font(FONTE, Font.BOLD, 11));
        lblSubGanhos.setForeground(Color.GRAY);
        cartao.add(lblSubGanhos, "span 2, wrap, gapy 0 2");

        lblSalarioLiquido = adicionarLinhaResultado(cartao, "  Salario Liquido Mensal:", "—", Color.GRAY);
        lblRendaAnual     = adicionarLinhaResultado(cartao, "  Projecao Anual (12 meses):", "—", Color.GRAY);
        lblDecimoTerceiro = adicionarLinhaResultado(cartao, "  13o Salario (referencia 1 competencia):", "—", Color.GRAY);
        lblFerias         = adicionarLinhaResultado(cartao, "  Ferias + 1/3 Constitucional:", "—", Color.GRAY);
        lblDiasFerias     = adicionarLinhaResultado(cartao, "  Direito a Ferias (CLT Art. 130):", "—", Color.GRAY);

        return cartao;
    }

    // =========================================================
    // Painel de botoes de acao
    // =========================================================
    private JPanel criarPainelBotoes() {
        JPanel painel = new JPanel(new MigLayout("fillx, insets 0, gap 8"));
        painel.setBackground(COR_FUNDO);

        btnLimpar = new JButton("Limpar");
        btnLimpar.setFont(new Font(FONTE, Font.BOLD, 14));
        btnLimpar.setBackground(new Color(198, 40, 40));
        btnLimpar.setForeground(Color.WHITE);
        btnLimpar.setFocusPainted(false);
        btnLimpar.setToolTipText("Limpa todos os campos para um novo calculo");

        btnExportarPDF = new JButton("Exportar PDF");
        btnExportarPDF.setFont(new Font(FONTE, Font.BOLD, 14));
        btnExportarPDF.setBackground(new Color(46, 125, 50));
        btnExportarPDF.setForeground(Color.WHITE);
        btnExportarPDF.setFocusPainted(false);
        btnExportarPDF.setEnabled(false);
        btnExportarPDF.setToolTipText("Gera um relatorio em formato PDF dos resultados calculados");

        btnHistorico = new JButton("Ver Histórico");
        btnHistorico.setFont(new Font(FONTE, Font.BOLD, 14));
        btnHistorico.setBackground(new Color(123, 31, 162)); // Roxo corporativo #7B1FA2
        btnHistorico.setForeground(Color.WHITE);
        btnHistorico.setFocusPainted(false);
        btnHistorico.setToolTipText("Abre a tabela de historico de calculos realizados");

        btnRescisao = new JButton("Calcular Rescisao");
        btnRescisao.setFont(new Font(FONTE, Font.BOLD, 14));
        btnRescisao.setBackground(COR_PRIMARIA);
        btnRescisao.setForeground(Color.WHITE);
        btnRescisao.setFocusPainted(false);
        btnRescisao.setToolTipText("Abre a calculadora de verbas rescisórias");

        painel.add(btnLimpar,      "h 44!, w 100!");
        painel.add(btnExportarPDF, "h 44!, w 140!");
        painel.add(btnHistorico,   "h 44!, w 140!");
        painel.add(btnRescisao,    "h 44!, pushx, growx");

        return painel;
    }

    // =========================================================
    // Rodape
    // =========================================================
    private JLabel criarRodape() {
        JLabel rodape = new JLabel(
                "Tectreinamentos Informatica LTDA.  |  Sistema v2.0  |  Tabelas: INSS/IRRF 2025");
        rodape.setFont(new Font(FONTE, Font.ITALIC, 11));
        rodape.setForeground(Color.GRAY);
        rodape.setHorizontalAlignment(SwingConstants.CENTER);
        return rodape;
    }

    // =========================================================
    // Helpers de construcao de UI
    // =========================================================

    /** Cria um cartao (card) com borda suave e titulo de secao. */
    private JPanel criarCartao(String titulo) {
        JPanel cartao = new JPanel(new MigLayout("fillx, insets 16 18 16 18, gapy 5", "[grow][]"));
        cartao.setBackground(COR_CARTAO);
        cartao.setBorder(new CompoundBorder(
                new LineBorder(COR_BORDA, 1, true),
                new EmptyBorder(4, 4, 4, 4)
        ));

        JLabel lblTitulo = new JLabel(titulo);
        lblTitulo.setFont(new Font(FONTE, Font.BOLD, 13));
        lblTitulo.setForeground(COR_PRIMARIA);
        cartao.add(lblTitulo, "span 2, wrap, gapy 0 6");

        JSeparator separador = new JSeparator();
        separador.setForeground(new Color(200, 215, 235));
        cartao.add(separador, "span 2, growx, wrap, gapy 0 8");

        return cartao;
    }

    /** Adiciona uma linha chave-valor no painel de resultados e retorna o label do valor. */
    private JLabel adicionarLinhaResultado(JPanel painel, String chave, String valorInicial, Color cor) {
        JLabel lblChave = new JLabel(chave);
        lblChave.setFont(new Font(FONTE, Font.PLAIN, 13));

        JLabel lblValor = new JLabel(valorInicial);
        lblValor.setFont(new Font(FONTE, Font.BOLD, 13));
        lblValor.setForeground(cor);
        lblValor.setHorizontalAlignment(SwingConstants.RIGHT);

        painel.add(lblChave, "");
        painel.add(lblValor, "al right, wrap");

        return lblValor;
    }

    /** Configura o editor de um JSpinner com a fonte correta. */
    private void configurarEditor(JSpinner spinner) {
        JComponent editor = spinner.getEditor();
        if (editor instanceof JSpinner.DefaultEditor de) {
            de.getTextField().setFont(new Font(FONTE, Font.PLAIN, 14));
            de.getTextField().setHorizontalAlignment(JTextField.LEFT);
        }
    }

    // =========================================================
    // API Publica — chamada pelo Controller
    // =========================================================

    /**
     * Atualiza todos os labels de resultado com os valores calculados.
     * Deve ser chamado na EDT (Event Dispatch Thread).
     */
    public void atualizarResultados(ResultadoSalarial r) {
        // Descontos (valores negativos para o funcionario -> usar cor de alerta)
        atualizarValorDesconto(lblDescontoINSS,   r.descontoINSS(),   "—");
        atualizarValorDesconto(lblDescontoIRRF,   r.descontoIRRF(),   "Isento");
        atualizarValorDesconto(lblDescontoFaltas, r.descontoFaltas(), "Sem desconto");

        // Salario liquido — destaque verde
        lblSalarioLiquido.setText(formatoMoeda.format(r.salarioLiquido()));
        lblSalarioLiquido.setForeground(COR_SUCESSO);
        lblSalarioLiquido.setFont(new Font(FONTE, Font.BOLD, 14));

        // Projecoes — destaque azul
        lblRendaAnual.setText(formatoMoeda.format(r.rendaAnual()));
        lblRendaAnual.setForeground(COR_PRIMARIA);

        lblDecimoTerceiro.setText(formatoMoeda.format(r.decimoTerceiro()));
        lblDecimoTerceiro.setForeground(COR_PRIMARIA);

        lblFerias.setText(formatoMoeda.format(r.ferias()));
        lblFerias.setForeground(COR_PRIMARIA);

        // Dias de ferias — com aviso se perda de direito
        if (r.diasFerias() > 0) {
            lblDiasFerias.setText(r.diasFerias() + " dias");
            lblDiasFerias.setForeground(COR_SUCESSO);
        } else {
            lblDiasFerias.setText("Sem direito (acima de 32 faltas)");
            lblDiasFerias.setForeground(COR_ATENCAO);
        }

        btnExportarPDF.setEnabled(true);
    }

    /** Atualiza um label de desconto com cor e valor conforme o resultado. */
    private void atualizarValorDesconto(JLabel label, double valor, String textoZero) {
        if (valor > 0) {
            label.setText(formatoMoeda.format(valor));
            label.setForeground(COR_ALERTA);
        } else {
            label.setText(textoZero);
            label.setForeground(new Color(46, 125, 50));
        }
    }

    /** Atualiza a mensagem de saudacao no header com o nome do funcionario. */
    public void atualizarSaudacao(String nome) {
        if (nome == null || nome.isBlank()) {
            lblSaudacao.setText("Bem-vindo(a)! Informe seus dados para calcular em tempo real.");
        } else {
            lblSaudacao.setText("Ola, " + nome + "! Seus resultados estao sendo calculados em tempo real.");
        }
    }

    /** Exibe ou oculta o aviso de salario abaixo do minimo. */
    public void atualizarAvisoSalarioMinimo(double salario) {
        if (salario > 0 && salario < CalculoSalarial.SALARIO_MINIMO_2025) {
            lblAvisoMinimo.setText(
                    "  Atencao: salario abaixo do minimo vigente (R$ 1.518,00 — 2025)");
        } else {
            lblAvisoMinimo.setText(" ");
        }
    }

    /** Limpa todos os campos e reseta os resultados. */
    public void limpar() {
        txtNome.setText("");
        txtSalario.setText("");
        spnFaltas.setValue(0);
        spnDependentes.setValue(0);
        lblSaudacao.setText("Bem-vindo(a)! Informe seus dados para calcular em tempo real.");
        lblAvisoMinimo.setText(" ");

        resetarLabelResultado(lblDescontoINSS);
        resetarLabelResultado(lblDescontoIRRF);
        resetarLabelResultado(lblDescontoFaltas);
        resetarLabelResultado(lblSalarioLiquido);
        resetarLabelResultado(lblRendaAnual);
        resetarLabelResultado(lblDecimoTerceiro);
        resetarLabelResultado(lblFerias);
        resetarLabelResultado(lblDiasFerias);

        btnExportarPDF.setEnabled(false);
        txtNome.requestFocusInWindow();
    }

    /** Volta um label de resultado ao estado inicial. */
    private void resetarLabelResultado(JLabel label) {
        label.setText("—");
        label.setForeground(Color.GRAY);
        label.setFont(new Font(FONTE, Font.BOLD, 13));
    }

    // =========================================================
    // Getters — expostos ao Controller (nao ao Model)
    // =========================================================
    public JTextField getTxtNome()         { return txtNome; }
    public JTextField getTxtSalario()      { return txtSalario; }
    public JSpinner   getSpnFaltas()       { return spnFaltas; }
    public JSpinner   getSpnDependentes()  { return spnDependentes; }
    public JButton    getBtnLimpar()       { return btnLimpar; }
    public JButton    getBtnRescisao()     { return btnRescisao; }
    public JButton    getBtnExportarPDF()  { return btnExportarPDF; }
    public JButton    getBtnHistorico()    { return btnHistorico; }
    public String     getNomeFuncionario() { return txtNome.getText().trim(); }
}
