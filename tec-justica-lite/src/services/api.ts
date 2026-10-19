import { LegalAnalysis, LegalCase, LawyerProfile } from '../types';
import {
  requestDefenseAnalysisClientSide,
  getEnvGeminiApiKey,
  isClientAiAvailable,
} from './geminiClient';

/**
 * Verifica se o modo IA está ativado (via .env no frontend ou no backend).
 */
export async function checkAiAvailability(): Promise<boolean> {
  // 1. Verifica se a chave foi injetada pelo .env no cliente
  if (isClientAiAvailable()) {
    return true;
  }

  // 2. Verifica se o backend possui a chave configurada no .env
  try {
    const res = await fetch('/api/ai/status');
    if (res.ok) {
      const data = await res.json();
      return Boolean(data.enabled);
    }
  } catch {
    // Backend offline ou indisponível
  }

  return false;
}

/**
 * Solicita análise de defesa jurídica via IA.
 * Utiliza a chave do Gemini configurada exclusivamente no .env.
 */
export async function requestDefenseAnalysis(params: {
  lawyer: LawyerProfile;
  caseItem: LegalCase;
  taskTitle?: string;
}): Promise<LegalAnalysis> {
  const { lawyer, caseItem, taskTitle } = params;
  const clientKey = getEnvGeminiApiKey();

  // 1. Tentar chamada direta ao Gemini se a chave estiver disponível no frontend via .env
  if (clientKey) {
    try {
      return await requestDefenseAnalysisClientSide({
        ...params,
        apiKey: clientKey,
      });
    } catch (clientError: any) {
      console.warn('[API] Falha na chamada client-side ao Gemini:', clientError.message);
      if (
        clientError.message.includes('inválida') ||
        clientError.message.includes('desativado')
      ) {
        throw clientError;
      }
    }
  }

  // 2. Tentar via servidor backend (/api/ai/analyze-defense)
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
      throw new Error(data.error || 'Falha ao processar análise jurídica.');
    }

    return {
      ...data.analysis,
      generatedAt: new Date().toISOString(),
    };
  } catch (serverError: any) {
    console.warn('[API] Falha na chamada ao servidor:', serverError.message);
    throw new Error(
      serverError.message ||
        'Modo IA desativado. Para ativar a consultoria jurídica inteligente, configure a variável GEMINI_API_KEY no arquivo .env.'
    );
  }
}

