package calculo_salarios;

import calculo_salarios.controller.SalarioController;
import calculo_salarios.view.MainView;
import com.formdev.flatlaf.FlatLightLaf;

import javax.swing.*;
import java.awt.*;

/**
 * Ponto de entrada da aplicacao.
 * Inicializa o Look and Feel FlatLightLaf e monta a arquitetura MVC.
 *
 * Tectreinamentos Informatica LTDA.
 * Departamento de RH e Departamento Pessoal
 */
public class Main {

    public static void main(String[] args) {

        // === Configuracao do Look and Feel FlatLightLaf ===
        FlatLightLaf.setup();

        // Customizacoes globais de estilo
        UIManager.put("Button.arc", 10);
        UIManager.put("Component.arc", 8);
        UIManager.put("TextComponent.arc", 8);
        UIManager.put("ScrollBar.showButtons", false);
        UIManager.put("TabbedPane.selectedBackground", new Color(21, 101, 192, 30));

        // Renderizacao de texto de alta qualidade
        System.setProperty("awt.useSystemAAFontSettings", "on");
        System.setProperty("swing.aatext", "true");

        // === Inicializacao MVC na Thread de Eventos (EDT) ===
        SwingUtilities.invokeLater(() -> {
            MainView view = new MainView();
            new SalarioController(view);
            view.setVisible(true);
        });
    }
}
