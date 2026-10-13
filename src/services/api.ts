import { LegalAnalysis, LegalCase, LawyerProfile } from '../types';

export async function requestDefenseAnalysis(params: {
  lawyer: LawyerProfile;
  caseItem: LegalCase;
  taskTitle?: string;
}): Promise<LegalAnalysis> {
  const { lawyer, caseItem, taskTitle } = params;

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
}
