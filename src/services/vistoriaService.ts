// src/services/vistoriaService.ts
// Serviço para sincronizar vistorias com Supabase

import { supabase } from './supabaseClient';
import { Vistoria } from '@/types/vistoria';
import { getDB } from '@/database/db';
import { addToSyncQueue } from './authService';

/**
 * Salvar vistoria localmente E sincronizar com Supabase
 * Funciona offline: salva localmente e sincroniza quando online
 */
export async function saveVistoriaWithSync(
  vistoria: Vistoria,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Salvar localmente (sempre)
    const db = await getDB();
    vistoria.status = 'completa'; // Marcar como completa
    vistoria.vistoriaSalva = true;
    await db.put('vistorias', vistoria);

    // 2. Se online, sincronizar com Supabase
    if (navigator.onLine) {
      try {
        const { error } = await supabase.from('vistorias').upsert(
          [
            {
              id: vistoria.id,
              user_id: userId,
              numero: vistoria.numero,
              placa: vistoria.placa,
              data: vistoria.data,
              hora: vistoria.hora,
              seguradora: vistoria.seguradora,
              veiculo: vistoria.veiculo,
              cor: vistoria.cor,
              ano: vistoria.ano,
              segurado: vistoria.segurado,
              local: vistoria.local,
              telefone: vistoria.telefone,
              destino: vistoria.destino,
              tipo_veiculo: vistoria.tipoVeiculo,
              tipo_servico: vistoria.tipoServico,
              condicao_pneus: vistoria.condicaoPneus,
              tem_documento: vistoria.temDocumento,
              nivel_combustivel: vistoria.nivelCombustivel,
              quilometragem: vistoria.quilometragem,
              motivo_chamada: vistoria.motivoChamada,
              motivo_outro: vistoria.motivoOutro,
              status: vistoria.status,
              dados_carro: JSON.stringify(vistoria.dadosCarro),
              itens_seguranca: JSON.stringify(vistoria.itensSeguranca),
              itens_ausentes: vistoria.itensAusentes,
              descricao_itens_ausentes: vistoria.descricaoItensAusentes,
              possui_avarias: vistoria.possuiAvarias,
              descricao_avarias: vistoria.descricaoAvarias,
              observacoes: vistoria.observacoes,
              declaracao_entrega: JSON.stringify(vistoria.declaracaoEntrega),
              declaracao_recebimento: JSON.stringify(vistoria.declaracaoRecebimento),
              fotos: vistoria.fotos,
              foto_types: vistoria.fotoTypes,
              fotos_obrigatorias: JSON.stringify(vistoria.fotosObrigatorias),
              video_seguranca: vistoria.videoSeguranca,
              pdf_base64: vistoria.pdfBase64,
              synced_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'id' }
        );

        if (error) throw error;

        return { success: true };
      } catch (syncError) {
        console.warn('Erro ao sincronizar com Supabase, será retentado:', syncError);
        // Adicionar à fila para sincronização posterior
        await addToSyncQueue(userId, 'update', 'vistorias', vistoria.id, vistoria);
        return { success: true }; // Ainda considera sucesso (salvo localmente)
      }
    } else {
      // Offline: adicionar à fila
      await addToSyncQueue(userId, 'create', 'vistorias', vistoria.id, vistoria);
      return { success: true };
    }
  } catch (error) {
    console.error('Erro ao salvar vistoria:', error);
    return { success: false, error: 'Erro ao salvar vistoria' };
  }
}

/**
 * Buscar vistorias do usuário (locais + online)
 */
export async function getUserVistorias(userId: string): Promise<Vistoria[]> {
  try {
    const db = await getDB();

    // Se online, sincronizar com Supabase
    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('vistorias')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Atualizar local com dados do servidor
          for (const record of data) {
            const vistoria = parseSupabaseVistoria(record);
            await db.put('vistorias', vistoria);
          }

          return data.map(parseSupabaseVistoria);
        }
      } catch (error) {
        console.warn('Erro ao buscar vistorias online:', error);
        // Continuar com dados locais
      }
    }

    // Retornar dados locais
    const vistorias = await db.getAllFromIndex('vistorias', 'by-date');
    return vistorias.reverse(); // Mais recente primeiro
  } catch (error) {
    console.error('Erro ao buscar vistorias:', error);
    return [];
  }
}

