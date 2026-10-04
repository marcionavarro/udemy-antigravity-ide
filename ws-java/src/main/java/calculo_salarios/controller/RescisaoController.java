package calculo_salarios.controller;

import calculo_salarios.model.CalculoRescisorio;
import calculo_salarios.model.DadosRescisorio;
import calculo_salarios.model.ResultadoRescisorio;
import calculo_salarios.model.TipoRescisao;
import calculo_salarios.util.PdfExporter;
import calculo_salarios.view.RescisaoDialog;

import javax.swing.*;
import javax.swing.filechooser.FileNameExtensionFilter;
import java.io.File;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Controller do dialog de rescisao — orquestra a interacao entre
 * RescisaoDialog e os models CalculoRescisorio/DadosRescisorio.
 *
 * Responsabilidades:
 *   - Registrar listeners nos botoes do dialog
 *   - Validar e parsear as entradas (datas, valores numericos)
 *   - Montar o objeto DadosRescisorio
 *   - Delegar o calculo ao CalculoRescisorio (model)
 *   - Devolver o resultado ao dialog ou exibir mensagens de erro
 *   - Exportar o relatorio de rescisao em PDF
 */
public class RescisaoController {

    private final RescisaoDialog dialog;
    private static final DateTimeFormatter FORMATO_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private DadosRescisorio ultimosDados;
    private ResultadoRescisorio ultimoResultado;

    public RescisaoController(RescisaoDialog dialog) {
        this.dialog = dialog;
        registrarListeners();
    }

    // =========================================================
    // Registro de listeners
    // =========================================================
    private void registrarListeners() {
        dialog.getBtnCalcular().addActionListener(e -> calcular());
        dialog.getBtnExportarPDF().addActionListener(e -> exportarPDF());
        dialog.getBtnFechar().addActionListener(e -> dialog.dispose());
    }

    // =========================================================
    // Execucao do calculo rescisorio
    // =========================================================
    private void calcular() {
        try {
            // --- Validacao e parse das datas ---
            LocalDate admissao = parsearData(dialog.getTxtDataAdmissao().getText().trim());
            LocalDate demissao = parsearData(dialog.getTxtDataDemissao().getText().trim());

            if (admissao == null || demissao == null) {
                dialog.exibirErro("Data invalida. Use o formato DD/MM/AAAA (ex: 15/03/2020).");
                return;
            }

            if (!admissao.isBefore(demissao)) {
                dialog.exibirErro("A data de admissao deve ser anterior a data de demissao.");
                return;
            }

            // --- Tipo de rescisao e Modalidade do Aviso Previo ---
            TipoRescisao tipoRescisao = (TipoRescisao) dialog.getCmbTipoRescisao().getSelectedItem();
            calculo_salarios.model.ModalidadeAvisoPrevio modalidadeAviso = (calculo_salarios.model.ModalidadeAvisoPrevio) dialog.getCmbModalidadeAviso().getSelectedItem();

            // --- Saldo FGTS ---
            double saldoFGTS = 0;
            String textoFGTS = dialog.getTxtSaldoFGTS().getText().trim().replace(",", ".");
            if (!textoFGTS.isEmpty()) {
                try {
                    saldoFGTS = Double.parseDouble(textoFGTS);
                    if (saldoFGTS < 0) {
                        dialog.exibirErro("O saldo do FGTS nao pode ser negativo.");
                        return;
                    }
                } catch (NumberFormatException e) {
                    dialog.exibirErro("Valor do FGTS invalido. Use apenas numeros (ex: 8500.00).");
                    return;
                }
            }

            // --- Ferias vencidas ---
            boolean temFeriasVencidas = dialog.getCmbFeriasVencidas().getSelectedIndex() == 1;

            // --- Dias trabalhados no mes ---
            int diasTrabalhados = (int) dialog.getSpnDiasTrabalhados().getValue();

            // --- Monta o model de dados ---
            ultimosDados = new DadosRescisorio(
                    dialog.getNomeFuncionario(),
                    dialog.getSalarioBruto(),
                    admissao,
                    demissao,
                    tipoRescisao,
                    modalidadeAviso,
                    saldoFGTS,
                    temFeriasVencidas,
                    diasTrabalhados
            );

            // --- Delega o calculo ao model ---
            ultimoResultado = CalculoRescisorio.calcular(ultimosDados);

            // --- Registra no historico de calculos ---
            calculo_salarios.service.HistoricoCalculosService.getInstance()
                    .adicionarCalculoRescisorio(ultimosDados, ultimoResultado);

            // --- Envia o resultado ao dialog ---
            dialog.exibirResultado(ultimoResultado);

        } catch (Exception e) {
            dialog.exibirErro("Erro inesperado: " + e.getMessage());
        }
    }

    // =========================================================
    // Exportacao em PDF
    // =========================================================
    private void exportarPDF() {
        if (ultimosDados == null || ultimoResultado == null) {
            dialog.exibirErro("Realize o calculo antes de exportar o relatorio.");
            return;
        }

        JFileChooser fileChooser = new JFileChooser();
        fileChooser.setDialogTitle("Salvar Relatorio Rescisorio em PDF");
        fileChooser.setFileFilter(new FileNameExtensionFilter("Documento PDF (*.pdf)", "pdf"));

        String nomePadrao = "Demonstrativo_Rescisorio_" +
                (ultimosDados.nomeFuncionario().isBlank() ? "Funcionario" : ultimosDados.nomeFuncionario().replaceAll("[^a-zA-Z0-9]", "_"))
                + ".pdf";
        fileChooser.setSelectedFile(new File(nomePadrao));

        int escolha = fileChooser.showSaveDialog(dialog);
        if (escolha == JFileChooser.APPROVE_OPTION) {
            File arquivo = fileChooser.getSelectedFile();
            if (!arquivo.getName().toLowerCase().endsWith(".pdf")) {
                arquivo = new File(arquivo.getAbsolutePath() + ".pdf");
            }

            try {
                PdfExporter.exportarRelatorioRescisorio(arquivo, ultimosDados, ultimoResultado);
                JOptionPane.showMessageDialog(dialog,
                        "Relatorio Rescisorio gerado com sucesso!\nSalvo em: " + arquivo.getAbsolutePath(),
                        "Exportacao Concluida", JOptionPane.INFORMATION_MESSAGE);
            } catch (Exception ex) {
                dialog.exibirErro("Erro ao gerar o arquivo PDF: " + ex.getMessage());
            }
        }
    }

    // =========================================================
    // Helper: parse de data com tratamento seguro
    // =========================================================
    private LocalDate parsearData(String texto) {
        if (texto == null || texto.isBlank()) return null;
        try {
            return LocalDate.parse(texto, FORMATO_DATA);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
