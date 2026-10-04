package calculo_salarios.model;

import java.time.LocalDate;
import java.time.Period;

/**
 * Regras de negocio para o calculo das verbas rescisórias (CLT).
 *
 * Formulas implementadas:
 *   - Saldo de Salario:          (salario / 30) x dias trabalhados no mes
 *   - 13o Proporcional:          (salario / 12) x meses no ano (fracao >= 15 dias = 1 mes)
 *   - Ferias Proporcionais:      (salario / 12) x meses do periodo aquisitivo em curso
 *   - Ferias Vencidas:           salario bruto (periodo aquisitivo completo nao gozado)
 *   - Abono de Ferias (1/3):     (feriasProporcional + feriasVencidas) / 3
 *   - Aviso Previo (indenizado): (salario / 30) x (30 + 3 x anos_completos), max 90 dias
 *   - Multa FGTS:                saldoFGTS x percentual (0,40 sem justa causa / 0,20 acordo)
 *
 * Nenhuma dependencia Swing — pure business logic.
 */
public class CalculoRescisorio {

    /**
     * Calcula todas as verbas rescisórias com base nos dados fornecidos.
     *
     * @param dados Dados de entrada da rescisao
     * @return Resultado com todas as verbas discriminadas
     */
    public static ResultadoRescisorio calcular(DadosRescisorio dados) {

        LocalDate admissao  = dados.dataAdmissao();
        LocalDate demissao  = dados.dataDemissao();
        Period    periodo   = Period.between(admissao, demissao);
        double    salario   = dados.salarioBruto();
        double    valorDia  = salario / 30.0;

        int anosCompletos   = periodo.getYears();
        int mesesNoAno      = periodo.getMonths();  // meses alem dos anos completos
        int diasExtras      = periodo.getDays();     // dias alem dos meses completos

        // Para 13o: fracao de mes >= 15 dias conta como mes cheio
        int meses13 = mesesNoAno + (diasExtras >= 15 ? 1 : 0);

        // ===============================================
        // 1. Saldo de Salario
        //    Dias efetivamente trabalhados no mes de saida
        // ===============================================
        double saldoSalario = valorDia * Math.min(dados.diasTrabalhadosNoMes(), 30);

        // ===============================================
        // 2. 13o Salario Proporcional
        //    Apenas aplicavel em rescisoes sem justa causa,
        //    pedido de demissao e acordo
        // ===============================================
        double decimoTerceiro = 0;
        if (dados.tipoRescisao().isTem13EFeriasProporcional()) {
            decimoTerceiro = (salario / 12.0) * meses13;
        }

        // ===============================================
        // 3. Ferias Proporcionais
        //    Meses do periodo aquisitivo em curso (sem fracoes)
        // ===============================================
        double feriasProporcional = 0;
        if (dados.tipoRescisao().isTem13EFeriasProporcional()) {
            feriasProporcional = (salario / 12.0) * mesesNoAno;
        }

        // ===============================================
        // 4. Ferias Vencidas
        //    Periodo aquisitivo completo nao gozado
        //    Devidas em qualquer tipo de rescisao (exceto justa causa so ferias vencidas)
        // ===============================================
        double feriasVencidas = dados.temFeriasVencidas() ? salario : 0;

        // ===============================================
        // 5. Abono de Ferias — 1/3 constitucional
        //    Incide sobre o total de ferias (proporcionais + vencidas)
        // ===============================================
        double totalFerias   = feriasProporcional + feriasVencidas;
        double abonoFerias   = totalFerias / 3.0;

        // ===============================================
        // 6. Aviso Previo Indenizado
        //    30 dias + 3 dias por ano completo, limite 90 dias
        //    Para acordo: metade do aviso previo
        // ===============================================
        double avisoPrevio = 0;
        if (dados.modalidadeAvisoPrevio() == ModalidadeAvisoPrevio.INDENIZADO && dados.tipoRescisao().isTemAvisoPrevioIndenizado()) {
            int diasAviso = Math.min(30 + (3 * anosCompletos), 90);
            double valorAviso = valorDia * diasAviso;
            // Para acordo, o aviso previo indenizado e metade
            avisoPrevio = dados.tipoRescisao() == TipoRescisao.ACORDO
                    ? valorAviso / 2.0
                    : valorAviso;
        }

        // ===============================================
        // 7. Multa sobre o FGTS
        //    Sem justa causa: 40% | Acordo: 20% | Demais: 0%
        // ===============================================
        double multaFGTS = dados.saldoFGTS() * dados.tipoRescisao().getPercentualMultaFGTS();

        // ===============================================
        // 8. Total das Verbas Rescisórias
        // ===============================================
        double total = saldoSalario + decimoTerceiro + feriasProporcional
                + feriasVencidas + abonoFerias + avisoPrevio + multaFGTS;

        return new ResultadoRescisorio(
                dados.nomeFuncionario(),
                anosCompletos,
                mesesNoAno,
                saldoSalario,
                decimoTerceiro,
                feriasProporcional,
                feriasVencidas,
                abonoFerias,
                avisoPrevio,
                multaFGTS,
                total
        );
    }
}
