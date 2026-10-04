package calculo_salarios.model;

/**
 * Resultado consolidado das verbas rescisórias.
 * Todos os valores em reais (double).
 *
 * @param nomeFuncionario           Nome do funcionario
 * @param anosServico               Anos completos de servico
 * @param mesesServico              Meses restantes alem dos anos completos
 * @param saldoSalario              Dias trabalhados no mes de saida
 * @param decimoTerceiroProporcional 13o salario proporcional aos meses trabalhados no ano
 * @param feriasProporcional        Ferias proporcionais ao periodo aquisitivo em curso
 * @param feriasVencidas            Ferias de periodo aquisitivo completo nao gozadas
 * @param abonoFerias               1/3 constitucional sobre o total de ferias
 * @param avisoPrevio               Aviso previo indenizado (quando aplicavel)
 * @param multaFGTS                 Multa sobre o saldo do FGTS (40% ou 20% conforme tipo)
 * @param total                     Soma de todas as verbas rescisórias
 */
public record ResultadoRescisorio(
        String nomeFuncionario,
        int anosServico,
        int mesesServico,
        double saldoSalario,
        double decimoTerceiroProporcional,
        double feriasProporcional,
        double feriasVencidas,
        double abonoFerias,
        double avisoPrevio,
        double multaFGTS,
        double total
) {}
