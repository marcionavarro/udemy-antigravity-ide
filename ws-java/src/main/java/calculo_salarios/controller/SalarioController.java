package calculo_salarios.controller;

import calculo_salarios.model.CalculoSalarial;
import calculo_salarios.model.Funcionario;
import calculo_salarios.model.ResultadoSalarial;
import calculo_salarios.util.PdfExporter;
import calculo_salarios.view.MainView;
import calculo_salarios.view.RescisaoDialog;

import javax.swing.*;
import javax.swing.filechooser.FileNameExtensionFilter;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import java.awt.event.ActionListener;
import java.io.File;

/**
 * Controller principal — orquestra a interacao entre MainView e os models.
 *
 * Responsabilidades:
 *   - Registrar listeners nos campos de entrada da view
 *   - Capturar eventos em tempo real (DocumentListener, ChangeListener)
 *   - Montar o objeto Funcionario com os dados da view
 *   - Delegar o calculo ao CalculoSalarial (model)
 *   - Devolver o resultado formatado a view
 *   - Exportar o relatorio salarial em PDF
 *   - Abrir o RescisaoDialog quando solicitado
 */
public class SalarioController {

    private final MainView view;
    private Funcionario ultimoFuncionario;
    private ResultadoSalarial ultimoResultado;

    /**
     * Timer de debounce: aguarda 800ms apos o usuario parar de digitar
     * antes de registrar o calculo no historico. Evita entradas duplicadas
     * a cada tecla pressionada.
     */
    private Timer debounceHistorico;

    public SalarioController(MainView view) {
        this.view = view;
        registrarListeners();
    }

    // =========================================================
    // Registro de listeners (View -> Controller)
    // =========================================================
    private void registrarListeners() {

        // Calculo em tempo real ao alterar o salario
        view.getTxtSalario().getDocument().addDocumentListener(new DocumentListener() {
            public void insertUpdate(DocumentEvent e)  { calcularEmTempoReal(); }
            public void removeUpdate(DocumentEvent e)  { calcularEmTempoReal(); }
            public void changedUpdate(DocumentEvent e) { calcularEmTempoReal(); }
        });

        // Atualizacao da saudacao ao digitar o nome
        view.getTxtNome().getDocument().addDocumentListener(new DocumentListener() {
            public void insertUpdate(DocumentEvent e)  { atualizarSaudacao(); }
            public void removeUpdate(DocumentEvent e)  { atualizarSaudacao(); }
            public void changedUpdate(DocumentEvent e) { atualizarSaudacao(); }
        });

        // Calculo em tempo real ao alterar faltas e dependentes
        view.getSpnFaltas().addChangeListener(e -> calcularEmTempoReal());
        view.getSpnDependentes().addChangeListener(e -> calcularEmTempoReal());

        // Botao Limpar
        view.getBtnLimpar().addActionListener(e -> {
            ultimoFuncionario = null;
            ultimoResultado = null;
            view.limpar();
        });

        // Botao Exportar PDF
        view.getBtnExportarPDF().addActionListener(e -> exportarPDF());

        // Botao Ver Historico
        view.getBtnHistorico().addActionListener(e -> abrirDialogHistorico());

        // Botao Calcular Rescisao — abre o JDialog
        view.getBtnRescisao().addActionListener(e -> abrirDialogRescisao());
    }

