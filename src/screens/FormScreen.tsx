import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVistoriaStore } from "@/store/useVistoriaStore";
import { saveVistoria, saveRascunhoVistoria } from "@/database/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatPlateDisplay } from "@/lib/plate";

import { InfoGeraisTab } from "./tabs/InfoGeraisTab";
import { ServicosTab } from "./tabs/ServicosTab";
import { MotivoTab } from "./tabs/MotivoTab";
import { DadosCarroTab } from "./tabs/DadosCarroTab";
import { ObservacoesTab } from "./tabs/ObservacoesTab";
import { DeclaracoesTab } from "./tabs/DeclaracoesTab";
import { FotosTab } from "./tabs/FotosTab";

const tabs = [
	{ id: 0, label: "Info", shortLabel: "Info" },
	{ id: 1, label: "Serviços", shortLabel: "Serv." },
	{ id: 2, label: "Motivo", shortLabel: "Mot." },
	{ id: 3, label: "Dados", shortLabel: "Dados" },
	{ id: 4, label: "Obs", shortLabel: "Obs" },
	{ id: 5, label: "Coletor", shortLabel: "Col." },
	{ id: 6, label: "Fotos 1", shortLabel: "F1" },
	{ id: 7, label: "Destinatário", shortLabel: "Dest." },
	{ id: 8, label: "Fotos 2", shortLabel: "F2" },
];

