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
  t = t.replace(/[’‘‛`´ \u2018\u2019]/g, "'"); // fancy apostrophes -> '
  t = t.replace(/[“”„]/g, '"'); // fancy quotes -> "
  t = t.replace(/[\u2013\u2014]/g, "-"); // ndashes/em dashes -> hyphen
  t = t.replace(/\u00AD/g, ""); // soft hyphen
  t = t.replace(/\s+/g, " ").trim();

  // Collapse long sequences of single-letter tokens (ex: "O r i g e m" -> "Origem")
  t = t.replace(/((?:[A-Za-zÀ-ÖØ-öø-ÿ]\s+){3,}[A-Za-zÀ-ÖØ-öø-ÿ])/g, (m) => m.replace(/\s+/g, ""));

  // Remove spaces before punctuation and ensure single space after punctuation
  t = t.replace(/\s+([,.:;!?])/g, "$1");
  t = t.replace(/([,.:;!?])([^\s'"])/g, "$1 $2");

  return t.trim();
}

export async function generateVistoriaPdf(v: Vistoria, opts: { autoSave?: boolean } = {}): Promise<Blob> {
  const { autoSave = false } = opts;

  // PORTRAIT A4
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth(); // ~210
  const pageH = doc.internal.pageSize.getHeight(); // ~297
  const margin = 8;
  let y = margin;

  // BANNER SIMPLES: branco com borda, logo à esquerda e nome menor à direita
  const bannerH = 28;
  const innerPad = 6;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, pageW - margin * 2, bannerH, "F");
  doc.setDrawColor(200);
  doc.setLineWidth(0.6);
  doc.rect(margin, y, pageW - margin * 2, bannerH, "S");

  let bannerData = await fetchImageAsDataUrl(BANNER_LOCAL);
  if (!bannerData) bannerData = await fetchImageAsDataUrl(BANNER_FALLBACK);

  if (bannerData) {
    const size = await getImageSize(bannerData);
    const maxLogoH = bannerH - innerPad * 2;
    const maxLogoW = 60;
    const ratio = size.w > 0 ? size.w / size.h : 1;
    let logoH = maxLogoH;
    let logoW = Math.min(maxLogoW, logoH * ratio);
    const logoX = margin + innerPad;
    const logoY = y + (bannerH - logoH) / 2;
    await addImageAuto(doc, bannerData, logoX, logoY, logoW, logoH);
    // texto do nome alinhado à direita do logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 76, 129);
    doc.text("Grupo H Guinchos", logoX + logoW + 6, y + bannerH / 2 + 5);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 76, 129);
    doc.text("Grupo H Guinchos", margin + 8, y + bannerH / 2 + 5);
  }
  doc.setTextColor(0, 0, 0);
  y += bannerH + 6;

  // HEADER COM DADOS BREVE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Vistoria #${v.numero}`, margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Placa: ${v.placa || "-"}`, margin + 100, y);
  doc.text(`Data: ${v.data || "-"} ${v.hora || ""}`, pageW - margin, y, { align: "right" });
  y += 8;

  // SEPARADOR FINO
  doc.setDrawColor(220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  // INFORMAÇÕES DO VEÍCULO (dados usados abaixo)
  const info = [
    ["Seguradora", normalizeText(v.seguradora || "-")],
    ["Veículo", normalizeText(v.veiculo || "-")],
    ["Cor / Ano", normalizeText(`${v.cor || "-"} / ${v.ano || "-"}`)],
    ["Segurado", normalizeText(v.segurado || "-")],
    ["Telefone", normalizeText(v.telefone || "-")],
    ["Origem → Destino", `${normalizeText(v.local || "-")} → ${normalizeText(v.destino || "-")}`],
  ];

  // INFORMAÇÕES DO VEÍCULO — versão mais compacta e robusta contra "letras espaçadas"
  doc.setFontSize(8.5); // menor para caber mais
  const infoCols = 2;
  const infoGap = 6;
  const infoUsableW = pageW - margin * 2;
  const infoColW = (infoUsableW - infoGap) / infoCols;
  const infoLabelW = 30; // label menor
  const infoLineH = 3.8;
  let infoMaxRowH = 0;

  for (let i = 0; i < info.length; i++) {
    const col = i % infoCols;
    const row = Math.floor(i / infoCols);
    const x = margin + col * (infoColW + infoGap);
    const baseY = y + row * (infoLineH * 2 + 2); // linhas mais compactas

    // normalize and clean inputs (fix spaced-letters)
    const rawLabel = normalizeText(String(info[i][0] ?? "")).replace(/\s+/g, " ").trim() + ":";
    let rawValue = normalizeText(String(info[i][1] ?? "-")).replace(/\s+/g, " ").trim();
    if (!rawValue) rawValue = "-";

    // label (bold) - keep short width
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 76, 129);
    const labelLines = doc.splitTextToSize(rawLabel, infoLabelW);
    for (let li = 0; li < labelLines.length; li++) {
      doc.text(labelLines[li], x, baseY + li * infoLineH);
    }

    // value (normal) - allow up to 2 lines, then truncate with ellipsis
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const valueW = infoColW - infoLabelW - 6;
    const rawLines = doc.splitTextToSize(rawValue, valueW);
    const maxValueLines = 2;
    const valueLines = rawLines.slice(0, maxValueLines);
    if (rawLines.length > maxValueLines) {
      // try to append ellipsis to last visible line without exceeding width
      let last = valueLines[valueLines.length - 1];
      while (doc.getTextWidth(last + "...") > valueW && last.length > 0) last = last.slice(0, -1);
      valueLines[valueLines.length - 1] = last + (last.length ? "..." : "...");
    }

    const valueX = x + infoLabelW + 6;
    for (let vi = 0; vi < valueLines.length; vi++) {
      doc.text(valueLines[vi], valueX, baseY + vi * infoLineH);
    }

    const blockH = Math.max(labelLines.length, valueLines.length) * infoLineH;
    if (blockH > infoMaxRowH) infoMaxRowH = blockH;
  }

  const infoRows = Math.ceil(info.length / infoCols);
  y += infoRows * Math.max(7, infoMaxRowH) + 4;

  // CONDIÇÕES — linha compacta, fonte menor
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setFillColor(15, 76, 129);
  doc.setTextColor(255, 255, 255);
  doc.rect(margin, y, pageW - margin * 2, 8, "F");
  doc.text("CONDIÇÕES DO VEÍCULO", margin + 4, y + 6);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const cond = `Tipo: ${v.tipoVeiculo || "-"} • Serviço: ${v.tipoServico || "-"} • Docs: ${v.temDocumento ? "Sim" : "Não"} • Comb.: ${v.nivelCombustivel || "-"} • KM: ${v.quilometragem || "-"}`;
  const condLines = doc.splitTextToSize(cond, pageW - margin * 2);
  for (let i = 0; i < condLines.length; i++) doc.text(condLines[i], margin, y + i * 4.2);
  y += condLines.length * 4.2 + 6;

  // CHECKLIST — muito compacto para cabe numa página
  const entries = Object.entries(v.dadosCarro || {}).map(([k, val]) => ({
    label: formatLabel(k),
    status: mapStatus(val as any)
  }));

  // tentativa agressiva de compactação: pequenas fontes e 6 colunas
  const chkCols = 6;
  const chkGap = 3;
  const chkW = (pageW - margin * 2 - (chkCols - 1) * chkGap) / chkCols;
  const chkH = 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(15, 76, 129);
  doc.setTextColor(255, 255, 255);
  doc.rect(margin, y, pageW - margin * 2, 8, "F");
  doc.text("CHECK-LIST DE ITENS", margin + 4, y + 6);
  y += 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);

  for (let i = 0; i < entries.length; i++) {
    const col = i % chkCols;
    const row = Math.floor(i / chkCols);
    const x = margin + col * (chkW + chkGap);
    const cy = y + row * chkH;

    // se for ultrapassar página, pare ou force nova página (tentamos caber tudo em 1)
    if (cy + chkH > pageH - margin - 80) {
      // pouca margem: caso não caiba, reduzir espaçamento extra e continuar na próxima página
      doc.addPage();
      y = margin + 8;
    }

    // label (truncado em 1 linha)
    const lbl = doc.splitTextToSize(entries[i].label, chkW - 10)[0] || "-";
    doc.text(lbl, x, cy + 4);

    // status
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(entries[i].status.color);
    doc.text(entries[i].status.text, x + chkW - 2, cy + 4, { align: "right" });

    // reset font/color for next
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
  }
  y += Math.ceil(entries.length / chkCols) * chkH + 8;

  // OBSERVAÇÕES — limitado para evitar empurrar conteúdo
  const obsParts = [
    v.motivoChamada || (v.motivoOutro ? `Motivo: ${v.motivoOutro}` : ""),
    v.observacoes || ""
  ].filter(Boolean);
  const obsText = obsParts.join("\n\n");
  if (obsText) {
    // calculate available vertical space for observations (reserve space for signatures/photos)
    const reservedBelow = 110; // ajuste caso precise de mais espaço para assinaturas/fotos
    let availableH = Math.max(0, pageH - y - reservedBelow);
    // line height for obs (match other blocks)
    const obsLineH = 4.2;
    // max lines that fit
    let maxLines = Math.floor(availableH / obsLineH);
    if (maxLines <= 0) {
      // if nothing fits, push to next page but still limit lines
      doc.addPage();
      y = margin + 8;
      availableH = pageH - y - reservedBelow;
      maxLines = Math.max(3, Math.floor(availableH / obsLineH));
    }
    // hard cap so block doesn't become huge
    const capLines = 12;
    maxLines = Math.min(maxLines, capLines);

    // header
    doc.setFillColor(15, 76, 129);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.rect(margin, y, pageW - margin * 2, 8, "F");
    doc.text("OBSERVAÇÕES", margin + 4, y + 6);
    y += 10;

    // body: split into lines and truncate to fit
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(obsText.replace(/\s+/g, " ").trim(), pageW - margin * 2);
    const toPrint = lines.slice(0, Math.max(1, maxLines));
    for (let i = 0; i < toPrint.length; i++) {
      doc.text(toPrint[i], margin, y + i * obsLineH);
    }
    if (lines.length > toPrint.length) {
      // add ellipsis line to indicate truncation
      doc.text("... (continua)", margin, y + toPrint.length * obsLineH);
      y += (toPrint.length + 1) * obsLineH + 6;
    } else {
      y += toPrint.length * obsLineH + 6;
    }
  }

  // ASSINATURAS — mantidas, reduzidas em altura
  if (y > pageH - margin - 100) { doc.addPage(); y = margin + 8; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 76, 129);
  doc.text("ASSINATURAS", margin, y);
  y += 8;

  const sigW = (pageW - margin * 2 - 10) / 2;
  const sigH = 30;
  doc.setDrawColor(180);
  doc.rect(margin, y, sigW, sigH);
  if (v.declaracaoEntrega?.assinaturaBase64) {
    await addImageAuto(doc, v.declaracaoEntrega.assinaturaBase64, margin + 4, y + 4, sigW - 8, sigH - 8);
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Entrega: ${v.declaracaoEntrega?.nome || "____________________"}`, margin + 4, y + sigH + 6);

  doc.rect(margin + sigW + 10, y, sigW, sigH);
  if (v.declaracaoRecebimento?.assinaturaBase64) {
    await addImageAuto(doc, v.declaracaoRecebimento.assinaturaBase64, margin + sigW + 14, y + 4, sigW - 8, sigH - 8);
  }
  doc.text(`Recebimento: ${v.declaracaoRecebimento?.nome || "____________________"}`, margin + sigW + 14, y + sigH + 6);
  y += sigH + 12;

  // inserir apenas 1ª foto (quando houver) logo abaixo das assinaturas, centralizada
  const fotos = v.fotos || [];
  if (fotos.length > 0) {
    const first = fotos[0];
    // espaço mínimo antes da imagem
    if (y > pageH - margin - 80) { doc.addPage(); y = margin + 8; }
    // determinar largura máxima para foto (mantendo margem)
    const maxImgW = pageW - margin * 2;
    const maxImgH = pageH - y - margin - 20; // reservar rodapé
    // tamanho aproximado da imagem (proportional) — tentar manter largura 120mm se couber
    let imgW = Math.min(120, maxImgW);
    let imgH = imgW * 0.6;
    if (imgH > maxImgH) {
      imgH = maxImgH;
      imgW = imgH / 0.6;
    }
    const imgX = margin + (pageW - margin * 2 - imgW) / 2;
    const imgY = y;
    await addImageAuto(doc, first, imgX, imgY, imgW, imgH);
    y = imgY + imgH + 8;
  }

  // RODAPÉ COM NUMERO DE PÁGINAS
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Grupo H Guinchos • Página ${i} de ${totalPages}`, pageW / 2, pageH - 8, { align: "center" });
  }

  // Instead of forcing a download and returning a dataURI,
  // return a Blob. Optionally trigger a save if autoSave === true.
  const arrayBuffer = doc.output("arraybuffer") as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });

  if (autoSave) {
    // create a temporary object URL and trigger save via jspdf's save
    // jspdf.save still triggers download; call it to preserve previous behavior
    try {
      // prefer doc.save for consistent filename behaviour
      doc.save(`Vistoria_${v.numero}_GrupoH.pdf`);
    } catch {
      // ignore
    }
  }

  return blob;
}