import { create } from 'zustand';
import { Vistoria, createEmptyVistoria, DadosCarro, Assinatura, StatusItem } from '@/types/vistoria';
import { v4 as uuidv4 } from 'uuid';

interface VistoriaStore {
  currentVistoria: Vistoria | null;
  activeTab: number;
  isEditing: boolean;
  
  // Actions
  initNewVistoria: (numero: string) => void;
  loadVistoria: (vistoria: Vistoria) => void;
  setActiveTab: (tab: number) => void;
  
  // Field updates
  updateField: <K extends keyof Vistoria>(field: K, value: Vistoria[K]) => void;
  updateDadosCarro: (field: keyof DadosCarro, value: StatusItem) => void;
  updateItensSeguranca: (field: keyof Vistoria['itensSeguranca'], value: StatusItem) => void;
  updateItensAusentes: (ausentes: boolean | null, descricao?: string) => void;
  updateAvarias: (temAvarias: boolean | null, descricao?: string) => void;
  updateDeclaracaoEntrega: (field: keyof Assinatura, value: string) => void;
  updateDeclaracaoRecebimento: (field: keyof Assinatura, value: string) => void;
  
  // Photos
  addPhoto: (photoBase64: string, fotoType?: 'veiculoNoLocal' | 'veiculoNoGabarito' | 'veiculoEntregue') => void;
  removePhoto: (index: number) => void;
  markPhotoAsType: (index: number, fotoType: 'veiculoNoLocal' | 'veiculoNoGabarito' | 'veiculoEntregue') => void;
  addVideo: (videoBase64: string) => void;
  removeVideo: () => void;
  markVistoriaAsSaved: () => void;
  
  // Reset
  reset: () => void;
}

export const useVistoriaStore = create<VistoriaStore>((set, get) => ({
  currentVistoria: null,
  activeTab: 0,
  isEditing: false,

  initNewVistoria: (numero: string) => {
    const newVistoria = createEmptyVistoria(numero);
    newVistoria.id = uuidv4();
    set({ currentVistoria: newVistoria, activeTab: 0, isEditing: false });
  },

  loadVistoria: (vistoria: Vistoria) => {
    set({ currentVistoria: vistoria, activeTab: 0, isEditing: true });
  },

  setActiveTab: (tab: number) => {
    set({ activeTab: tab });
  },

  updateField: (field, value) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        [field]: value,
      },
    });
  },

  updateDadosCarro: (field, value) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        dadosCarro: {
          ...currentVistoria.dadosCarro,
          [field]: value,
        },
      },
    });
  },

  updateItensSeguranca: (field, value) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        itensSeguranca: {
          ...currentVistoria.itensSeguranca,
          [field]: value,
        },
      },
    });
  },

  updateItensAusentes: (ausentes, descricao) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        itensAusentes: ausentes,
        descricaoItensAusentes: descricao ?? (ausentes === false ? '' : currentVistoria.descricaoItensAusentes),
      },
    });
  },

  updateAvarias: (temAvarias, descricao) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        possuiAvarias: temAvarias,
        descricaoAvarias: descricao ?? (temAvarias === false ? '' : currentVistoria.descricaoAvarias),
      },
    });
  },

  updateDeclaracaoEntrega: (field, value) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        declaracaoEntrega: {
          ...currentVistoria.declaracaoEntrega,
          [field]: value,
        },
      },
    });
  },

  updateDeclaracaoRecebimento: (field, value) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        declaracaoRecebimento: {
          ...currentVistoria.declaracaoRecebimento,
          [field]: value,
        },
      },
    });
  },

  addPhoto: (photoBase64, fotoType) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    
    const fotosObrigatorias = { ...currentVistoria.fotosObrigatorias };
    if (fotoType) {
      fotosObrigatorias[fotoType] = true;
    }
    
    set({
      currentVistoria: {
        ...currentVistoria,
        fotos: [...currentVistoria.fotos, photoBase64],
        fotosObrigatorias,
      },
    });
  },

  removePhoto: (index: number) => {
    const { currentVistoria } = get();
    if (!currentVistoria || currentVistoria.vistoriaSalva) return;
    const newFotos = [...currentVistoria.fotos];
    newFotos.splice(index, 1);
    set({
      currentVistoria: {
        ...currentVistoria,
        fotos: newFotos,
      },
    });
  },

  markPhotoAsType: (index, fotoType) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        fotosObrigatorias: {
          ...currentVistoria.fotosObrigatorias,
          [fotoType]: true,
        },
      },
    });
  },

  addVideo: (videoBase64) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        videoSeguranca: videoBase64,
      },
    });
  },

  removeVideo: () => {
    const { currentVistoria } = get();
    if (!currentVistoria || currentVistoria.vistoriaSalva) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        videoSeguranca: null,
      },
    });
  },

  markVistoriaAsSaved: () => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        vistoriaSalva: true,
      },
    });
  },

  reset: () => {
    set({ currentVistoria: null, activeTab: 0, isEditing: false });
  },
}));
