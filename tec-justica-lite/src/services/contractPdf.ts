/**
 * Serviço de Geração de Contrato em PDF — Tec Justiça Lite
 *
 * Gera um contrato de prestação de serviços advocatícios
 * com dados do caso e orçamento usando jsPDF.
 */

import jsPDF from 'jspdf';
import { LegalCase, LawyerProfile } from '../types';

function formatDate(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

function formatDateShort(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

// ─── Helpers de layout ──────────────────────────────────────────

const PAGE_WIDTH = 210;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const GOLD_COLOR: [number, number, number] = [180, 145, 40];
const DARK_COLOR: [number, number, number] = [30, 30, 30];
const GRAY_COLOR: [number, number, number] = [100, 100, 100];
const LIGHT_GRAY: [number, number, number] = [160, 160, 160];

function addNewPageIfNeeded(doc: jsPDF, y: number, neededSpace: number = 30): number {
  if (y + neededSpace > 270) {
    doc.addPage();
    // Borda dourada sutil no topo de cada nova página
    doc.setDrawColor(...GOLD_COLOR);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, 10, PAGE_WIDTH - MARGIN_RIGHT, 10);
    return 20;
  }
  return y;
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 5,
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    y = addNewPageIfNeeded(doc, y, lineHeight + 2);
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  y = addNewPageIfNeeded(doc, y, 15);

  // Linha dourada
  doc.setDrawColor(...GOLD_COLOR);
  doc.setLineWidth(0.8);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK_COLOR);
  doc.text(title.toUpperCase(), MARGIN_LEFT, y);
  y += 8;

  return y;
}

// ─── Geração do PDF ─────────────────────────────────────────────

