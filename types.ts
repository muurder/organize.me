
export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface AgendamentoPendente {
  servico: string | null;
  data: string | null;
  horario: string | null;
}

export interface DadosContexto {
  telefone: string;
  nome: string | null;
  agendamento_pendente: AgendamentoPendente;
}

export interface InputPayload {
  mensagem_usuario: string;
  estado_atual: string | null;
  dados_contexto: DadosContexto;
}

export type Acao = "LISTAR_AGENDAMENTOS" | "CRIAR_AGENDAMENTO" | "CANCELAR_AGENDAMENTO" | "NENHUMA";

export interface OutputPayload {
  resposta_usuario: string;
  proximo_estado: string;
  atualizar_contexto: {
    nome: string | null;
    agendamento_pendente: AgendamentoPendente;
  };
  acoes: Acao[];
}
