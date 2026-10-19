import { LegalAnalysis, LegalCase, LawyerProfile } from '../types';
import { requestDefenseAnalysisClientSide } from './geminiClient';

/**
 * Solicita análise de defesa jurídica via IA.
 *
 * Estratégia:
 * 1. Se o perfil do advogado possui geminiApiKey → chama direto pelo browser (client-side)
 * 2. Caso contrário → tenta o endpoint do servidor (/api/ai/analyze-defense)
 * 3. Se ambos falharem → retorna erro explicativo
 */
export async function requestDefenseAnalysis(params: {
  lawyer: LawyerProfile;
  caseItem: LegalCase;
  taskTitle?: string;
}): Promise<LegalAnalysis> {
  const { lawyer, caseItem, taskTitle } = params;

  // 1. Tentar chamada direta ao Gemini pelo browser
  if (lawyer.geminiApiKey) {
    try {
      return await requestDefenseAnalysisClientSide(params);
    } catch (clientError: any) {
      console.warn('[API] Falha na chamada client-side ao Gemini:', clientError.message);
      // Se o erro é de API key inválida, propagar o erro sem tentar server
      if (
        clientError.message.includes('inválida') ||
        clientError.message.includes('não configurada')
      ) {
        throw clientError;
      }
      // Tentar server como fallback
    }
  }

  // 2. Tentar via servidor backend
  try {
    const res = await fetch('/api/ai/analyze-defense', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lawyerName: lawyer.name,
        specialty: lawyer.specialty,
        caseTitle: caseItem.title,
        clientName: caseItem.clientName,
        clientRole: caseItem.clientRole,
        court: caseItem.court,
        area: caseItem.area,
        factsDescription: caseItem.factsDescription,
        circumstances: caseItem.circumstances,
        taskTitle,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao gerar análise jurídica.');
    }

    return {
      ...data.analysis,
      generatedAt: new Date().toISOString(),
    };
  } catch (serverError: any) {
    console.warn('[API] Falha na chamada ao servidor:', serverError.message);

    // Se não tem API key configurada e o server também falhou
    if (!lawyer.geminiApiKey) {
      throw new Error(
        'Para usar a consultoria jurídica com IA, configure sua Chave da API Gemini no Perfil do Advogado. ' +
        'Obtenha gratuitamente em: https://aistudio.google.com/apikey'
      );
    }

    throw serverError;
  }
}
