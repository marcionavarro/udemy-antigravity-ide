package calculo_salarios.model;

import java.time.LocalDateTime;

/**
 * Registro de um calculo (Salarial Mensal ou Rescisorio) para o historico.
 *
 * @param id                Identificador unico
 * @param dataHora          Data e hora da realizacao do calculo
 * @param nomeFuncionario   Nome do funcionario
 * @param tipoCalculo       Tipo ("Salarial Mensal" ou "Verbas Rescisórias")
 * @param salarioBruto      Salario bruto informado
 * @param valorFinal        Valor final (Salario Liquido ou Total Rescisorio)
 * @param detalhes          Resumo dos detalhes do calculo
 * @param objetoSalarial    Objeto ResultadoSalarial (se salarial)
 * @param funcionario       Objeto Funcionario (se salarial)
 * @param objetoRescisorio  Objeto ResultadoRescisorio (se rescisorio)
 * @param dadosRescisorio   Objeto DadosRescisorio (se rescisorio)
 */
public record RegistroHistorico(
        long id,
        LocalDateTime dataHora,
        String nomeFuncionario,
        String tipoCalculo,
        double salarioBruto,
        double valorFinal,
        String detalhes,
        ResultadoSalarial objetoSalarial,
        Funcionario funcionario,
        ResultadoRescisorio objetoRescisorio,
        DadosRescisorio dadosRescisorio
) {}
