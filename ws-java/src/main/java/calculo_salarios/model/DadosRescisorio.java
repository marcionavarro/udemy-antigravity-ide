package calculo_salarios.model;

import java.time.LocalDate;

/**
 * Dados de entrada para o calculo rescisorio.
 *
 * @param nomeFuncionario         Nome do funcionario
 * @param salarioBruto            Salario bruto mensal
 * @param dataAdmissao            Data de inicio do contrato
 * @param dataDemissao            Data de termino do contrato
 * @param tipoRescisao            Modalidade de rescisao (CLT)
 * @param modalidadeAvisoPrevio   Modalidade do aviso previo (Indenizado, Trabalhado, Dispensado)
 * @param saldoFGTS               Saldo total na conta do FGTS (informado pelo usuario)
 * @param temFeriasVencidas       Se ha periodo aquisitivo completo (12 meses) nao gozado
 * @param diasTrabalhadosNoMes    Dias efetivamente trabalhados no mes de saida (para saldo salario)
 */
public record DadosRescisorio(
        String nomeFuncionario,
        double salarioBruto,
        LocalDate dataAdmissao,
        LocalDate dataDemissao,
        TipoRescisao tipoRescisao,
        ModalidadeAvisoPrevio modalidadeAvisoPrevio,
        double saldoFGTS,
        boolean temFeriasVencidas,
        int diasTrabalhadosNoMes
) {
    /** Constructor de conveniencia sem modalidadeAvisoPrevio (assume INDENIZADO por padrao). */
    public DadosRescisorio(
            String nomeFuncionario,
            double salarioBruto,
            LocalDate dataAdmissao,
            LocalDate dataDemissao,
            TipoRescisao tipoRescisao,
            double saldoFGTS,
            boolean temFeriasVencidas,
            int diasTrabalhadosNoMes
    ) {
        this(nomeFuncionario, salarioBruto, dataAdmissao, dataDemissao, tipoRescisao,
             ModalidadeAvisoPrevio.INDENIZADO, saldoFGTS, temFeriasVencidas, diasTrabalhadosNoMes);
    }
}
