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
    // Migração: garantir que fotoTypes existe e status está definido
    const migratedVistoria = {
      ...vistoria,
      fotoTypes: vistoria.fotoTypes || vistoria.fotos.map(() => null),
      status: vistoria.status || (vistoria.vistoriaSalva ? 'completa' : 'rascunho'),
    };
    set({ currentVistoria: migratedVistoria, activeTab: 0, isEditing: true });
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
    const fotoTypes = [...currentVistoria.fotoTypes];
    
    if (fotoType) {
      fotosObrigatorias[fotoType] = true;
      fotoTypes.push(fotoType);
    } else {
      fotoTypes.push(null);
    }
    
    set({
      currentVistoria: {
        ...currentVistoria,
        fotos: [...currentVistoria.fotos, photoBase64],
        fotoTypes,
        fotosObrigatorias,
      },
    });
  },

  removePhoto: (index: number) => {
    const { currentVistoria } = get();
    if (!currentVistoria || currentVistoria.vistoriaSalva) return;
    const newFotos = [...currentVistoria.fotos];
    const newFotoTypes = [...currentVistoria.fotoTypes];
    const removedType = newFotoTypes[index];
    
    newFotos.splice(index, 1);
    newFotoTypes.splice(index, 1);
    
    // Se removeu uma foto de um tipo obrigatório, marcar como falso
    const fotosObrigatorias = { ...currentVistoria.fotosObrigatorias };
    if (removedType) {
      fotosObrigatorias[removedType] = false;
    }
    
    set({
      currentVistoria: {
        ...currentVistoria,
        fotos: newFotos,
        fotoTypes: newFotoTypes,
        fotosObrigatorias,
      },
    });
  },

  markPhotoAsType: (index, fotoType) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    
    const newFotoTypes = [...currentVistoria.fotoTypes];
    const oldType = newFotoTypes[index];
    newFotoTypes[index] = fotoType;
    
    // Atualizar fotosObrigatorias
    const fotosObrigatorias = { ...currentVistoria.fotosObrigatorias };
    fotosObrigatorias[fotoType] = true;
    
    // Se tinha um tipo anterior, remover se não houver mais fotos desse tipo
    if (oldType && oldType !== fotoType) {
      const hasAnotherOfOldType = newFotoTypes.some(t => t === oldType);
      if (!hasAnotherOfOldType) {
        fotosObrigatorias[oldType] = false;
      }
    }
    
    set({
      currentVistoria: {
        ...currentVistoria,
        fotoTypes: newFotoTypes,
        fotosObrigatorias,
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
