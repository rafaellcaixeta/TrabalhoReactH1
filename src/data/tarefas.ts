import * as SistemaArquivos from 'expo-file-system/legacy';

import banco from './banco.json';

export type Tarefa = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

type EstruturaBanco = {
  tarefas: Tarefa[];
};

const bancoInicial = banco as EstruturaBanco;
const URI_ARQUIVO_TAREFAS = `${SistemaArquivos.documentDirectory}banco-tarefas.json`;

export function obterTarefasIniciais(): Tarefa[] {
  return bancoInicial.tarefas.map((tarefa) => ({ ...tarefa }));
}

async function garantirArquivoTarefas(): Promise<void> {
  const informacoesArquivo = await SistemaArquivos.getInfoAsync(URI_ARQUIVO_TAREFAS);

  if (informacoesArquivo.exists) {
    return;
  }

  const tarefasIniciais = obterTarefasIniciais();
  await escreverArquivoTarefas(tarefasIniciais);
}

async function escreverArquivoTarefas(tarefas: Tarefa[]): Promise<void> {
  await SistemaArquivos.writeAsStringAsync(
    URI_ARQUIVO_TAREFAS,
    JSON.stringify({ tarefas }, null, 2),
    { encoding: SistemaArquivos.EncodingType.UTF8 }
  );
}

export async function carregarTarefas(): Promise<Tarefa[]> {
  await garantirArquivoTarefas();

  try {
    const conteudoArquivo = await SistemaArquivos.readAsStringAsync(URI_ARQUIVO_TAREFAS, {
      encoding: SistemaArquivos.EncodingType.UTF8,
    });
    const valorConvertido = JSON.parse(conteudoArquivo) as EstruturaBanco;

    if (!Array.isArray(valorConvertido.tarefas)) {
      throw new Error('Arquivo de tarefas invalido');
    }

    return valorConvertido.tarefas.map((tarefa) => ({ ...tarefa }));
  } catch {
    const tarefasIniciais = obterTarefasIniciais();
    await escreverArquivoTarefas(tarefasIniciais);
    return tarefasIniciais;
  }
}

export async function salvarTarefas(tarefas: Tarefa[]): Promise<void> {
  await escreverArquivoTarefas(tarefas);
}
