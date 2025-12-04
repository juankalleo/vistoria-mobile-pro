export type StatusItem = 'S' | 'N' | 'I' | 'A' | null;

export interface DadosCarro {
  farolDianteiro: StatusItem;
  farolTraseiro: StatusItem;
  lanternaDianteira: StatusItem;
  lanternaTraseira: StatusItem;
  paraChoqueDianteiro: StatusItem;
  paraChoqueTraseiro: StatusItem;
  retrovisiorEsquerdo: StatusItem;
  retrovisiorDireito: StatusItem;
  capo: StatusItem;
  portaMalas: StatusItem;
  portaDianteiraEsquerda: StatusItem;
  portaDianteiraDireita: StatusItem;
  portaTraseiraEsquerda: StatusItem;
  portaTraseiraDireita: StatusItem;
  painelDianteiro: StatusItem;
  painelTraseiro: StatusItem;
  vidroParabrisaDianteiro: StatusItem;
  vidroParabrisaTraseiro: StatusItem;
  vidroLateralDianteiroEsquerdo: StatusItem;
  vidroLateralDianteiroDireito: StatusItem;
  vidroLateralTraseiroEsquerdo: StatusItem;
  vidroLateralTraseiroDireito: StatusItem;
  paraLamaDianteiroEsquerdo: StatusItem;
  paraLamaDianteiroDireito: StatusItem;
  paraLamaTraseiroEsquerdo: StatusItem;
  paraLamaTraseiroDireito: StatusItem;
  rodaDianteiraEsquerda: StatusItem;
  rodaDianteiraDireita: StatusItem;
  rodaTraseiraEsquerda: StatusItem;
  rodaTraseiraDireita: StatusItem;
  pneuDianteiroEsquerdo: StatusItem;
  pneuDianteiroDireito: StatusItem;
  pneuTraseiroEsquerdo: StatusItem;
  pneuTraseiroDireito: StatusItem;
  estepe: StatusItem;
  macaco: StatusItem;
  chaveDeRoda: StatusItem;
  triangulo: StatusItem;
  extintor: StatusItem;
  tapetes: StatusItem;
  radio: StatusItem;
  antena: StatusItem;
  bateria: StatusItem;
  chave: StatusItem;
  manual: StatusItem;
  documentos: StatusItem;
}

export interface Assinatura {
  nome: string;
  rg: string;
  data: string;
  hora: string;
  assinaturaBase64: string;
}

export interface Vistoria {
  id: string;
  numero: string;
  placa: string;
  data: string;
  hora: string;
  seguradora: string;
  veiculo: string;
  cor: string;
  ano: string;
  segurado: string;
  local: string;
  telefone: string;
  destino: string;
  tipoVeiculo: string;
  tipoServico: string;
  condicaoPneus: string;
  temDocumento: boolean;
  nivelCombustivel: string;
  quilometragem: string;
  motivoChamada: string;
  motivoOutro: string;
  dadosCarro: DadosCarro;
  observacoes: string;
  declaracaoEntrega: Assinatura;
  declaracaoRecebimento: Assinatura;
  fotos: string[];
  pdfBase64?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export const defaultDadosCarro: DadosCarro = {
  farolDianteiro: null,
  farolTraseiro: null,
  lanternaDianteira: null,
  lanternaTraseira: null,
  paraChoqueDianteiro: null,
  paraChoqueTraseiro: null,
  retrovisiorEsquerdo: null,
  retrovisiorDireito: null,
  capo: null,
  portaMalas: null,
  portaDianteiraEsquerda: null,
  portaDianteiraDireita: null,
  portaTraseiraEsquerda: null,
  portaTraseiraDireita: null,
  painelDianteiro: null,
  painelTraseiro: null,
  vidroParabrisaDianteiro: null,
  vidroParabrisaTraseiro: null,
  vidroLateralDianteiroEsquerdo: null,
  vidroLateralDianteiroDireito: null,
  vidroLateralTraseiroEsquerdo: null,
  vidroLateralTraseiroDireito: null,
  paraLamaDianteiroEsquerdo: null,
  paraLamaDianteiroDireito: null,
  paraLamaTraseiroEsquerdo: null,
  paraLamaTraseiroDireito: null,
  rodaDianteiraEsquerda: null,
  rodaDianteiraDireita: null,
  rodaTraseiraEsquerda: null,
  rodaTraseiraDireita: null,
  pneuDianteiroEsquerdo: null,
  pneuDianteiroDireito: null,
  pneuTraseiroEsquerdo: null,
  pneuTraseiroDireito: null,
  estepe: null,
  macaco: null,
  chaveDeRoda: null,
  triangulo: null,
  extintor: null,
  tapetes: null,
  radio: null,
  antena: null,
  bateria: null,
  chave: null,
  manual: null,
  documentos: null,
};

export const defaultAssinatura: Assinatura = {
  nome: '',
  rg: '',
  data: '',
  hora: '',
  assinaturaBase64: '',
};

export const createEmptyVistoria = (numero: string): Vistoria => ({
  id: '',
  numero,
  placa: '',
  data: new Date().toLocaleDateString('pt-BR'),
  hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  seguradora: '',
  veiculo: '',
  cor: '',
  ano: '',
  segurado: '',
  local: '',
  telefone: '',
  destino: '',
  tipoVeiculo: '',
  tipoServico: '',
  condicaoPneus: '',
  temDocumento: false,
  nivelCombustivel: '',
  quilometragem: '',
  motivoChamada: '',
  motivoOutro: '',
  dadosCarro: { ...defaultDadosCarro },
  observacoes: '',
  declaracaoEntrega: { ...defaultAssinatura },
  declaracaoRecebimento: { ...defaultAssinatura },
  fotos: [],
  criadoEm: new Date().toISOString(),
  atualizadoEm: new Date().toISOString(),
});
