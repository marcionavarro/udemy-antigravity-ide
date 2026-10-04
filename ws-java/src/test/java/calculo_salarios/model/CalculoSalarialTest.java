package calculo_salarios.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

class CalculoSalarialTest {

    private static final double DELTA = 0.01;

    @Test
    @DisplayName("INSS - Salario ate primeira faixa (R$ 1.518,00 x 7.5%)")
    void testCalcularINSS_Faixa1() {
        double inss = CalculoSalarial.calcularINSS(1518.00);
        assertEquals(113.85, inss, DELTA);
    }

    @Test
    @DisplayName("INSS - Salario em faixa intermediaria (R$ 3.000,00)")
    void testCalcularINSS_FaixaIntermediaria() {
        // Faixa 1: 1518 * 0.075 = 113.85
        // Faixa 2: (2793.88 - 1518) * 0.09 = 1275.88 * 0.09 = 114.83
        // Faixa 3: (3000.00 - 2793.88) * 0.12 = 206.12 * 0.12 = 24.73
        // Total = 113.85 + 114.83 + 24.73 = 253.41
        double inss = CalculoSalarial.calcularINSS(3000.00);
        assertEquals(253.41, inss, DELTA);
    }

    @Test
    @DisplayName("INSS - Teto maximo de contribuicao (salario R$ 10.000,00)")
    void testCalcularINSS_Teto() {
        double inss = CalculoSalarial.calcularINSS(10000.00);
        // Teto de R$ 8.157,41
        double inssTeto = CalculoSalarial.calcularINSS(8157.41);
        assertEquals(inssTeto, inss, DELTA);
    }

    @Test
    @DisplayName("INSS - Salario zero ou negativo")
    void testCalcularINSS_ZeroOuNegativo() {
        assertEquals(0.0, CalculoSalarial.calcularINSS(0), DELTA);
        assertEquals(0.0, CalculoSalarial.calcularINSS(-1000), DELTA);
    }

    @Test
    @DisplayName("IRRF - Faixa de isencao (base ate R$ 2.428,80)")
    void testCalcularIRRF_Isento() {
        double irrf = CalculoSalarial.calcularIRRF(2000.00, 0);
        assertEquals(0.0, irrf, DELTA);
    }

    @Test
    @DisplayName("IRRF - Com dependentes deduzindo base de calculo")
    void testCalcularIRRF_ComDependentes() {
        // Base 3500 - (2 * 189.59) = 3120.82 (Faixa 3: 15% - 394.16)
        double irrfComDep = CalculoSalarial.calcularIRRF(3500.00, 2);
        double irrfSemDep = CalculoSalarial.calcularIRRF(3500.00, 0);
        assertTrue(irrfComDep < irrfSemDep);
    }

    @ParameterizedTest
    @CsvSource({
            "0, 30",
            "5, 30",
            "6, 24",
            "14, 24",
            "15, 18",
            "23, 18",
            "24, 12",
            "32, 12",
            "33, 0"
    })
    @DisplayName("Ferias - Dias conforme faltas (CLT Art. 130)")
    void testCalcularDiasFerias(int faltas, int diasEsperados) {
        assertEquals(diasEsperados, CalculoSalarial.calcularDiasFerias(faltas));
    }

    @Test
    @DisplayName("Faltas - Desconto inclui dia nao trabalhado + DSR")
    void testCalcularDescontoFaltas() {
        // Salario 3000 -> valor dia 100
        // 2 faltas -> 2 * 100 + 2 DSR * 100 = 400
        double desconto = CalculoSalarial.calcularDescontoFaltas(3000.00, 2);
        assertEquals(400.00, desconto, DELTA);
    }

    @Test
    @DisplayName("CalcularTudo - Funcionario valido retorna resultado coerente")
    void testCalcularTudo() {
        Funcionario f = new Funcionario("Maria Silva", 3500.00, 1, 1);
        ResultadoSalarial r = CalculoSalarial.calcularTudo(f);

        assertEquals(3500.00, r.salarioBruto(), DELTA);
        assertTrue(r.descontoINSS() > 0);
        assertTrue(r.salarioLiquido() < r.salarioBruto());
        assertEquals(r.salarioLiquido() * 12, r.rendaAnual(), DELTA);
        assertEquals(30, r.diasFerias());
        // 3500 + 3500/3 = 4666.67
        assertEquals(4666.67, r.ferias(), DELTA);
    }

    @Test
    @DisplayName("PdfExporter - Exportacao de relatorio salarial gera arquivo valido")
    void testExportarPdfSalarial() throws Exception {
        Funcionario f = new Funcionario("Teste PDF", 4500.00, 0, 2);
        ResultadoSalarial r = CalculoSalarial.calcularTudo(f);
        java.io.File tempFile = java.io.File.createTempFile("teste_salarial_", ".pdf");
        tempFile.deleteOnExit();

        calculo_salarios.util.PdfExporter.exportarRelatorioSalarial(tempFile, f, r);
        assertTrue(tempFile.exists());
        assertTrue(tempFile.length() > 0);
    }
}