export function FormScreen() {
	const navigate = useNavigate();
	const { currentVistoria, activeTab, setActiveTab, reset, markVistoriaAsSaved } = useVistoriaStore();
	const [saving, setSaving] = useState(false);

	// Auto-save rascunho a cada 30 segundos se houver dados
	useEffect(() => {
		if (!currentVistoria || currentVistoria.vistoriaSalva) return;

		const autoSaveInterval = setInterval(async () => {
			try {
				await saveRascunhoVistoria(currentVistoria);
			} catch (error) {
				console.error("Erro ao auto-salvar rascunho:", error);
			}
		}, 30000); // 30 segundos

		return () => clearInterval(autoSaveInterval);
	}, [currentVistoria]);

	// Redirecionar se não há vistoria atual
	useEffect(() => {
		if (!currentVistoria) {
			navigate("/");
		}
	}, [currentVistoria, navigate]);

	if (!currentVistoria) {
		return null;
	}

	const handleSave = async () => {
		// Validar informações gerais (primeira aba)
		if (!currentVistoria.veiculo?.trim()) {
			toast({
				title: "Dados incompletos",
				description: "Preencha o Veículo na aba Info.",
				variant: "destructive",
			});
			setActiveTab(0);
			return;
		}

		if (!currentVistoria.placa?.trim()) {
			toast({
				title: "Dados incompletos",
				description: "Preencha a Placa na aba Info.",
				variant: "destructive",
			});
			setActiveTab(0);
			return;
		}

		if (!currentVistoria.seguradora?.trim()) {
			toast({
				title: "Dados incompletos",
				description: "Preencha a Seguradora na aba Info.",
				variant: "destructive",
			});
			setActiveTab(0);
			return;
		}

		if (!currentVistoria.segurado?.trim()) {
			toast({
				title: "Dados incompletos",
				description: "Preencha o Segurado na aba Info.",
				variant: "destructive",
			});
			setActiveTab(0);
			return;
		}

		if (!currentVistoria.telefone?.trim()) {
			toast({
				title: "Dados incompletos",
				description: "Preencha o Telefone na aba Info.",
				variant: "destructive",
			});
			setActiveTab(0);
			return;
		}

		// Validar serviços (segunda aba)
		if (!currentVistoria.tipoServico?.trim()) {
			toast({
				title: "Dados incompletos",
				description: "Preencha o Tipo de Serviço na aba Serviços.",
				variant: "destructive",
			});
			setActiveTab(1);
			return;
		}

		// Validar assinatura do recebidor (aba Recebidor - aba 5)
		if (!currentVistoria.declaracaoEntrega?.assinaturaBase64?.trim()) {
			toast({
				title: "Assinatura obrigatória",
				description: "Assine na aba Coletor.",
				variant: "destructive",
			});
			setActiveTab(5);
			return;
		}

		if (!currentVistoria.declaracaoEntrega?.nome?.trim()) {
			toast({
				title: "Nome obrigatório",
				description: "Preencha o Nome do Coletor na aba Coletor.",
				variant: "destructive",
			});
			setActiveTab(5);
			return;
		}

		if (!currentVistoria.declaracaoEntrega?.cpf?.trim()) {
			toast({
				title: "CPF obrigatório",
				description: "Preencha o CPF do Coletor na aba Coletor.",
				variant: "destructive",
			});
			setActiveTab(5);
			return;
		}

		// Validar fotos 1 (Local e Guincho) - aba 6
		if (!currentVistoria.fotosObrigatorias.veiculoNoLocal || !currentVistoria.fotosObrigatorias.veiculoNoGabarito) {
			toast({
				title: "Fotos obrigatórias faltando",
				description: "É necessário adicionar fotos do Local e Guincho antes de continuar.",
				variant: "destructive",
			});
			setActiveTab(6);
			return;
		}

		// Validar assinatura do destinatário (aba Destinatário - aba 7)
		if (!currentVistoria.declaracaoRecebimento?.assinaturaBase64?.trim()) {
			toast({
				title: "Assinatura obrigatória",
				description: "Assine na aba Destinatário.",
				variant: "destructive",
			});
			setActiveTab(7);
			return;
		}

		if (!currentVistoria.declaracaoRecebimento?.nome?.trim()) {
			toast({
				title: "Nome obrigatório",
				description: "Preencha o Nome do Destinatário na aba Destinatário.",
				variant: "destructive",
			});
			setActiveTab(7);
			return;
		}

		if (!currentVistoria.declaracaoRecebimento?.cpf?.trim()) {
			toast({
				title: "CPF obrigatório",
				description: "Preencha o CPF do Destinatário na aba Destinatário.",
				variant: "destructive",
			});
			setActiveTab(7);
			return;
		}

		// Validar fotos 2 (Entregue) - aba 8
		if (!currentVistoria.fotosObrigatorias.veiculoEntregue) {
			toast({
				title: "Foto de Entrega obrigatória",
				description: "É necessário adicionar a foto do Veículo Entregue antes de salvar.",
				variant: "destructive",
			});
			setActiveTab(8);
			return;
		}

		// Pedir confirmação antes de salvar
		if (!window.confirm("Deseja salvar esta vistoria? Após salvar, não poderá editar os dados.")) {
			return;
		}

		setSaving(true);
		try {
			// Marcar como salva ANTES de salvar no banco
			const vistoriaParaSalvar = {
				...currentVistoria,
				vistoriaSalva: true,
			};
			await saveVistoria(vistoriaParaSalvar);
			markVistoriaAsSaved();
			toast({ title: "Vistoria salva!", description: `Ficha #${currentVistoria.numero} salva com sucesso.` });
			setTimeout(() => {
				reset();
				navigate("/");
			}, 2000);
		} catch (error) {
			toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
		} finally {
			setSaving(false);
		}
	};

	const fotosLocaleGabarito = 
		currentVistoria.fotosObrigatorias.veiculoNoLocal &&
		currentVistoria.fotosObrigatorias.veiculoNoGabarito;

	const handleBack = () => {
		if (window.confirm("Deseja voltar?")) {
			reset();
			navigate("/");
		}
	};

	const handleNext = () => {
		// Se estiver na aba Fotos 1 (6) e não tem as fotos de local e guincho
		if (activeTab === 6 && !fotosLocaleGabarito) {
			toast({
				title: "Fotos obrigatórias faltando",
				description: "É necessário adicionar fotos do Local e Guincho antes de continuar.",
				variant: "destructive",
			});
			return;
		}

		// Se estiver na última aba (Fotos 2 - 8), salva
		if (activeTab === tabs.length - 1) {
			handleSave();
		} else {
			setActiveTab(Math.min(tabs.length - 1, activeTab + 1));
		}
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case 0:
				return <InfoGeraisTab />;
			case 1:
				return <ServicosTab />;
			case 2:
				return <MotivoTab />;
			case 3:
				return <DadosCarroTab />;
			case 4:
				return <ObservacoesTab />;
			case 5:
				// Aba do Coletor
				return <DeclaracoesTab tipoDeclaracao="entrega" />;
			case 6:
				// Fotos 1: Local e Guincho
				return <FotosTab fotoStage="local-guincho" />;
			case 7:
				// Aba do Destinatário
				return <DeclaracoesTab tipoDeclaracao="recebimento" />;
			case 8:
				// Fotos 2: Entregue
				return <FotosTab fotoStage="entregue" />;
			default:
				return <InfoGeraisTab />;
		}
	};

	return (
		<div className="min-h-screen bg-background flex flex-col safe-area-top safe-area-bottom">
			{/* Header */}
			<header className="bg-primary text-primary-foreground p-4 shadow-lg">
				<div className="flex items-center justify-between">
					<button onClick={handleBack} className="p-2 -ml-2 touch-manipulation">
						<ArrowLeft className="w-6 h-6" />
					</button>
					<div className="text-center">
						<h1 className="font-bold">Vistoria #{currentVistoria.numero}</h1>
						<p className="text-xs opacity-80">{formatPlateDisplay(currentVistoria.placa) || "Sem placa"}</p>
					</div>
					{!currentVistoria.vistoriaSalva && (
						<Button onClick={handleSave} disabled={saving} size="sm" variant="secondary">
							<Save className="w-4 h-4 mr-1" />
							Salvar
						</Button>
					)}
					{currentVistoria.vistoriaSalva && (
						<div className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium border border-blue-200 flex items-center gap-1">
							<Eye className="w-3.5 h-3.5" />
							Visualizando
						</div>
					)}
				</div>
			</header>

			{/* Tabs */}
			<div className="bg-card border-b border-border p-2 overflow-x-auto">
				<div className="flex gap-1 min-w-max">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={cn("tab-button whitespace-nowrap", activeTab === tab.id ? "tab-button-active" : "tab-button-inactive")}
						>
							{tab.shortLabel}
						</button>
					))}
				</div>
			</div>

			{/* Content */}
			<main className="flex-1 overflow-y-auto p-4">{renderTabContent()}</main>

			{/* Navigation */}
			<footer className="bg-card border-t border-border p-4">
				<div className="flex gap-3">
					<Button onClick={() => setActiveTab(Math.max(0, activeTab - 1))} disabled={activeTab === 0} variant="outline" className="flex-1 h-12">
						<ChevronLeft className="w-5 h-5 mr-1" /> Anterior
					</Button>
					<Button 
						onClick={handleNext} 
						disabled={activeTab === 6 && !fotosLocaleGabarito || currentVistoria.vistoriaSalva}
						className="flex-1 h-12"
					>
						{activeTab === tabs.length - 1 ? (
							<>
								<Save className="w-5 h-5 mr-1" /> Salvar Vistoria
							</>
						) : (
							<>
								Próximo <ChevronRight className="w-5 h-5 ml-1" />
							</>
						)}
					</Button>
				</div>
			</footer>
		</div>
	);
}
