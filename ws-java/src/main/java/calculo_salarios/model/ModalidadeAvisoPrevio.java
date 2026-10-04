package calculo_salarios.model;

/**
 * Modalidade do aviso previo no desligamento (CLT).
 */
public enum ModalidadeAvisoPrevio {

    INDENIZADO("Indenizado (Paga na rescisão)"),
    TRABALHADO("Trabalhado (Cumprido em serviço)"),
    DISPENSADO("Dispensado / Não Aplicável");

    private final String descricao;

    ModalidadeAvisoPrevio(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    @Override
    public String toString() {
        return descricao;
    }
}
