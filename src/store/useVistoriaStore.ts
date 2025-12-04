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
  updateDeclaracaoEntrega: (field: keyof Assinatura, value: string) => void;
  updateDeclaracaoRecebimento: (field: keyof Assinatura, value: string) => void;
  
  // Photos
  addPhoto: (photoBase64: string) => void;
  removePhoto: (index: number) => void;
  
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

  addPhoto: (photoBase64: string) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    set({
      currentVistoria: {
        ...currentVistoria,
        fotos: [...currentVistoria.fotos, photoBase64],
      },
    });
  },

  removePhoto: (index: number) => {
    const { currentVistoria } = get();
    if (!currentVistoria) return;
    const newFotos = [...currentVistoria.fotos];
    newFotos.splice(index, 1);
    set({
      currentVistoria: {
        ...currentVistoria,
        fotos: newFotos,
      },
    });
  },

  reset: () => {
    set({ currentVistoria: null, activeTab: 0, isEditing: false });
  },
}));
