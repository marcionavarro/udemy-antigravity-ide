package calculo_salarios.service;

import calculo_salarios.model.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Servico centralizado em memoria para armazenamento e consulta do historico de calculos.
 */
public class HistoricoCalculosService {

    private static final HistoricoCalculosService INSTANCE = new HistoricoCalculosService();
    private final List<RegistroHistorico> historico = new CopyOnWriteArrayList<>();
    private final AtomicLong sequence = new AtomicLong(1);

    private HistoricoCalculosService() {}

    public static HistoricoCalculosService getInstance() {
        return INSTANCE;
    }

    /** Registra um calculo salarial mensal. */
    public synchronized RegistroHistorico adicionarCalculoSalarial(Funcionario f, ResultadoSalarial r) {
        String nome = (f.nome() == null || f.nome().isBlank()) ? "Não informado" : f.nome();
        String detalhes = String.format("Salário Bruto: R$ %.2f | INSS: R$ %.2f | IRRF: R$ %.2f | Líquido: R$ %.2f",
                r.salarioBruto(), r.descontoINSS(), r.descontoIRRF(), r.salarioLiquido());

        RegistroHistorico reg = new RegistroHistorico(
                sequence.getAndIncrement(),
                LocalDateTime.now(),
                nome,
                "Salarial Mensal",
                r.salarioBruto(),
                r.salarioLiquido(),
                detalhes,
                r, f, null, null
        );

        historico.add(0, reg); // Mais recentes primeiro
        return reg;
    }

    /** Registra um calculo rescisorio. */
    public synchronized RegistroHistorico adicionarCalculoRescisorio(DadosRescisorio dados, ResultadoRescisorio r) {
        String nome = (dados.nomeFuncionario() == null || dados.nomeFuncionario().isBlank()) ? "Não informado" : dados.nomeFuncionario();
        String detalhes = String.format("Tipo: %s | FGTS: R$ %.2f | Total: R$ %.2f",
                dados.tipoRescisao().getDescricao(), r.multaFGTS(), r.total());

        RegistroHistorico reg = new RegistroHistorico(
                sequence.getAndIncrement(),
                LocalDateTime.now(),
                nome,
                "Verbas Rescisórias",
                dados.salarioBruto(),
                r.total(),
                detalhes,
                null, null, r, dados
        );

        historico.add(0, reg); // Mais recentes primeiro
        return reg;
    }

    /** Retorna todos os registros do historico. */
    public List<RegistroHistorico> getHistorico() {
        return Collections.unmodifiableList(new ArrayList<>(historico));
    }

    /** Limpa todo o historico de calculos. */
    public synchronized void limparHistorico() {
        historico.clear();
    }
}
