package calculo_salarios.model;

/**
 * Resultado consolidado do calculo salarial.
 * Todos os valores em reais (double).
 *
 * @param salarioBruto      Salario bruto informado
 * @param descontoINSS      Desconto INSS calculado progressivamente (Tabela 2025)
 * @param descontoIRRF      Desconto IRRF calculado com deducoes (Tabela mai/2025)
 * @param descontoFaltas    Desconto total de faltas + DSR (CLT Art. 473)
 * @param salarioLiquido    Salario liquido apos todos os descontos
 * @param rendaAnual        Renda anual (salarioLiquido x 12)
 * @param decimoTerceiro    Valor estimado do 13o salario (salario bruto integral)
 * @param ferias            Valor das ferias + 1/3 constitucional (CLT Art. 129/130)
 * @param diasFerias        Quantidade de dias de ferias a que tem direito (CLT Art. 130)
 */
public record ResultadoSalarial(
        double salarioBruto,
        double descontoINSS,
        double descontoIRRF,
        double descontoFaltas,
        double salarioLiquido,
        double rendaAnual,
        double decimoTerceiro,
        double ferias,
        int diasFerias
) {}
