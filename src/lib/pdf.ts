import jsPDF from "jspdf";
import { Vistoria } from "@/types/vistoria";

// CONFIGURAÇÕES DO CABEÇALHO / CORES
const BANNER_LOCAL = "/hguinchos.png";
const BANNER_FALLBACK = "https://via.placeholder.com/1200x300/0f4c81/ffffff?text=GRUPO+H+GUINCHOS";

const PRIMARY = "#0f4c81";
const ACCENT = "#e9ecef";
const SUCCESS = "#28a745";
const DANGER = "#dc3545";
const WARNING = "#ffc107";
const INFO = "#17a2b8";

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const resolved = url.startsWith("/") && typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    const response = await fetch(resolved);
    if (!response.ok) throw new Error();
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function getImageSize(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 1200, h: 300 });
    img.src = dataUrl;
  });
}

function detectImageFormat(dataUrl?: string): string {
  if (!dataUrl) return "PNG";
  const m = dataUrl.match(/^data:image\/([^;]+);/i);
  return m ? m[1].toUpperCase() : "PNG";
}

async function addImageAuto(doc: jsPDF, image: string, x: number, y: number, w: number, h: number) {
  if (!image) return false;
  if (image.startsWith("data:")) {
    try { doc.addImage(image, detectImageFormat(image) as any, x, y, w, h); return true; } catch { /* fallthrough */ }
  }
  if (/^https?:\/\//i.test(image) || image.startsWith("/")) {
    const data = await fetchImageAsDataUrl(image);
    if (data) {
      try { doc.addImage(data, detectImageFormat(data) as any, x, y, w, h); return true; } catch { /* fallthrough */ }
    }
  }
  try { (doc as any).addImage(image, x, y, w, h); return true; } catch { return false; }
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function mapStatus(s: string | null): { text: string; color: string } {
  switch (s) {
    case "S": return { text: "S", color: SUCCESS };
    case "N": return { text: "N", color: DANGER };
    case "I": return { text: "I", color: WARNING };
    case "A": return { text: "A", color: INFO };
    default: return { text: "-", color: "#6c757d" };
  }
}

function normalizeText(s: string): string {
  if (!s) return "";
  // Unicode normalize, remove zero-width / non breaking spaces, normalize quotes/dashes
  let t = String(s).normalize("NFKC");
  t = t.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, " "); // zero-width & NBSP -> space
  t = t.replace(/[''‛`´\u2018\u2019]/g, "'"); // fancy apostrophes -> '
  t = t.replace(/[""„]/g, '"'); // fancy quotes -> "
  t = t.replace(/[\u2013\u2014]/g, "-"); // ndashes/em dashes -> hyphen
  t = t.replace(/\u00AD/g, ""); // soft hyphen
  t = t.replace(/\s+/g, " ").trim();

  // Collapse long sequences of single-letter tokens (ex: "O r i g e m" -> "Origem")
  t = t.replace(/((?:[A-Za-zÀ-ÖØ-öø-ÿ]\s+){3,}[A-Za-zÀ-ÖØ-öø-ÿ])/g, (m) => m.replace(/\s+/g, ""));

  // Remove spaces before punctuation and ensure single space after punctuation
  t = t.replace(/\s+([,.:;!?])/g, "$1");
  t = t.replace(/([,.:;!?])([^\s])/g, "$1 $2");

  return t.trim();
}

export async function generateVistoriaPdf(v: Vistoria, opts: { autoSave?: boolean } = {}): Promise<Blob> {
  const { autoSave = false } = opts;

  // PORTRAIT A4
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth(); // ~210
  const pageH = doc.internal.pageSize.getHeight(); // ~297
  const margin = 6;
  let y = margin;

  // BANNER COM LOGO E TÍTULO
  const bannerH = 20;
  doc.setFillColor(15, 76, 129);
  doc.rect(margin, y, pageW - margin * 2, bannerH, "F");
  
  // Logo (se existir)
  let bannerData = await fetchImageAsDataUrl(BANNER_LOCAL);
  if (!bannerData) bannerData = await fetchImageAsDataUrl(BANNER_FALLBACK);
  
  if (bannerData) {
    const size = await getImageSize(bannerData);
    const maxLogoH = bannerH - 2;
    const maxLogoW = 40;
    const ratio = size.w > 0 ? size.w / size.h : 1;
    let logoH = maxLogoH;
    let logoW = Math.min(maxLogoW, logoH * ratio);
    const logoX = margin + 3;
    const logoY = y + (bannerH - logoH) / 2;
    await addImageAuto(doc, bannerData, logoX, logoY, logoW, logoH);
  }
  
  // Título no banner
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("FICHA DE VISTORIA", pageW / 2, y + bannerH / 2 + 3, { align: "center" });
  
  doc.setTextColor(0, 0, 0);
  y += bannerH + 4;

  // HEADER COMPACTO COM VISTORIA #, PLACA, DATA
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Vistoria #${v.numero}`, margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Placa: ${normalizeText(v.placa || "-")}`, margin + 50, y);
  doc.text(`Data: ${v.data || "-"} ${v.hora || ""}`, pageW - margin - 30, y, { align: "left" });
  y += 6;

  // INFORMAÇÕES DO VEÍCULO - Compacto e limpo
  const infoCompact = [
    { label: "Veículo", value: normalizeText(v.veiculo || "-") },
    { label: "Cor/Ano", value: normalizeText(`${v.cor || "-"} / ${v.ano || "-"}`) },
    { label: "Seguradora", value: normalizeText(v.seguradora || "-") },
    { label: "Segurado", value: normalizeText(v.segurado || "-") },
    { label: "Telefone", value: normalizeText(v.telefone || "-") },
    { label: "Origem", value: normalizeText(v.local || "-") },
    { label: "Destino", value: normalizeText(v.destino || "-") }
  ];

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 76, 129);
  
  const colW = (pageW - margin * 2) / 2;
  for (let i = 0; i < infoCompact.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * colW;
    const itemY = y + row * 5.5;
    
    doc.text(infoCompact[i].label + ":", x, itemY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    
    const valueLines = doc.splitTextToSize(infoCompact[i].value, colW - 25);
    doc.text(valueLines[0] || "-", x + 20, itemY);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 76, 129);
  }
  
  y += Math.ceil(infoCompact.length / 2) * 5.5 + 2;

  // ITENS DE SEGURANÇA - Cards compactos e pequenos
  const itensSeguranca = v.itensSeguranca || {};
  const segurancaItems = [
    { key: "estepe", label: "Estepe" },
    { key: "macaco", label: "Macaco" },
    { key: "chaveDeRoda", label: "Chave de Roda" },
    { key: "triangulo", label: "Triangulo" }
  ];

  // Cabeçalho da seção
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 76, 129);
  doc.text("SEGURANCA", margin, y);
  y += 3;

  // Cards dos itens - mais compactos
  doc.setFontSize(6.5);
  const cardW = (pageW - margin * 2) / 4 - 0.5;
  const cardH = 6;
  
  for (let i = 0; i < segurancaItems.length; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const cardX = margin + col * (cardW + 0.5);
    const cardY = y + row * 7;
    
    const status = (itensSeguranca as any)[segurancaItems[i].key];
    const statusChar = status === "S" ? "S" : status === "N" ? "N" : "-";
    const statusColor = status === "S" ? [40, 167, 69] : status === "N" ? [220, 53, 69] : [180, 180, 180];
    
    // Card background
    doc.setFillColor(...statusColor);
    doc.setLineWidth(0.1);
    doc.setDrawColor(150, 150, 150);
    doc.rect(cardX, cardY, cardW, cardH, "F");
    
    // Text - apenas label e status
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    const labelText = normalizeText(segurancaItems[i].label);
    doc.setFontSize(6);
    doc.text(labelText, cardX + 0.5, cardY + 3);
    doc.setFontSize(5);
    doc.text(statusChar, cardX + cardW - 1.5, cardY + 3, { align: "right" });
  }
  
  y += 8;

  // ITENS AUSENTES / AVARIAS — se houver
  const hasIssues = v.itensAusentes || v.possuiAvarias;
  if (hasIssues) {
    // Separador antes da seção
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 3;

    // Título da seção
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(220, 53, 69);
    doc.text("OBSERVACOES IMPORTANTES", margin, y);
    y += 5;

    // Itens ausentes
    if (v.itensAusentes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("Itens Ausentes:", margin + 1, y);
      y += 3.5;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 30, 30);
      const descLines = doc.splitTextToSize(normalizeText(v.descricaoItensAusentes || "-"), pageW - margin * 2 - 4);
      for (let idx = 0; idx < Math.min(descLines.length, 2); idx++) {
        doc.text(descLines[idx], margin + 2, y + idx * 3);
      }
      y += Math.min(descLines.length, 2) * 3 + 2;
    }

    // Avarias e danos
    if (v.possuiAvarias) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("Avarias / Danos:", margin + 1, y);
      y += 3.5;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 30, 30);
      const avariasLines = doc.splitTextToSize(normalizeText(v.descricaoAvarias || "-"), pageW - margin * 2 - 4);
      for (let idx = 0; idx < Math.min(avariasLines.length, 2); idx++) {
        doc.text(avariasLines[idx], margin + 2, y + idx * 3);
      }
      y += Math.min(avariasLines.length, 2) * 3 + 2;
    }

    // Separador depois da seção
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  }

  // VÍDEO DE SEGURANÇA — se existir
  if (v.videoSeguranca) {
    doc.setFillColor(40, 167, 69);
    doc.rect(margin, y, pageW - margin * 2, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("VIDEO DE SEGURANCA GRAVADO", pageW / 2, y + 3.5, { align: "center" });
    y += 8;
  }

  // FOTOS DA VISTORIA
  const vistoFotos = v.fotos || [];
  const vistoFotoTypes = v.fotosObrigatorias || {};
  const vistoFotoTypeLabels: { [key: string]: string } = {
    veiculoNoLocal: "No Local",
    veiculoNoGabarito: "No Gabarito",
    veiculoEntregue: "Entregue"
  };

  if (vistoFotos.length > 0) {
    if (y > pageH - margin - 80) {
      doc.addPage();
      y = margin + 6;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 76, 129);
    doc.text("FOTOS", margin, y);
    y += 5;

    const fotoW = (pageW - margin * 2) / 2 - 1;
    const fotoH = 35;
    let fotoCount = 0;

    for (let fi = 0; fi < vistoFotos.length && fotoCount < 5; fi++) {
      const fotoCol = fotoCount % 2;
      const fotoRow = Math.floor(fotoCount / 2);
      const fotoX = margin + fotoCol * (fotoW + 2);
      const fotoY = y + fotoRow * (fotoH + 11);

      if (fotoY + fotoH + 10 > pageH - margin) {
        doc.addPage();
        y = margin + 6;
        fotoCount = 0;
        fi--;
        continue;
      }

      // Borda da foto
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.rect(fotoX, fotoY, fotoW, fotoH);

      // Imagem
      try {
        await addImageAuto(doc, vistoFotos[fi], fotoX + 0.5, fotoY + 0.5, fotoW - 1, fotoH - 1);
      } catch {
        // vazio
      }

      // Label
      let fotoLabel = "Foto";
      for (const [typeKey, typeValue] of Object.entries(vistoFotoTypes)) {
        if (typeValue === vistoFotos[fi]) {
          fotoLabel = vistoFotoTypeLabels[typeKey] || "Foto";
          break;
        }
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(fotoLabel, fotoX + 1, fotoY + fotoH + 2.5);
      
      fotoCount++;
    }

    y = y + Math.ceil(fotoCount / 2) * (fotoH + 11) + 2;
  }

  // OBSERVAÇÕES

  const obsParts = [
    v.motivoChamada || (v.motivoOutro ? `${v.motivoOutro}` : ""),
    v.observacoes || ""
  ].filter(Boolean);
  const obsText = obsParts.join("\n\n");
  
  if (obsText) {
    if (y > pageH - margin - 60) {
      doc.addPage();
      y = margin + 6;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 76, 129);
    doc.text("OBSERVACOES", margin, y);
    y += 4;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(obsText.replace(/\s+/g, " ").trim(), pageW - margin * 2 - 2);
    const toPrint = lines.slice(0, Math.min(6, lines.length));
    for (let idx = 0; idx < toPrint.length; idx++) {
      doc.text(toPrint[idx], margin + 1, y + idx * 2.8);
    }
    y += toPrint.length * 2.8 + 2;
  }

  // ASSINATURAS
  if (y > pageH - margin - 100) {
    doc.addPage();
    y = margin + 6;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 76, 129);
  doc.text("ASSINATURAS E DECLARACOES", margin, y);
  y += 9;

  // ========== CLIENTE ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("CLIENTE", margin, y);
  y += 5;
  
  // Declaração do Cliente
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const clientDecl = "Declaro estar de acordo e concordo com as informacoes registradas nesta ficha de vistoria.";
  const clientDeclLines = doc.splitTextToSize(clientDecl, pageW - margin * 2 - 2);
  for (let cdIdx = 0; cdIdx < clientDeclLines.length; cdIdx++) {
    doc.text(clientDeclLines[cdIdx], margin + 1, y + cdIdx * 3.5);
  }
  y += clientDeclLines.length * 3.5 + 4;

  // Caixa de assinatura Cliente
  const sigW = (pageW - margin * 2) / 2 - 1;
  const sigH = 22;
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, sigW, sigH);
  
  // Imagem de assinatura
  if (v.declaracaoEntrega?.assinaturaBase64) {
    try {
      await addImageAuto(doc, v.declaracaoEntrega.assinaturaBase64, margin + 0.5, y + 0.5, sigW - 1, sigH - 1);
    } catch {}
  }
  
  y += sigH + 3;
  
  // Linha e nome Cliente + CPF
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  const clientName = normalizeText(v.declaracaoEntrega?.nome || "");
  const clientLine = clientName || "___________________________________";
  doc.text(clientLine, margin, y);
  
  y += 3;
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  const clientCPF = v.declaracaoEntrega?.cpf || "";
  doc.text(`CPF: ${clientCPF}`, margin, y);
  
  y += 3;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Assinatura do Cliente", margin, y);
  
  y += 10;

  // ========== DESTINATÁRIO ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("DESTINATARIO", margin, y);
  y += 5;
  
  // Declaração do Destinatário
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const recvDecl = "Declaro ter recebido o veiculo de acordo com as informacoes registradas nesta ficha de vistoria.";
  const recvDeclLines = doc.splitTextToSize(recvDecl, pageW - margin * 2 - 2);
  for (let rdIdx = 0; rdIdx < recvDeclLines.length; rdIdx++) {
    doc.text(recvDeclLines[rdIdx], margin + 1, y + rdIdx * 3.5);
  }
  y += recvDeclLines.length * 3.5 + 4;

  // Caixa de assinatura Destinatário
  if (y + sigH + 8 > pageH - margin) {
    doc.addPage();
    y = margin + 6;
  }
  
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, sigW, sigH);
  
  // Imagem de assinatura
  if (v.declaracaoRecebimento?.assinaturaBase64) {
    try {
      await addImageAuto(doc, v.declaracaoRecebimento.assinaturaBase64, margin + 0.5, y + 0.5, sigW - 1, sigH - 1);
    } catch {}
  }
  
  y += sigH + 3;
  
  // Linha e nome Destinatário + CPF
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  const recvName = normalizeText(v.declaracaoRecebimento?.nome || "");
  const recvLine = recvName || "___________________________________";
  doc.text(recvLine, margin, y);
  
  y += 3;
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  const recvCPF = v.declaracaoRecebimento?.cpf || "";
  doc.text(`CPF: ${recvCPF}`, margin, y);
  
  y += 3;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Assinatura do Destinatario", margin, y);

  // RODAPÉ COM NÚMERO DE PÁGINAS
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Grupo H Guinchos • Página ${i} de ${totalPages}`, pageW / 2, pageH - 3, { align: "center" });
  }

  const arrayBuffer = doc.output("arraybuffer") as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });

  if (autoSave) {
    try {
      doc.save(`Vistoria_${v.numero}_GrupoH.pdf`);
    } catch {
      // ignore
    }
  }

  return blob;
}