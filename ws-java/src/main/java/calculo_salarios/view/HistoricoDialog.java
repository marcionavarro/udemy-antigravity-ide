package calculo_salarios.view;

import calculo_salarios.model.RegistroHistorico;
import calculo_salarios.service.HistoricoCalculosService;
import calculo_salarios.util.PdfExporter;
import com.formdev.flatlaf.FlatClientProperties;
import net.miginfocom.swing.MigLayout;

import javax.swing.*;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.filechooser.FileNameExtensionFilter;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableRowSorter;
import java.awt.*;
import java.io.File;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * JDialog para exibicao e gerenciamento da tabela de historico de calculos.
 */
public class HistoricoDialog extends JDialog {

    private final NumberFormat formatoMoeda = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
    private final DateTimeFormatter formatoDataHora = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private JTable tabela;
    private DefaultTableModel modelTabela;
    private TableRowSorter<DefaultTableModel> sorter;

    private JTextField txtFiltro;
    private JComboBox<String> cmbTipoFiltro;
    private JButton btnExportarPDF;
    private JButton btnLimparHistorico;
    private JButton btnFechar;

    public HistoricoDialog(JFrame parent) {
        super(parent, "Histórico de Cálculos Realizados — Tectreinamentos", true);
        initUI();
        carregarDados();
    }

    private void initUI() {
        setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
        setMinimumSize(new Dimension(780, 520));

        JPanel painelRaiz = new JPanel(new MigLayout("fill, insets 16, gapy 12"));
        painelRaiz.setBackground(MainView.COR_FUNDO);

        // Header
        JLabel lblTitulo = new JLabel("Histórico de Pessoas e Cálculos Cadastrados");
        lblTitulo.setFont(new Font("Segoe UI", Font.BOLD, 18));
        lblTitulo.setForeground(MainView.COR_PRIMARIA);
        painelRaiz.add(lblTitulo, "wrap");

        // Painel de Pesquisa / Filtro
        JPanel painelFiltro = new JPanel(new MigLayout("fillx, insets 0, gap 10"));
        painelFiltro.setBackground(MainView.COR_FUNDO);

        txtFiltro = new JTextField();
        txtFiltro.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        txtFiltro.putClientProperty(FlatClientProperties.PLACEHOLDER_TEXT, "Pesquisar por nome do funcionário...");
        txtFiltro.getDocument().addDocumentListener(new DocumentListener() {
            public void insertUpdate(DocumentEvent e)  { aplicarFiltros(); }
            public void removeUpdate(DocumentEvent e)  { aplicarFiltros(); }
            public void changedUpdate(DocumentEvent e) { aplicarFiltros(); }
        });

        cmbTipoFiltro = new JComboBox<>(new String[]{"Todos os Tipos", "Salarial Mensal", "Verbas Rescisórias"});
        cmbTipoFiltro.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        cmbTipoFiltro.addActionListener(e -> aplicarFiltros());

        painelFiltro.add(new JLabel("Filtrar:"), "");
        painelFiltro.add(txtFiltro, "growx, pushx");
        painelFiltro.add(cmbTipoFiltro, "w 160!");

        painelRaiz.add(painelFiltro, "growx, wrap");

        // Tabela de Histórico
        String[] colunas = {"#", "Data / Hora", "Nome do Funcionário", "Tipo de Cálculo", "Salário Bruto", "Valor Final"};
        modelTabela = new DefaultTableModel(colunas, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };

        tabela = new JTable(modelTabela);
        tabela.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        tabela.setRowHeight(26);
        tabela.getTableHeader().setFont(new Font("Segoe UI", Font.BOLD, 13));

        sorter = new TableRowSorter<>(modelTabela);
        tabela.setRowSorter(sorter);

        // Alinhamento de colunas
        DefaultTableCellRenderer renderDireita = new DefaultTableCellRenderer();
        renderDireita.setHorizontalAlignment(SwingConstants.RIGHT);
        tabela.getColumnModel().getColumn(4).setCellRenderer(renderDireita);
        tabela.getColumnModel().getColumn(5).setCellRenderer(renderDireita);

        tabela.getColumnModel().getColumn(0).setPreferredWidth(40);
        tabela.getColumnModel().getColumn(1).setPreferredWidth(140);
        tabela.getColumnModel().getColumn(2).setPreferredWidth(200);
        tabela.getColumnModel().getColumn(3).setPreferredWidth(140);

        JScrollPane scroll = new JScrollPane(tabela);
        painelRaiz.add(scroll, "grow, push, wrap");

        // Painel de Botoes
        JPanel painelBotoes = new JPanel(new MigLayout("fillx, insets 0, gap 10"));
        painelBotoes.setBackground(MainView.COR_FUNDO);

        btnExportarPDF = new JButton("Exportar PDF Selecionado");
        btnExportarPDF.setFont(new Font("Segoe UI", Font.BOLD, 13));
        btnExportarPDF.setBackground(new Color(46, 125, 50));
        btnExportarPDF.setForeground(Color.WHITE);
        btnExportarPDF.setFocusPainted(false);
        btnExportarPDF.addActionListener(e -> exportarPDFSelecionado());

        btnLimparHistorico = new JButton("Limpar Histórico");
        btnLimparHistorico.setFont(new Font("Segoe UI", Font.BOLD, 13));
        btnLimparHistorico.setBackground(new Color(198, 40, 40));
        btnLimparHistorico.setForeground(Color.WHITE);
        btnLimparHistorico.setFocusPainted(false);
        btnLimparHistorico.addActionListener(e -> limparHistorico());

        btnFechar = new JButton("Fechar");
        btnFechar.setFont(new Font("Segoe UI", Font.BOLD, 13));
        btnFechar.setFocusPainted(false);
        btnFechar.addActionListener(e -> dispose());

        painelBotoes.add(btnExportarPDF, "h 38!");
        painelBotoes.add(btnLimparHistorico, "h 38!");
        painelBotoes.add(btnFechar, "h 38!, al right, w 100!");

        painelRaiz.add(painelBotoes, "growx");

        setContentPane(painelRaiz);
        pack();
        setLocationRelativeTo(getParent());
    }