export function generateContractPDF(
  caseItem: LegalCase,
  lawyerProfile: LawyerProfile,
): void {
  const doc = new jsPDF('p', 'mm', 'a4');

  // ═══════════════════════════════════════════════════════════
  // CABEÇALHO
  // ═══════════════════════════════════════════════════════════
  
  // Barra dourada decorativa no topo
  doc.setFillColor(...GOLD_COLOR);
  doc.rect(0, 0, PAGE_WIDTH, 3, 'F');

  // Título do escritório / app
  let y = 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...DARK_COLOR);
  doc.text('Tec Justiça Lite', PAGE_WIDTH / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY_COLOR);
  doc.text('Plataforma Jurídica Estratégica', PAGE_WIDTH / 2, y, { align: 'center' });

  // Dados do advogado
  y += 6;
  if (lawyerProfile.name) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...DARK_COLOR);
    doc.text(`Dr(a). ${lawyerProfile.name}`, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 5;
  }
  if (lawyerProfile.specialty) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_COLOR);
    doc.text(`Especialidade: ${lawyerProfile.specialty}`, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 4;
  }
  if (lawyerProfile.oab) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_COLOR);
    doc.text(`OAB: ${lawyerProfile.oab}`, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 4;
  }

  // Linha separadora
  y += 4;
  doc.setDrawColor(...GOLD_COLOR);
  doc.setLineWidth(1);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 10;

  // ═══════════════════════════════════════════════════════════
  // TÍTULO DO CONTRATO
  // ═══════════════════════════════════════════════════════════
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...DARK_COLOR);
  doc.text('CONTRATO DE PRESTAÇÃO DE', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 7;
  doc.text('SERVIÇOS ADVOCATÍCIOS', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 10;

  // Data do documento
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY_COLOR);
  doc.text(`Data de Emissão: ${formatDate(caseItem.updatedAt || caseItem.createdAt)}`, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 12;

  // ═══════════════════════════════════════════════════════════
  // SEÇÃO 1: IDENTIFICAÇÃO DAS PARTES
  // ═══════════════════════════════════════════════════════════
  
  y = drawSectionTitle(doc, 'Cláusula 1ª — Identificação das Partes', y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_COLOR);
  doc.text('CONTRATANTE (Cliente):', MARGIN_LEFT, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Nome: ${caseItem.clientName}`, MARGIN_LEFT + 5, y);
  y += 5;
  doc.text(`Qualificação Processual: ${caseItem.clientRole}`, MARGIN_LEFT + 5, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_COLOR);
  doc.text('CONTRATADO (Advogado):', MARGIN_LEFT, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Nome: Dr(a). ${lawyerProfile.name || '________________________'}`, MARGIN_LEFT + 5, y);
  y += 5;
  doc.text(`Especialidade: ${lawyerProfile.specialty || '________________________'}`, MARGIN_LEFT + 5, y);
  y += 5;
  doc.text(`OAB: ${lawyerProfile.oab || '________________________'}`, MARGIN_LEFT + 5, y);
  y += 10;

  // ═══════════════════════════════════════════════════════════
  // SEÇÃO 2: OBJETO DO CONTRATO
  // ═══════════════════════════════════════════════════════════
  
  y = drawSectionTitle(doc, 'Cláusula 2ª — Objeto do Contrato', y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  y = addWrappedText(
    doc,
    `O presente contrato tem por objeto a prestação de serviços advocatícios pelo CONTRATADO ao CONTRATANTE, consistente na defesa e acompanhamento do seguinte processo/causa:`,
    MARGIN_LEFT,
    y,
    CONTENT_WIDTH,
    5,
  );
  y += 4;

  // Dados do processo em destaque
  doc.setFillColor(245, 245, 245);
  const boxHeight = 32;
  y = addNewPageIfNeeded(doc, y, boxHeight + 5);
  doc.roundedRect(MARGIN_LEFT, y - 3, CONTENT_WIDTH, boxHeight, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_COLOR);
  doc.text(`Processo/Causa: ${caseItem.title}`, MARGIN_LEFT + 5, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ramo Jurídico: ${caseItem.area}`, MARGIN_LEFT + 5, y + 11);
  doc.text(`Vara/Tribunal: ${caseItem.court || 'A definir'}`, MARGIN_LEFT + 5, y + 18);
  doc.text(`Data de Cadastro: ${formatDateShort(caseItem.createdAt)}`, MARGIN_LEFT + 5, y + 25);
  y += boxHeight + 6;

  // ═══════════════════════════════════════════════════════════
  // SEÇÃO 3: DESCRIÇÃO DOS FATOS
  // ═══════════════════════════════════════════════════════════
  
  if (caseItem.factsDescription) {
    y = drawSectionTitle(doc, 'Cláusula 3ª — Descrição dos Fatos', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);

    y = addWrappedText(doc, caseItem.factsDescription, MARGIN_LEFT, y, CONTENT_WIDTH, 5);
    y += 8;
  }

  // ═══════════════════════════════════════════════════════════
  // SEÇÃO 4: ORÇAMENTO E HONORÁRIOS
  // ═══════════════════════════════════════════════════════════
  
  y = drawSectionTitle(doc, 'Cláusula 4ª — Honorários Advocatícios e Pagamento', y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  if (caseItem.budgetValue || caseItem.budgetDescription) {
    // Existe orçamento cadastrado
    if (caseItem.budgetDescription) {
      doc.setFont('helvetica', 'bold');
      doc.text('Descrição dos Serviços:', MARGIN_LEFT, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(doc, caseItem.budgetDescription, MARGIN_LEFT + 5, y, CONTENT_WIDTH - 5, 5);
      y += 4;
    }

    if (caseItem.budgetValue) {
      // Box de valor em destaque
      y = addNewPageIfNeeded(doc, y, 20);
      doc.setFillColor(250, 245, 230);
      doc.setDrawColor(...GOLD_COLOR);
      doc.setLineWidth(0.5);
      doc.roundedRect(MARGIN_LEFT, y - 3, CONTENT_WIDTH, 16, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...DARK_COLOR);
      doc.text(`Valor Total dos Honorários: R$ ${caseItem.budgetValue}`, MARGIN_LEFT + 5, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...GRAY_COLOR);
      const paymentInfo = [
        caseItem.paymentMethod ? `Forma: ${caseItem.paymentMethod}` : null,
        caseItem.paymentInstallments ? `Condição: ${caseItem.paymentInstallments}` : null,
      ]
        .filter(Boolean)
        .join('  |  ');
      if (paymentInfo) {
        doc.text(paymentInfo, MARGIN_LEFT + 5, y + 10);
      }
      y += 20;
    }
  } else {
    // Sem orçamento — campos em branco para preenchimento manual
    y = addWrappedText(
      doc,
      'Os honorários advocatícios serão ajustados entre as partes nos seguintes termos:',
      MARGIN_LEFT,
      y,
      CONTENT_WIDTH,
      5,
    );
    y += 4;
    doc.text('Valor Total: R$ ____________________', MARGIN_LEFT + 5, y);
    y += 7;
    doc.text('Forma de Pagamento: ____________________', MARGIN_LEFT + 5, y);
    y += 7;
    doc.text('Condições / Parcelas: ____________________', MARGIN_LEFT + 5, y);
    y += 10;
  }

  y += 2;
  y = addWrappedText(
    doc,
    'Parágrafo Único: Os valores acima referem-se exclusivamente aos honorários advocatícios. Custas processuais, emolumentos, taxas, honorários periciais e demais despesas correm por conta do CONTRATANTE.',
    MARGIN_LEFT,
    y,
    CONTENT_WIDTH,
    5,
  );
  y += 8;

  // ═══════════════════════════════════════════════════════════
  // SEÇÃO 5: OBRIGAÇÕES
  // ═══════════════════════════════════════════════════════════
  
  y = drawSectionTitle(doc, 'Cláusula 5ª — Obrigações das Partes', y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  y = addWrappedText(
    doc,
    'I — O CONTRATADO obriga-se a empregar todo zelo, diligência e conhecimento técnico na condução da causa, mantendo o CONTRATANTE informado sobre o andamento processual.',
    MARGIN_LEFT,
    y,
    CONTENT_WIDTH,
    5,
  );
  y += 3;
  y = addWrappedText(
    doc,
    'II — O CONTRATANTE obriga-se a fornecer todos os documentos e informações necessários para a adequada defesa de seus interesses, bem como efetuar os pagamentos nos prazos avençados.',
    MARGIN_LEFT,
    y,
    CONTENT_WIDTH,
    5,
  );
  y += 8;

  // ═══════════════════════════════════════════════════════════
  // SEÇÃO 6: VIGÊNCIA
  // ═══════════════════════════════════════════════════════════

  y = drawSectionTitle(doc, 'Cláusula 6ª — Vigência', y);
  y = addWrappedText(
    doc,
    'O presente contrato vigorará pelo período necessário ao completo encerramento do processo/causa acima descrita, podendo ser rescindido por qualquer das partes mediante comunicação escrita com antecedência mínima de 30 (trinta) dias.',
    MARGIN_LEFT,
    y,
    CONTENT_WIDTH,
    5,
  );
  y += 10;

  // ═══════════════════════════════════════════════════════════
  // SEÇÃO 7: FORO
  // ═══════════════════════════════════════════════════════════
  
  y = drawSectionTitle(doc, 'Cláusula 7ª — Foro', y);
  y = addWrappedText(
    doc,
    `Fica eleito o foro ${caseItem.court ? `de ${caseItem.court}` : 'da Comarca competente'} para dirimir quaisquer questões oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`,
    MARGIN_LEFT,
    y,
    CONTENT_WIDTH,
    5,
  );
  y += 12;

  // ═══════════════════════════════════════════════════════════
  // ASSINATURAS
  // ═══════════════════════════════════════════════════════════
  
  y = addNewPageIfNeeded(doc, y, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY_COLOR);
  doc.text(
    `Por estarem justas e contratadas, assinam o presente instrumento em 2 (duas) vias de igual teor.`,
    PAGE_WIDTH / 2,
    y,
    { align: 'center' },
  );
  y += 5;
  doc.text(
    `Local e Data: ______________________, ${formatDate(new Date().toISOString())}`,
    PAGE_WIDTH / 2,
    y,
    { align: 'center' },
  );
  y += 20;

  // Linhas de assinatura
  const signWidth = 70;
  const leftSignX = MARGIN_LEFT + 10;
  const rightSignX = PAGE_WIDTH - MARGIN_RIGHT - signWidth - 10;

  doc.setDrawColor(...DARK_COLOR);
  doc.setLineWidth(0.3);

  // Contratante
  doc.line(leftSignX, y, leftSignX + signWidth, y);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK_COLOR);
  doc.text('CONTRATANTE', leftSignX + signWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_COLOR);
  doc.text(caseItem.clientName, leftSignX + signWidth / 2, y, { align: 'center' });

  // Contratado (advogado)
  const signY = y - 8;
  doc.setDrawColor(...DARK_COLOR);
  doc.line(rightSignX, signY, rightSignX + signWidth, signY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK_COLOR);
  doc.text('CONTRATADO', rightSignX + signWidth / 2, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_COLOR);
  doc.text(
    `Dr(a). ${lawyerProfile.name || '________________'}`,
    rightSignX + signWidth / 2,
    signY + 8,
    { align: 'center' },
  );
  if (lawyerProfile.oab) {
    doc.text(`OAB: ${lawyerProfile.oab}`, rightSignX + signWidth / 2, signY + 12, { align: 'center' });
  }

  y += 20;

  // ═══════════════════════════════════════════════════════════
  // RODAPÉ
  // ═══════════════════════════════════════════════════════════
  
  // Barra dourada inferior
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...GOLD_COLOR);
    doc.rect(0, 294, PAGE_WIDTH, 3, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...LIGHT_GRAY);
    doc.text(
      'Tec Justiça Lite — Tectreinamentos Informática LTDA | CNPJ: 40.963.840/0001-74',
      PAGE_WIDTH / 2,
      290,
      { align: 'center' },
    );
    doc.text(`Página ${i} de ${pageCount}`, PAGE_WIDTH - MARGIN_RIGHT, 290, { align: 'right' });
  }

  // ─── Salvar / Download do PDF ──────────────────────────────
  const fileName = `Contrato_${caseItem.clientName.replace(/[^a-zA-Z0-9À-ú]/g, '_')}_${formatDateShort(caseItem.createdAt).replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