/**
 * Deletar vistoria
 */
export async function deleteVistoria(
  vistoriaId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDB();

    // 1. Deletar localmente
    await db.delete('vistorias', vistoriaId);

    // 2. Se online, deletar no Supabase
    if (navigator.onLine) {
      try {
        const { error } = await supabase
          .from('vistorias')
          .delete()
          .eq('id', vistoriaId);

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.warn('Erro ao deletar do Supabase:', error);
        // Adicionar à fila
        await addToSyncQueue(userId, 'delete', 'vistorias', vistoriaId, null);
        return { success: true };
      }
    } else {
      // Offline: adicionar à fila
      await addToSyncQueue(userId, 'delete', 'vistorias', vistoriaId, null);
      return { success: true };
    }
  } catch (error) {
    console.error('Erro ao deletar vistoria:', error);
    return { success: false, error: 'Erro ao deletar vistoria' };
  }
}

/**
 * Converter dados do Supabase para Vistoria local
 */
function parseSupabaseVistoria(record: any): Vistoria {
  return {
    id: record.id,
    numero: record.numero,
    placa: record.placa,
    data: record.data,
    hora: record.hora || '',
    seguradora: record.seguradora || '',
    veiculo: record.veiculo || '',
    cor: record.cor || '',
    ano: record.ano || '',
    segurado: record.segurado || '',
    local: record.local || '',
    telefone: record.telefone || '',
    destino: record.destino || '',
    tipoVeiculo: record.tipo_veiculo || '',
    tipoServico: record.tipo_servico || '',
    condicaoPneus: record.condicao_pneus || '',
    temDocumento: record.tem_documento || false,
    nivelCombustivel: record.nivel_combustivel || '',
    quilometragem: record.quilometragem || '',
    motivoChamada: record.motivo_chamada || '',
    motivoOutro: record.motivo_outro || '',
    dadosCarro: record.dados_carro ? JSON.parse(record.dados_carro) : {},
    itensSeguranca: record.itens_seguranca ? JSON.parse(record.itens_seguranca) : {},
    itensAusentes: record.itens_ausentes,
    descricaoItensAusentes: record.descricao_itens_ausentes || '',
    possuiAvarias: record.possui_avarias,
    descricaoAvarias: record.descricao_avarias || '',
    observacoes: record.observacoes || '',
    declaracaoEntrega: record.declaracao_entrega ? JSON.parse(record.declaracao_entrega) : {},
    declaracaoRecebimento: record.declaracao_recebimento ? JSON.parse(record.declaracao_recebimento) : {},
    fotos: record.fotos || [],
    fotoTypes: record.foto_types || [],
    fotosObrigatorias: record.fotos_obrigatorias ? JSON.parse(record.fotos_obrigatorias) : {},
    videoSeguranca: record.video_seguranca || null,
    vistoriaSalva: true,
    status: record.status,
    pdfBase64: record.pdf_base64,
    criadoEm: record.created_at,
    atualizadoEm: record.updated_at,
  };
}

/**
 * Sincronizar todas as vistorias pendentes
 */
export async function syncAllPendingVistorias(userId: string): Promise<void> {
  const db = await getDB();
  const keys = await db.getAllKeys('config');

  for (const key of keys) {
    if (typeof key === 'string' && key.startsWith('sync_queue_')) {
      try {
        const config = await db.get('config', key);
        if (config?.value) {
          const queueItem = JSON.parse(config.value as string);

          if (queueItem.userId === userId && queueItem.tableName === 'vistorias') {
            // Implementar lógica de sincronização do queue item
            // Já feito em authService.ts
          }
        }
      } catch (error) {
        console.error('Erro ao processar fila:', error);
      }
    }
  }
}
