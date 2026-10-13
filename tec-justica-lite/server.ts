import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Legal Strategy & Applicable Laws
app.post('/api/ai/analyze-defense', async (req, res) => {
  try {
    const {
      lawyerName = '',
      specialty = '',
      caseTitle = '',
      clientName = '',
      clientRole = 'Defesa / Réu',
      court = '',
      area = '',
      factsDescription = '',
      circumstances = '',
      taskTitle = '',
    } = req.body;

    if (!factsDescription && !caseTitle) {
      return res.status(400).json({
        error: 'É necessário fornecer a descrição dos fatos ou o título/objeto do caso.',
      });
    }

    const effectiveSpecialty = specialty || area || 'Direito Geral / Multidisciplinar';
    const lawyerSalutation = lawyerName ? `Dr(a). ${lawyerName}` : 'Doutor(a)';

    const systemPrompt = `Você é um Consultor Jurídico Sênior de Inteligência Artificial integrado ao app "Tec Justiça Lite", especializado em assessorar advogados brasileiros de alto nível.
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
6. Se houver uma tarefa ou prazo pendente associado ("${taskTitle || 'Geral'}"), forneça orientações práticas para a execução dessa tarefa.`;

    const userPrompt = `Caso / Processo:
- Identificação: ${caseTitle || 'Caso Não Especificado'}
- Cliente: ${clientName || 'Cliente'} (${clientRole})
- Juízo / Foro / Tribunal: ${court || 'Não especificado'}
- Ramo / Área: ${effectiveSpecialty}
- Fatos e Objeto da Causa: ${factsDescription || 'Fatos a serem apurados'}
${circumstances ? `- Novas Circunstâncias / Notas adicionadas: ${circumstances}` : '- Nenhuma circunstância adicional fornecida no momento.'}
${taskTitle ? `- Tarefa/Ato Processual Imediato: ${taskTitle}` : ''}

Por favor, gere a análise de defesa e leis aplicáveis no formato JSON estruturado.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalizedGreeting: {
              type: Type.STRING,
              description: 'Saudação jurídica personalizada ao Dr./Dra. considerando sua especialidade',
            },
            thesisName: {
              type: Type.STRING,
              description: 'Título sintético da Tese Central de Defesa',
            },
            quickSummary: {
              type: Type.STRING,
              description: 'Resumo executivo da tese para consulta ágil na agenda',
            },
            applicableLaws: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  norm: { type: Type.STRING, description: 'Dispositivo legal, artigo, súmula ou código' },
                  relevance: { type: Type.STRING, description: 'Relevância e aplicabilidade direta ao caso' },
                  practicalApplication: { type: Type.STRING, description: 'Como articular este dispositivo na peça ou audiência' },
                },
                required: ['norm', 'relevance', 'practicalApplication'],
              },
              description: 'Leis e normas aplicáveis ao caso',
            },
            defenseStoryline: {
              type: Type.OBJECT,
              properties: {
                factualNarrative: { type: Type.STRING, description: 'Enredo fático estratégico da defesa a ser apresentado em juízo' },
                preliminaries: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Preliminares processuais, nulidades, prescrição, decadência, inépcia, etc.',
                },
                meritArguments: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Argumentos de mérito ponto a ponto',
                },
                evidenceStrategy: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Estratégia probatória (testemunhas, perícias, quesitos, documental)',
                },
                keyRequests: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Pedidos principais e subsidiários formulados na defesa',
                },
              },
              required: ['factualNarrative', 'preliminaries', 'meritArguments', 'evidenceStrategy', 'keyRequests'],
            },
            circumstanceImpact: {
              type: Type.STRING,
              description: 'Análise de como as circunstâncias novas influenciam ou alteram a defesa (ou orientações para adicionar fatos novos se em branco)',
            },
            strategicAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Alertas práticos de prazos, riscos, cautelas probatórias e postura no foro/audiência',
            },
          },
          required: [
            'personalizedGreeting',
            'thesisName',
            'quickSummary',
            'applicableLaws',
            'defenseStoryline',
            'circumstanceImpact',
            'strategicAlerts',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      analysis: parsedData,
    });
  } catch (error: any) {
    console.error('Erro na análise jurídica por IA:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Falha ao processar análise jurídica inteligente.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Tec Justiça Lite] Servidor rodando na porta ${PORT}`);
  });
}

startServer();
