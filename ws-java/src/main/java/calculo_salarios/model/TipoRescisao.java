package calculo_salarios.model;

/**
 * Tipos de rescisao de contrato de trabalho conforme a CLT.
 * Determina quais verbas rescisórias sao devidas.
 */
public enum TipoRescisao {

    SEM_JUSTA_CAUSA("Demissao Sem Justa Causa",
            true,  // aviso previo indenizado pelo empregador
            true,  // saque FGTS
            0.40,  // multa FGTS 40%
            true), // 13o e ferias

    PEDIDO_DEMISSAO("Pedido de Demissao pelo Funcionario",
            false, // nao ha aviso previo indenizado (deve cumprir ou ter descontado)
            false, // sem saque do FGTS
            0.0,   // sem multa FGTS
            true), // 13o e ferias proporcionais

    JUSTA_CAUSA("Demissao por Justa Causa",
            false, // sem aviso previo
            false, // sem saque FGTS
            0.0,   // sem multa FGTS
            false),// sem 13o/ferias proporcionais (apenas ferias vencidas)

    ACORDO("Acordo entre as Partes (Art. 484-A CLT)",
            true,  // metade do aviso previo indenizado
            true,  // saque de ate 80% do FGTS
            0.20,  // multa FGTS 20%
            true); // 13o e ferias

    private final String descricao;
    private final boolean temAvisoPrevioIndenizado;
    private final boolean podeSacarFGTS;
    private final double percentualMultaFGTS;
    private final boolean tem13EFeriasProporcional;

    TipoRescisao(String descricao,
                 boolean temAvisoPrevioIndenizado,
                 boolean podeSacarFGTS,
                 double percentualMultaFGTS,
                 boolean tem13EFeriasProporcional) {
        this.descricao = descricao;
        this.temAvisoPrevioIndenizado = temAvisoPrevioIndenizado;
        this.podeSacarFGTS = podeSacarFGTS;
        this.percentualMultaFGTS = percentualMultaFGTS;
        this.tem13EFeriasProporcional = tem13EFeriasProporcional;
    }

    public String getDescricao()                { return descricao; }
    public boolean isTemAvisoPrevioIndenizado() { return temAvisoPrevioIndenizado; }
    public boolean isPodeSacarFGTS()            { return podeSacarFGTS; }
    public double getPercentualMultaFGTS()      { return percentualMultaFGTS; }
    public boolean isTem13EFeriasProporcional() { return tem13EFeriasProporcional; }

    @Override
    public String toString() { return descricao; }
}
