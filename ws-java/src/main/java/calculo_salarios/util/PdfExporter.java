package calculo_salarios.util;

import calculo_salarios.model.*;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.Color;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Utilitario para exportacao de relatorios em PDF com layout corporativo.
 * Utiliza a biblioteca OpenPDF (com.lowagie.text).
 */
public class PdfExporter {

    private static final NumberFormat MOEDA = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
    private static final DateTimeFormatter FORMATO_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FORMATO_DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // Cores do tema corporativo
    private static final Color COR_PRIMARIA   = new Color(21, 101, 192);   // Azul corporativo #1565C0
    private static final Color COR_SECUNDARIA = new Color(13, 71, 161);    // Azul escuro #0D47A1
    private static final Color COR_CINZA_FUNDO= new Color(245, 247, 250);  // Cinza claro #F5F7FA
    private static final Color COR_BORDA      = new Color(218, 228, 240);  // Borda suave
    private static final Color COR_TEXTO      = new Color(33, 33, 33);     // Texto escuro
    private static final Color COR_VERDE      = new Color(27, 94, 32);     // Verde sucesso
    private static final Color COR_VERMELHO   = new Color(183, 28, 28);    // Vermelho alerta

    // Fontes
    private static final Font FONT_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, COR_PRIMARIA);
    private static final Font FONT_SUBTITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, COR_SECUNDARIA);
    private static final Font FONT_CABECALHO_TABELA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
    private static final Font FONT_CORPO = FontFactory.getFont(FontFactory.HELVETICA, 10, COR_TEXTO);
    private static final Font FONT_CORPO_NEGRITO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, COR_TEXTO);
    private static final Font FONT_DESTAQUE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, COR_VERDE);
    private static final Font FONT_RODAPE = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY);

    /**
     * Exporta o demonstrativo salarial mensal para PDF.
     */
    public static void exportarRelatorioSalarial(File destino, Funcionario f, ResultadoSalarial r) throws IOException, DocumentException {
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(doc, new FileOutputStream(destino));
        doc.open();

        // Header
        adicionarCabecalho(doc, "DEMONSTRATIVO DE CÁLCULO SALARIAL MENSAL");

        // Informacoes do Funcionario
        doc.add(new Paragraph("Dados do Funcionário", FONT_SUBTITULO));
        doc.add(Chunk.NEWLINE);

        PdfPTable tabelaFunc = new PdfPTable(2);
        tabelaFunc.setWidthPercentage(100);
        tabelaFunc.setWidths(new float[]{1, 2});

        adicionarLinhaTabelaInfo(tabelaFunc, "Nome do Funcionário:", f.nome().isBlank() ? "Não informado" : f.nome());
        adicionarLinhaTabelaInfo(tabelaFunc, "Salário Bruto:", MOEDA.format(r.salarioBruto()));
        adicionarLinhaTabelaInfo(tabelaFunc, "Faltas Injustificadas:", f.numeroFaltas() + " dia(s)");
        adicionarLinhaTabelaInfo(tabelaFunc, "Dependentes IRRF:", f.dependentesIRRF() + " dependente(s)");
        doc.add(tabelaFunc);
        doc.add(Chunk.NEWLINE);

        // Tabela de Descontos
        doc.add(new Paragraph("Discriminação dos Descontos", FONT_SUBTITULO));
        doc.add(Chunk.NEWLINE);

        PdfPTable tabelaDescontos = new PdfPTable(3);
        tabelaDescontos.setWidthPercentage(100);
        tabelaDescontos.setWidths(new float[]{3, 2, 2});

        adicionarCabecalhoTabela(tabelaDescontos, "Rubrica", "Referência", "Valor Desconto");
        adicionarLinhaValores(tabelaDescontos, "INSS (Tabela Progressiva 2025)", "Portaria MPS/MF", MOEDA.format(r.descontoINSS()), COR_VERMELHO);
        adicionarLinhaValores(tabelaDescontos, "IRRF (Tabela Mensal 2025)", f.dependentesIRRF() + " dep.", r.descontoIRRF() > 0 ? MOEDA.format(r.descontoIRRF()) : "Isento", r.descontoIRRF() > 0 ? COR_VERMELHO : COR_VERDE);
        adicionarLinhaValores(tabelaDescontos, "Faltas + DSR (CLT Art. 473)", f.numeroFaltas() + " dia(s)", r.descontoFaltas() > 0 ? MOEDA.format(r.descontoFaltas()) : "R$ 0,00", r.descontoFaltas() > 0 ? COR_VERMELHO : COR_TEXTO);

        doc.add(tabelaDescontos);
        doc.add(Chunk.NEWLINE);

        // Tabela de Projecoes e Ganhos
        doc.add(new Paragraph("Ganhos Líquidos e Projeções", FONT_SUBTITULO));
        doc.add(Chunk.NEWLINE);

        PdfPTable tabelaGanhos = new PdfPTable(2);
        tabelaGanhos.setWidthPercentage(100);
        tabelaGanhos.setWidths(new float[]{3, 2});

        adicionarLinhaDestaque(tabelaGanhos, "SALÁRIO LÍQUIDO MENSAL:", MOEDA.format(r.salarioLiquido()), FONT_DESTAQUE);
        adicionarLinhaValores(tabelaGanhos, "Projeção de Renda Anual (12 meses)", "-", MOEDA.format(r.rendaAnual()), COR_PRIMARIA);
        adicionarLinhaValores(tabelaGanhos, "13º Salário (1 competência)", "-", MOEDA.format(r.decimoTerceiro()), COR_PRIMARIA);
        adicionarLinhaValores(tabelaGanhos, "Férias + 1/3 Constitucional", r.diasFerias() + " dias de direito", MOEDA.format(r.ferias()), COR_PRIMARIA);

        doc.add(tabelaGanhos);
        doc.add(Chunk.NEWLINE);

        adicionarRodape(doc);
        doc.close();
    }

    /**
     * Exporta o demonstrativo de verbas rescisórias para PDF.
     */
    public static void exportarRelatorioRescisorio(File destino, DadosRescisorio dados, ResultadoRescisorio r) throws IOException, DocumentException {
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(doc, new FileOutputStream(destino));
        doc.open();

        // Header
        adicionarCabecalho(doc, "DEMONSTRATIVO DE VERBAS RESCISÓRIAS");

        // Informacoes da Rescisao
        doc.add(new Paragraph("Dados do Contrato e Desligamento", FONT_SUBTITULO));
        doc.add(Chunk.NEWLINE);

        PdfPTable tabelaContrato = new PdfPTable(2);
        tabelaContrato.setWidthPercentage(100);
        tabelaContrato.setWidths(new float[]{1, 2});

        adicionarLinhaTabelaInfo(tabelaContrato, "Nome do Funcionário:", r.nomeFuncionario().isBlank() ? "Não informado" : r.nomeFuncionario());
        adicionarLinhaTabelaInfo(tabelaContrato, "Salário Bruto:", MOEDA.format(dados.salarioBruto()));
        adicionarLinhaTabelaInfo(tabelaContrato, "Data de Admissão:", dados.dataAdmissao().format(FORMATO_DATA));
        adicionarLinhaTabelaInfo(tabelaContrato, "Data de Demissão:", dados.dataDemissao().format(FORMATO_DATA));
        adicionarLinhaTabelaInfo(tabelaContrato, "Tempo de Serviço:", r.anosServico() + " ano(s) e " + r.mesesServico() + " mês(es)");
        adicionarLinhaTabelaInfo(tabelaContrato, "Modalidade de Rescisão:", dados.tipoRescisao().toString());
        adicionarLinhaTabelaInfo(tabelaContrato, "Saldo do FGTS Declarado:", MOEDA.format(dados.saldoFGTS()));
        adicionarLinhaTabelaInfo(tabelaContrato, "Férias Vencidas:", dados.temFeriasVencidas() ? "Sim" : "Não");
        adicionarLinhaTabelaInfo(tabelaContrato, "Dias Efetivos no Mês de Saída:", dados.diasTrabalhadosNoMes() + " dia(s)");

        doc.add(tabelaContrato);
        doc.add(Chunk.NEWLINE);

        // Detalhamento das Verbas
        doc.add(new Paragraph("Discriminação das Verbas Rescisórias", FONT_SUBTITULO));
        doc.add(Chunk.NEWLINE);

        PdfPTable tabelaVerbas = new PdfPTable(2);
        tabelaVerbas.setWidthPercentage(100);
        tabelaVerbas.setWidths(new float[]{3, 2});

        adicionarCabecalhoTabela(tabelaVerbas, "Verba Rescisória", "Valor (R$)");

        adicionarLinhaValores(tabelaVerbas, "Saldo de Salário (" + dados.diasTrabalhadosNoMes() + " dias)", "-", MOEDA.format(r.saldoSalario()), COR_TEXTO);
        adicionarLinhaValores(tabelaVerbas, "13º Salário Proporcional", "-", r.decimoTerceiroProporcional() > 0 ? MOEDA.format(r.decimoTerceiroProporcional()) : "Não aplicável", COR_TEXTO);
        adicionarLinhaValores(tabelaVerbas, "Férias Proporcionais", "-", r.feriasProporcional() > 0 ? MOEDA.format(r.feriasProporcional()) : "Não aplicável", COR_TEXTO);
        adicionarLinhaValores(tabelaVerbas, "Férias Vencidas", "-", r.feriasVencidas() > 0 ? MOEDA.format(r.feriasVencidas()) : "R$ 0,00", COR_TEXTO);
        adicionarLinhaValores(tabelaVerbas, "Abono de Férias (1/3 Constitucional)", "-", MOEDA.format(r.abonoFerias()), COR_TEXTO);
        adicionarLinhaValores(tabelaVerbas, "Aviso Prévio Indenizado", "-", r.avisoPrevio() > 0 ? MOEDA.format(r.avisoPrevio()) : "Não aplicável", COR_TEXTO);
        adicionarLinhaValores(tabelaVerbas, "Multa Rescisória do FGTS", (int)(dados.tipoRescisao().getPercentualMultaFGTS() * 100) + "%", r.multaFGTS() > 0 ? MOEDA.format(r.multaFGTS()) : "Não aplicável", r.multaFGTS() > 0 ? COR_VERDE : COR_TEXTO);

        adicionarLinhaDestaque(tabelaVerbas, "TOTAL BRUTO RESCISÓRIO:", MOEDA.format(r.total()), FONT_DESTAQUE);

        doc.add(tabelaVerbas);
        doc.add(Chunk.NEWLINE);

        adicionarRodape(doc);
        doc.close();
    }

    // =========================================================
    // Helpers de formatacao do PDF
    // =========================================================

    private static void adicionarCabecalho(Document doc, String tituloRelatorio) throws DocumentException {
        Paragraph emp = new Paragraph("Tectreinamentos Informática LTDA.", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, COR_SECUNDARIA));
        Paragraph depto = new Paragraph("Departamento de RH e Departamento Pessoal", FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY));
        Paragraph tit = new Paragraph(tituloRelatorio, FONT_TITULO);

        tit.setSpacingAfter(15);
        doc.add(emp);
        doc.add(depto);
        doc.add(tit);

        // Separador
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell(new Phrase(""));
        cell.setBorderWidthBottom(2);
        cell.setBorderColorBottom(COR_PRIMARIA);
        cell.setBorder(Rectangle.BOTTOM);
        line.addCell(cell);
        doc.add(line);
        doc.add(Chunk.NEWLINE);
    }

    private static void adicionarLinhaTabelaInfo(PdfPTable table, String rotulo, String valor) {
        PdfPCell c1 = new PdfPCell(new Phrase(rotulo, FONT_CORPO_NEGRITO));
        c1.setBackgroundColor(COR_CINZA_FUNDO);
        c1.setBorderColor(COR_BORDA);
        c1.setPadding(6);

        PdfPCell c2 = new PdfPCell(new Phrase(valor, FONT_CORPO));
        c2.setBorderColor(COR_BORDA);
        c2.setPadding(6);

        table.addCell(c1);
        table.addCell(c2);
    }

    private static void adicionarCabecalhoTabela(PdfPTable table, String... titulos) {
        for (String t : titulos) {
            PdfPCell cell = new PdfPCell(new Phrase(t, FONT_CABECALHO_TABELA));
            cell.setBackgroundColor(COR_PRIMARIA);
            cell.setBorderColor(COR_SECUNDARIA);
            cell.setPadding(6);
            table.addCell(cell);
        }
    }

    private static void adicionarLinhaValores(PdfPTable table, String item, String ref, String valor, Color corValor) {
        PdfPCell c1 = new PdfPCell(new Phrase(item, FONT_CORPO));
        c1.setBorderColor(COR_BORDA);
        c1.setPadding(5);

        if (table.getNumberOfColumns() == 3) {
            PdfPCell cRef = new PdfPCell(new Phrase(ref, FONT_CORPO));
            cRef.setBorderColor(COR_BORDA);
            cRef.setPadding(5);
            table.addCell(c1);
            table.addCell(cRef);
        } else {
            table.addCell(c1);
        }

        Font fontV = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, corValor);
        PdfPCell cVal = new PdfPCell(new Phrase(valor, fontV));
        cVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cVal.setBorderColor(COR_BORDA);
        cVal.setPadding(5);
        table.addCell(cVal);
    }

    private static void adicionarLinhaDestaque(PdfPTable table, String rotulo, String valor, Font fontDestaque) {
        PdfPCell c1 = new PdfPCell(new Phrase(rotulo, FONT_CORPO_NEGRITO));
        c1.setBackgroundColor(COR_CINZA_FUNDO);
        c1.setBorderColor(COR_PRIMARIA);
        c1.setPadding(8);

        PdfPCell c2 = new PdfPCell(new Phrase(valor, fontDestaque));
        c2.setBackgroundColor(COR_CINZA_FUNDO);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c2.setBorderColor(COR_PRIMARIA);
        c2.setPadding(8);

        table.addCell(c1);
        table.addCell(c2);
    }

    private static void adicionarRodape(Document doc) throws DocumentException {
        String dataHora = LocalDateTime.now().format(FORMATO_DATA_HORA);
        Paragraph rodape = new Paragraph(
                "Gerado por Tectreinamentos Informatica LTDA. — Sistema v2.0  |  Data/Hora: " + dataHora, FONT_RODAPE);
        rodape.setSpacingBefore(20);
        rodape.setAlignment(Element.ALIGN_CENTER);
        doc.add(rodape);
    }
}
