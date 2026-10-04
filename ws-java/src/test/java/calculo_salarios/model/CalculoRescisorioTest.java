package calculo_salarios.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class CalculoRescisorioTest {

    private static final double DELTA = 0.01;

    @Test
    @DisplayName("Rescisao Sem Justa Causa - Direitos integrais, aviso previo e multa 40% FGTS")
    void testRescisaoSemJustaCausa() {
        DadosRescisorio dados = new DadosRescisorio(
                "Carlos Souza",
                3000.00,
                LocalDate.of(2020, 1, 15),
                LocalDate.of(2023, 7, 20), // 3 anos completos, 6 meses, 5 dias
                TipoRescisao.SEM_JUSTA_CAUSA,
                10000.00,
                true, // tem ferias vencidas
                20 // 20 dias trabalhados no mes
        );

        ResultadoRescisorio r = CalculoRescisorio.calcular(dados);

        assertEquals(3, r.anosServico());
        assertEquals(6, r.mesesServico());
        // Saldo salario: 3000 / 30 * 20 = 2000
        assertEquals(2000.00, r.saldoSalario(), DELTA);
        // 13o proporcional: 3000 / 12 * 6 = 1500
        assertEquals(1500.00, r.decimoTerceiroProporcional(), DELTA);
        // Ferias proporcional: 3000 / 12 * 6 = 1500
        assertEquals(1500.00, r.feriasProporcional(), DELTA);
        // Ferias vencidas: 3000
        assertEquals(3000.00, r.feriasVencidas(), DELTA);
        // Abono ferias: (1500 + 3000) / 3 = 1500
        assertEquals(1500.00, r.abonoFerias(), DELTA);
        // Aviso previo: 30 + 3 * 3 = 39 dias -> 100 * 39 = 3900
        assertEquals(3900.00, r.avisoPrevio(), DELTA);
        // Multa FGTS: 40% de 10000 = 4000
        assertEquals(4000.00, r.multaFGTS(), DELTA);

        // Total = 2000 + 1500 + 1500 + 3000 + 1500 + 3900 + 4000 = 17400
        assertEquals(17400.00, r.total(), DELTA);
    }

    @Test
    @DisplayName("Rescisao Pedido de Demissao - Sem aviso previa indenizado e sem multa FGTS")
    void testRescisaoPedidoDemissao() {
        DadosRescisorio dados = new DadosRescisorio(
                "Ana Lima",
                3000.00,
                LocalDate.of(2021, 1, 1),
                LocalDate.of(2023, 7, 1), // 2 anos, 6 meses
                TipoRescisao.PEDIDO_DEMISSAO,
                5000.00,
                false,
                15
        );

        ResultadoRescisorio r = CalculoRescisorio.calcular(dados);

        assertEquals(0.0, r.avisoPrevio(), DELTA);
        assertEquals(0.0, r.multaFGTS(), DELTA);
        assertTrue(r.saldoSalario() > 0);
        assertTrue(r.decimoTerceiroProporcional() > 0);
    }

    @Test
    @DisplayName("Rescisao por Justa Causa - Apenas saldo de salario e ferias vencidas")
    void testRescisaoJustaCausa() {
        DadosRescisorio dados = new DadosRescisorio(
                "Pedro Rocha",
                3000.00,
                LocalDate.of(2021, 1, 1),
                LocalDate.of(2023, 7, 1),
                TipoRescisao.JUSTA_CAUSA,
                5000.00,
                true,
                10
        );

        ResultadoRescisorio r = CalculoRescisorio.calcular(dados);

        assertEquals(0.0, r.decimoTerceiroProporcional(), DELTA);
        assertEquals(0.0, r.feriasProporcional(), DELTA);
        assertEquals(0.0, r.avisoPrevio(), DELTA);
        assertEquals(0.0, r.multaFGTS(), DELTA);
        assertEquals(1000.00, r.saldoSalario(), DELTA); // 10 dias
        assertEquals(3000.00, r.feriasVencidas(), DELTA);
    }

    @Test
    @DisplayName("Rescisao por Acordo (Art. 484-A CLT) - Metade do aviso previo e multa 20% FGTS")
    void testRescisaoAcordo() {
        DadosRescisorio dados = new DadosRescisorio(
                "Juliana Costa",
                3000.00,
                LocalDate.of(2020, 1, 1),
                LocalDate.of(2022, 1, 1), // 2 anos completos (36 dias aviso previo)
                TipoRescisao.ACORDO,
                10000.00,
                false,
                30
        );

        ResultadoRescisorio r = CalculoRescisorio.calcular(dados);

        // Aviso previo: 36 dias * 100 = 3600 / 2 (acordo) = 1800
        assertEquals(1800.00, r.avisoPrevio(), DELTA);
        // Multa FGTS: 20% de 10000 = 2000
        assertEquals(2000.00, r.multaFGTS(), DELTA);
    }

    @Test
    @DisplayName("Aviso Previo Trabalhado ou Dispensado - Aviso previo indenizado deve ser R$ 0,00")
    void testAvisoPrevioTrabalhadoEDispensado() {
        DadosRescisorio dadosTrabalhado = new DadosRescisorio(
                "Lucas Ferreira",
                3000.00,
                LocalDate.of(2020, 1, 1),
                LocalDate.of(2023, 1, 1),
                TipoRescisao.SEM_JUSTA_CAUSA,
                ModalidadeAvisoPrevio.TRABALHADO,
                5000.00,
                false,
                30
        );

        ResultadoRescisorio rTrabalhado = CalculoRescisorio.calcular(dadosTrabalhado);
        assertEquals(0.0, rTrabalhado.avisoPrevio(), DELTA);

        DadosRescisorio dadosDispensado = new DadosRescisorio(
                "Lucas Ferreira",
                3000.00,
                LocalDate.of(2020, 1, 1),
                LocalDate.of(2023, 1, 1),
                TipoRescisao.SEM_JUSTA_CAUSA,
                ModalidadeAvisoPrevio.DISPENSADO,
                5000.00,
                false,
                30
        );

        ResultadoRescisorio rDispensado = CalculoRescisorio.calcular(dadosDispensado);
        assertEquals(0.0, rDispensado.avisoPrevio(), DELTA);
    }
}
