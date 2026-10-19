/**
 * Serviço Client-Side de Consulta Gemini — Tec Justiça Lite
 *
 * Chama a Gemini API diretamente pelo navegador usando a chave do usuário.
 * Elimina dependência do backend para análise de defesa.
 */

import { LegalAnalysis, LegalCase, LawyerProfile } from '../types';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildSystemPrompt(params: {
  lawyerName: string;
  specialty: string;
  taskTitle?: string;
}): string {
  const { lawyerName, specialty, taskTitle } = params;
  const lawyerSalutation = lawyerName ? `Dr(a). ${lawyerName}` : 'Doutor(a)';
  const effectiveSpecialty = specialty || 'Direito Geral / Multidisciplinar';

  return `Você é um Consultor Jurídico Sênior de Inteligência Artificial integrado ao app "Tec Justiça Lite", especializado em assessorar advogados brasileiros de alto nível.
Você deve responder rigorosamente em Língua Portuguesa (Brasil), com terminologia jurídica refinada, técnica e precisa.

Dados do Advogado:
- Nome: ${lawyerSalutation}
- Especialidade / Campo de Atuação: ${effectiveSpecialty}

Instruções fundamentais:
1. Sempre personalize as considerações e o tratamento direcionados especificamente a "${lawyerSalutation}", levando em conta sua especialidade ("${effectiveSpecialty}").
2. Analise os fatos da causa cadastrada, identifique os pontos vulneráveis da acusação/adverso e construa o enredo e a estratégia de defesa.
3. Forneça opções e dicas de leis aplicáveis no ordenamento jurídico brasileiro (CF/88, Códigos [CP, CPP, CC, CPC, CLT, CTN], Legislação Extravagante, Súmulas Vinculantes/STF/STJ, Temas de Repercussão Geral e Recursos Repetitivos).
4. Elabore um enredo de defesa estruturado (Tese Principal, Preliminares de Nulidade/Processuais, Argumentação de Mérito, Estratégia de Provas e Pedidos).
5. Se o usuário tiver informado circunstâncias novas ou notas adicionais, analise o impacto dessas circunstâncias na causa e destaque oportunidades de defesa.
6. Se houver uma tarefa ou prazo pendente associado ("${taskTitle || 'Geral'}"), forneça orientações práticas para a execução dessa tarefa.

IMPORTANTE: Você DEVE responder EXCLUSIVAMENTE com um objeto JSON válido, sem nenhum texto antes ou depois. O JSON deve seguir exatamente esta estrutura:
{
  "personalizedGreeting": "Saudação jurídica personalizada ao Dr./Dra.",
  "thesisName": "Título sintético da Tese Central de Defesa",
  "quickSummary": "Resumo executivo da tese para consulta ágil",
  "applicableLaws": [
    {
      "norm": "Dispositivo legal, artigo, súmula ou código",
      "relevance": "Relevância e aplicabilidade direta ao caso",
      "practicalApplication": "Como articular este dispositivo na peça ou audiência"
    }
  ],
  "defenseStoryline": {
    "factualNarrative": "Enredo fático estratégico da defesa",
    "preliminaries": ["Preliminar processual 1", "Preliminar 2"],
    "meritArguments": ["Argumento de mérito 1", "Argumento 2"],
    "evidenceStrategy": ["Estratégia probatória 1"],
    "keyRequests": ["Pedido principal 1", "Pedido subsidiário"]
  },
  "circumstanceImpact": "Análise de como as circunstâncias novas influenciam a defesa",
  "strategicAlerts": ["Alerta prático 1", "Alerta 2"]
}`;
}

function buildUserPrompt(params: {
  caseItem: LegalCase;
  specialty: string;
  taskTitle?: string;
}): string {
  const { caseItem, specialty, taskTitle } = params;
  const effectiveSpecialty = specialty || caseItem.area || 'Direito Geral / Multidisciplinar';

  return `Caso / Processo:
- Identificação: ${caseItem.title || 'Caso Não Especificado'}
- Cliente: ${caseItem.clientName || 'Cliente'} (${caseItem.clientRole})
- Juízo / Foro / Tribunal: ${caseItem.court || 'Não especificado'}
- Ramo / Área: ${effectiveSpecialty}
- Fatos e Objeto da Causa: ${caseItem.factsDescription || 'Fatos a serem apurados'}
${caseItem.circumstances ? `- Novas Circunstâncias / Notas adicionadas: ${caseItem.circumstances}` : '- Nenhuma circunstância adicional fornecida no momento.'}
${taskTitle ? `- Tarefa/Ato Processual Imediato: ${taskTitle}` : ''}

Por favor, gere a análise de defesa e leis aplicáveis no formato JSON estruturado conforme as instruções.`;
}

/**
 * Chama a Gemini API diretamente pelo browser usando a API key do usuário.
 */
export async function requestDefenseAnalysisClientSide(params: {
  lawyer: LawyerProfile;
  caseItem: LegalCase;
  taskTitle?: string;
}): Promise<LegalAnalysis> {
  const { lawyer, caseItem, taskTitle } = params;

  if (!lawyer.geminiApiKey) {
    throw new Error(
      'Chave da API Gemini não configurada. Acesse seu Perfil e insira sua API Key do Google AI Studio para habilitar a consultoria jurídica com IA.'
    );
  }

  const systemPrompt = buildSystemPrompt({
    lawyerName: lawyer.name,
    specialty: lawyer.specialty,
    taskTitle,
  });

  const userPrompt = buildUserPrompt({
    caseItem,
    specialty: lawyer.specialty,
    taskTitle,
  });

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  };

  const url = `${GEMINI_API_URL}?key=${lawyer.geminiApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData?.error?.message || `Erro HTTP ${response.status}`;

    if (response.status === 400 && errorMsg.includes('API key')) {
      throw new Error('Chave da API Gemini inválida. Verifique a chave no seu Perfil.');
    }
    if (response.status === 429) {
      throw new Error('Limite de requisições da API Gemini atingido. Aguarde alguns minutos e tente novamente.');
    }
    if (response.status === 403) {
      throw new Error('Acesso negado pela API Gemini. Verifique se sua API Key está ativa e com permissões corretas em https://aistudio.google.com/apikey');
    }

    throw new Error(`Erro ao consultar Gemini: ${errorMsg}`);
  }

  const data = await response.json();

  // Extrair o texto da resposta do Gemini
  const responseText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new Error('A IA não retornou uma resposta válida. Tente novamente.');
  }

  // Limpar possíveis markdown code fences
  let cleanText = responseText.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }
  cleanText = cleanText.trim();

  try {
    const analysis: LegalAnalysis = {
      ...JSON.parse(cleanText),
      generatedAt: new Date().toISOString(),
    };

    // Validar campos essenciais
    if (!analysis.thesisName || !analysis.applicableLaws || !analysis.defenseStoryline) {
      throw new Error('Resposta da IA incompleta.');
    }

    return analysis;
  } catch (parseError) {
    console.error('[GeminiClient] Erro ao parsear JSON da resposta:', cleanText);
    throw new Error('A IA retornou um formato inesperado. Tente gerar novamente.');
  }
}
