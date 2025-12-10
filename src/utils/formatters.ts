export function formatPlaca(value: string): string {
  // Remove espaços e converte para maiúscula
  // Aceita até 10 caracteres (Mercosul novo: AAA1A23 = 7 caracteres)
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  return cleaned;
}

export function formatCPF(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  
  if (cleaned.length <= 3) {
    return cleaned;
  }
  
  if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  }
  
  if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  }
  
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

export function formatTelefone(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length <= 2) {
    return cleaned;
  }
  
  if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  }
  
  if (cleaned.length <= 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatQuilometragem(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function generateVistoriaNumber(lastNumber: number): string {
  return String(lastNumber + 1).padStart(6, '0');
}

export function validatePlaca(placa: string): boolean {
  // Remove formatação
  const cleaned = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Padrão antigo: 3 letras + 4 números
  const oldPattern = /^[A-Z]{3}\d{4}$/;
  
  // Padrão Mercosul: 3 letras + 1 número + 1 letra + 2 números
  const mercosulPattern = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  return oldPattern.test(cleaned) || mercosulPattern.test(cleaned);
}

export function getStatusLabel(status: string | null): string {
  switch (status) {
    case 'S': return 'Sim';
    case 'N': return 'Não';
    case 'I': return 'Incompleto';
    case 'A': return 'Avariado';
    default: return '-';
  }
}

export function getStatusColor(status: string | null): string {
  switch (status) {
    case 'S': return 'text-success';
    case 'N': return 'text-destructive';
    case 'I': return 'text-warning';
    case 'A': return 'text-info';
    default: return 'text-muted-foreground';
  }
}