    // =========================================================
    // Calculo em tempo real
    // =========================================================
    private void calcularEmTempoReal() {
        String textoSalario = view.getTxtSalario().getText().trim()
                .replace(",", ".");

        // Aguarda entrada valida; ignora silenciosamente entradas parciais
        if (textoSalario.isEmpty()) return;

        try {
            double salario     = Double.parseDouble(textoSalario);
            int    faltas      = (int) view.getSpnFaltas().getValue();
            int    dependentes = (int) view.getSpnDependentes().getValue();

            // Aviso de salario abaixo do minimo
            view.atualizarAvisoSalarioMinimo(salario);

            if (salario < 0) return;

            // Monta o model com os dados da view
            ultimoFuncionario = new Funcionario(
                    view.getNomeFuncionario(),
                    salario,
                    faltas,
                    dependentes
            );

            // Delega o calculo ao model (sem logica de negocio aqui)
            ultimoResultado = CalculoSalarial.calcularTudo(ultimoFuncionario);

            // Captura o resultado final para uso no lambda do timer
            final Funcionario funcParaHistorico = ultimoFuncionario;
            final ResultadoSalarial resParaHistorico = ultimoResultado;

            // Debounce: cancela o timer anterior e agenda novo registro no historico
            // Apenas o ultimo calculo (apos pausa de 800ms) sera salvo.
            if (debounceHistorico != null && debounceHistorico.isRunning()) {
                debounceHistorico.stop();
            }
            debounceHistorico = new Timer(800, (ActionListener) evt -> {
                calculo_salarios.service.HistoricoCalculosService.getInstance()
                        .adicionarCalculoSalarial(funcParaHistorico, resParaHistorico);
            });
            debounceHistorico.setRepeats(false);
            debounceHistorico.start();

            // Atualiza a view com os resultados — sempre na EDT
            SwingUtilities.invokeLater(() -> view.atualizarResultados(ultimoResultado));

        } catch (NumberFormatException e) {
            // Entrada invalida (usuario ainda digitando) — ignora silenciosamente
        }
    }

    // =========================================================
    // Exportacao em PDF
    // =========================================================
    private void exportarPDF() {
        if (ultimoFuncionario == null || ultimoResultado == null) {
            JOptionPane.showMessageDialog(view,
                    "Realize um calculo valido antes de exportar em PDF.",
                    "Exportar PDF", JOptionPane.WARNING_MESSAGE);
            return;
        }

        JFileChooser fileChooser = new JFileChooser();
        fileChooser.setDialogTitle("Salvar Relatorio Salarial em PDF");
        fileChooser.setFileFilter(new FileNameExtensionFilter("Documento PDF (*.pdf)", "pdf"));

        String nomePadrao = "Demonstrativo_Salarial_" +
                (ultimoFuncionario.nome().isBlank() ? "Funcionario" : ultimoFuncionario.nome().replaceAll("[^a-zA-Z0-9]", "_"))
                + ".pdf";
        fileChooser.setSelectedFile(new File(nomePadrao));

        int escolha = fileChooser.showSaveDialog(view);
        if (escolha == JFileChooser.APPROVE_OPTION) {
            File arquivo = fileChooser.getSelectedFile();
            if (!arquivo.getName().toLowerCase().endsWith(".pdf")) {
                arquivo = new File(arquivo.getAbsolutePath() + ".pdf");
            }

            try {
                PdfExporter.exportarRelatorioSalarial(arquivo, ultimoFuncionario, ultimoResultado);
                JOptionPane.showMessageDialog(view,
                        "Relatorio PDF gerado com sucesso!\nSalvo em: " + arquivo.getAbsolutePath(),
                        "Exportacao Concluida", JOptionPane.INFORMATION_MESSAGE);
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(view,
                        "Erro ao gerar o arquivo PDF: " + ex.getMessage(),
                        "Erro de Exportacao", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    // =========================================================
    // Atualizacao de saudacao
    // =========================================================
    private void atualizarSaudacao() {
        SwingUtilities.invokeLater(() -> view.atualizarSaudacao(view.getNomeFuncionario()));
    }

    // =========================================================
    // Abertura do dialog de rescisao
    // =========================================================
    private void abrirDialogRescisao() {
        // Tenta ler o salario atual da view; usa 0 se invalido
        double salario = 0;
        try {
            salario = Double.parseDouble(
                    view.getTxtSalario().getText().trim().replace(",", "."));
        } catch (NumberFormatException ignored) {
            // salario permanece 0
        }

        RescisaoDialog dialog = new RescisaoDialog(
                view,
                view.getNomeFuncionario(),
                salario
        );
        dialog.setVisible(true);
    }

    // =========================================================
    // Abertura do dialog de historico
    // =========================================================
    private void abrirDialogHistorico() {
        calculo_salarios.view.HistoricoDialog dialog = new calculo_salarios.view.HistoricoDialog(view);
        dialog.setVisible(true);
    }
}
