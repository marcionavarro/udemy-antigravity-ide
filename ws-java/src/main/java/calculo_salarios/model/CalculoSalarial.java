package calculo_salarios.model;

/**
 * Regras de negocio para calculo salarial.
 * Implementa as tabelas e formulas vigentes em 2025:
 *   - INSS: Tabela Progressiva 2025 (Portaria MPS/MF)
 *   - IRRF: Tabela Mensal vigente a partir de mai/2025
 *   - Faltas: CLT Art. 473 + DSR semanal
 *   - Ferias: CLT Art. 130 (reducao por faltas injustificadas)
 *
 * Nenhuma dependencia Swing — pure business logic.
 */
public class CalculoSalarial {

    // =========================================================
    // Constantes INSS 2025 (Tabela Progressiva)
    // Fonte: Portaria Interministerial MPS/MF
    // =========================================================
    private static final double[] INSS_FAIXAS    = {1518.00, 2793.88, 4190.83, 8157.41};
    private static final double[] INSS_ALIQUOTAS = {0.075,   0.09,    0.12,    0.14};

    // =========================================================
    // Constantes IRRF mai/2025 (Tabela Mensal)
    // Fonte: Receita Federal do Brasil
    // =========================================================
    private static final double IRRF_ISENCAO        = 2428.80;
    private static final double IRRF_FAIXA2_MAX     = 2826.65;
    private static final double IRRF_FAIXA3_MAX     = 3751.05;
    private static final double IRRF_FAIXA4_MAX     = 4664.68;

    private static final double IRRF_ALIQ2          = 0.075;
    private static final double IRRF_ALIQ3          = 0.15;
    private static final double IRRF_ALIQ4          = 0.225;
    private static final double IRRF_ALIQ5          = 0.275;

    private static final double IRRF_PARCELA2       = 182.16;
    private static final double IRRF_PARCELA3       = 394.16;
    private static final double IRRF_PARCELA4       = 675.49;
    private static final double IRRF_PARCELA5       = 908.73;

    private static final double DEDUCAO_DEPENDENTE  = 189.59;

    // Salario Minimo 2025
    public static final double SALARIO_MINIMO_2025  = 1518.00;

    // =========================================================
    // Calculo do INSS — Progressivo por faixas (2025)
    // Cada faixa e tributada apenas sobre o valor que ela abrange
    // =========================================================
    public static double calcularINSS(double salario) {
        if (salario <= 0) return 0;

        double salarioCalculo = Math.min(salario, INSS_FAIXAS[INSS_FAIXAS.length - 1]);
        double inss    = 0;
        double limiteAnterior = 0;

        for (int i = 0; i < INSS_FAIXAS.length; i++) {
            if (salarioCalculo <= limiteAnterior) break;

            double teto = INSS_FAIXAS[i];
            double base = Math.min(salarioCalculo, teto) - limiteAnterior;
            inss += base * INSS_ALIQUOTAS[i];
            limiteAnterior = teto;

            if (salarioCalculo <= teto) break;
        }

        return inss;
    }

    // =========================================================
    // Calculo do IRRF — Metodo da Parcela a Deduzir (mai/2025)
    // Base = salario bruto - INSS - (dependentes x deducao)
    // =========================================================
    public static double calcularIRRF(double baseCalculo, int dependentes) {
        double base = baseCalculo - (dependentes * DEDUCAO_DEPENDENTE);

        if (base <= IRRF_ISENCAO)    return 0;
        if (base <= IRRF_FAIXA2_MAX) return Math.max(0, base * IRRF_ALIQ2 - IRRF_PARCELA2);
        if (base <= IRRF_FAIXA3_MAX) return Math.max(0, base * IRRF_ALIQ3 - IRRF_PARCELA3);
        if (base <= IRRF_FAIXA4_MAX) return Math.max(0, base * IRRF_ALIQ4 - IRRF_PARCELA4);
        return Math.max(0, base * IRRF_ALIQ5 - IRRF_PARCELA5);
    }

    // =========================================================
    // Calculo do Desconto por Faltas Injustificadas (CLT)
    //
    // Regra: o trabalhador perde:
    //   1. O valor do dia nao trabalhado (salario / 30)
    //   2. O DSR (Descanso Semanal Remunerado) da semana com falta
    //      — considera-se 1 DSR perdido por falta (simplificacao
    //        conservadora para mensalistas, limitado a 4 DSR/mes)
    // =========================================================
    public static double calcularDescontoFaltas(double salario, int faltas) {
        if (faltas <= 0 || salario <= 0) return 0;

        double valorDia    = salario / 30.0;
        int    dsrPerdidos = Math.min(faltas, 4); // maximo 4 semanas no mes

        return valorDia * faltas + valorDia * dsrPerdidos;
    }

    // =========================================================
    // Dias de ferias conforme CLT Art. 130
    // (Reducao por faltas injustificadas no periodo aquisitivo)
    // =========================================================
    public static int calcularDiasFerias(int faltas) {
        if (faltas <= 5)  return 30;
        if (faltas <= 14) return 24;
        if (faltas <= 23) return 18;
        if (faltas <= 32) return 12;
        return 0; // Perde o direito as ferias
    }

    // =========================================================
    // Metodo principal — consolida todos os calculos
    // =========================================================
    public static ResultadoSalarial calcularTudo(Funcionario f) {
        double salario       = f.salarioBruto();
        int    faltas        = f.numeroFaltas();
        int    dependentes   = f.dependentesIRRF();

        // Descontos
        double inss          = calcularINSS(salario);
        double descontoFaltas = calcularDescontoFaltas(salario, faltas);

        // Base IRRF = salario - INSS - desconto de faltas
        double baseIRRF      = Math.max(0, salario - inss - descontoFaltas);
        double irrf          = calcularIRRF(baseIRRF, dependentes);

        // Salario Liquido
        double liquido       = Math.max(0, salario - inss - irrf - descontoFaltas);

        // Projecoes anuais e beneficios
        double rendaAnual    = liquido * 12;
        double decimo        = salario; // 13o salario = salario bruto (1 competencia)
        int    diasFerias    = calcularDiasFerias(faltas);
        // Ferias = (salario / 30) * dias + 1/3 constitucional
        double feriasBase    = (salario / 30.0) * diasFerias;
        double ferias        = feriasBase + (feriasBase / 3.0);

        return new ResultadoSalarial(
                salario, inss, irrf, descontoFaltas,
                liquido, rendaAnual, decimo, ferias, diasFerias
        );
    }
}
