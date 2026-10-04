package calculo_salarios.model;

/**
 * Modelo de dados imutavel do funcionario.
 * Utiliza Java Record para eliminar boilerplate (getter, equals, hashCode, toString).
 *
 * @param nome          Nome completo do funcionario
 * @param salarioBruto  Salario bruto mensal em reais
 * @param numeroFaltas  Quantidade de faltas injustificadas no mes
 * @param dependentesIRRF Numero de dependentes para deducao do IRRF (R$ 189,59 cada)
 */
public record Funcionario(
        String nome,
        double salarioBruto,
        int numeroFaltas,
        int dependentesIRRF
) {}