    public void carregarDados() {
        modelTabela.setRowCount(0);
        List<RegistroHistorico> lista = HistoricoCalculosService.getInstance().getHistorico();

        for (RegistroHistorico r : lista) {
            modelTabela.addRow(new Object[]{
                    r.id(),
                    r.dataHora().format(formatoDataHora),
                    r.nomeFuncionario(),
                    r.tipoCalculo(),
                    formatoMoeda.format(r.salarioBruto()),
                    formatoMoeda.format(r.valorFinal())
            });
        }
    }

    private void aplicarFiltros() {
        String texto = txtFiltro.getText().trim();
        String tipo = (String) cmbTipoFiltro.getSelectedItem();

        RowFilter<DefaultTableModel, Object> rf = new RowFilter<>() {
            @Override
            public boolean include(Entry<? extends DefaultTableModel, ?> entry) {
                String nome = entry.getStringValue(2).toLowerCase();
                String tipoRow = entry.getStringValue(3);

                boolean matchNome = texto.isEmpty() || nome.contains(texto.toLowerCase());
                boolean matchTipo = "Todos os Tipos".equals(tipo) || tipoRow.equalsIgnoreCase(tipo);

                return matchNome && matchTipo;
            }
        };

        sorter.setRowFilter(rf);
    }

    private void exportarPDFSelecionado() {
        int linhaSelecionada = tabela.getSelectedRow();
        if (linhaSelecionada < 0) {
            JOptionPane.showMessageDialog(this,
                    "Selecione um registro na tabela para exportar em PDF.",
                    "Exportar PDF", JOptionPane.WARNING_MESSAGE);
            return;
        }

        int indexModel = tabela.convertRowIndexToModel(linhaSelecionada);
        long id = (long) modelTabela.getValueAt(indexModel, 0);

        RegistroHistorico registro = HistoricoCalculosService.getInstance().getHistorico()
                .stream().filter(r -> r.id() == id).findFirst().orElse(null);

        if (registro == null) return;

        JFileChooser fileChooser = new JFileChooser();
        fileChooser.setDialogTitle("Salvar PDF do Histórico");
        fileChooser.setFileFilter(new FileNameExtensionFilter("Documento PDF (*.pdf)", "pdf"));

        String nomePadrao = "Relatorio_" + registro.tipoCalculo().replace(" ", "_") + "_" +
                registro.nomeFuncionario().replaceAll("[^a-zA-Z0-9]", "_") + ".pdf";
        fileChooser.setSelectedFile(new File(nomePadrao));

        if (fileChooser.showSaveDialog(this) == JFileChooser.APPROVE_OPTION) {
            File arquivo = fileChooser.getSelectedFile();
            if (!arquivo.getName().toLowerCase().endsWith(".pdf")) {
                arquivo = new File(arquivo.getAbsolutePath() + ".pdf");
            }

            try {
                if ("Salarial Mensal".equalsIgnoreCase(registro.tipoCalculo()) && registro.objetoSalarial() != null) {
                    PdfExporter.exportarRelatorioSalarial(arquivo, registro.funcionario(), registro.objetoSalarial());
                } else if (registro.objetoRescisorio() != null) {
                    PdfExporter.exportarRelatorioRescisorio(arquivo, registro.dadosRescisorio(), registro.objetoRescisorio());
                }
                JOptionPane.showMessageDialog(this,
                        "Relatório PDF gerado com sucesso!\nSalvo em: " + arquivo.getAbsolutePath(),
                        "Sucesso", JOptionPane.INFORMATION_MESSAGE);
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this,
                        "Erro ao gerar PDF: " + ex.getMessage(),
                        "Erro", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void limparHistorico() {
        if (modelTabela.getRowCount() == 0) return;

        int resp = JOptionPane.showConfirmDialog(this,
                "Deseja realmente limpar todo o histórico de cálculos?",
                "Confirmar Limpeza", JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE);

        if (resp == JOptionPane.YES_OPTION) {
            HistoricoCalculosService.getInstance().limparHistorico();
            carregarDados();
        }
    }
}
