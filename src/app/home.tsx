import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { carregarTarefas, salvarTarefas, type Tarefa } from '../data/tarefas';
import { palette } from '../theme/palette';

type Filtro = 'todas' | 'pendentes' | 'concluidas';

export default function TelaInicial() {
  const router = useRouter();
  const params = useLocalSearchParams<{ nome?: string }>();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<Tarefa | null>(null);
  const [tituloInput, setTituloInput] = useState('');
  const [descricaoInput, setDescricaoInput] = useState('');
  const [erroFormulario, setErroFormulario] = useState('');
  const [dadosHidratados, setDadosHidratados] = useState(false);

  const nomeUsuario = params.nome?.split('@')[0] || 'admin';

  useEffect(() => {
    let componenteMontado = true;

    const hidratarTarefas = async () => {
      const tarefasSalvas = await carregarTarefas();

      if (!componenteMontado) {
        return;
      }

      setTarefas(tarefasSalvas);
      setDadosHidratados(true);
    };

    hidratarTarefas();

    return () => {
      componenteMontado = false;
    };
  }, []);

  useEffect(() => {
    if (!dadosHidratados) {
      return;
    }

    void salvarTarefas(tarefas);
  }, [dadosHidratados, tarefas]);

  const totalPendentes = useMemo(
    () => tarefas.filter((tarefa) => !tarefa.completed).length,
    [tarefas]
  );
  const totalConcluidas = useMemo(
    () => tarefas.filter((tarefa) => tarefa.completed).length,
    [tarefas]
  );

  const tarefasFiltradas = useMemo(() => {
    if (filtro === 'pendentes') {
      return tarefas.filter((tarefa) => !tarefa.completed);
    }

    if (filtro === 'concluidas') {
      return tarefas.filter((tarefa) => tarefa.completed);
    }

    return tarefas;
  }, [filtro, tarefas]);

  const limparFormulario = () => {
    setTarefaEmEdicao(null);
    setTituloInput('');
    setDescricaoInput('');
    setErroFormulario('');
  };

  const abrirModalCriacao = () => {
    limparFormulario();
    setModalVisivel(true);
  };

  const abrirModalEdicao = (tarefa: Tarefa) => {
    setTarefaEmEdicao(tarefa);
    setTituloInput(tarefa.title);
    setDescricaoInput(tarefa.description);
    setErroFormulario('');
    setModalVisivel(true);
  };

  const salvarTarefa = () => {
    const tituloTratado = tituloInput.trim();
    const descricaoTratada = descricaoInput.trim();

    if (!tituloTratado) {
      setErroFormulario('O titulo nao pode ficar vazio.');
      return;
    }

    if (tarefaEmEdicao) {
      setTarefas((tarefasAtuais) =>
        tarefasAtuais.map((tarefa) =>
          tarefa.id === tarefaEmEdicao.id
            ? { ...tarefa, title: tituloTratado, description: descricaoTratada }
            : tarefa
        )
      );
    } else {
      setTarefas((tarefasAtuais) => [
        {
          id: Date.now().toString(),
          title: tituloTratado,
          description: descricaoTratada,
          completed: false,
        },
        ...tarefasAtuais,
      ]);
    }

    setModalVisivel(false);
    limparFormulario();
  };

  const alternarTarefa = (id: string) => {
    setTarefas((tarefasAtuais) =>
      tarefasAtuais.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, completed: !tarefa.completed } : tarefa
      )
    );
  };

  const excluirTarefa = (id: string) => {
    setTarefas((tarefasAtuais) => tarefasAtuais.filter((tarefa) => tarefa.id !== id));
  };

  const renderizarTarefa = ({ item }: { item: Tarefa }) => {
    const estiloStatus = item.completed ? styles.statusCompleted : styles.statusPending;
    const estiloTextoStatus = item.completed
      ? styles.statusCompletedText
      : styles.statusPendingText;

    return (
      <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
        <Pressable
          onPress={() => alternarTarefa(item.id)}
          style={[styles.checkButton, item.completed && styles.checkButtonCompleted]}
        >
          <Text style={styles.checkButtonText}>
            {item.completed ? 'Feita' : 'Marcar'}
          </Text>
        </Pressable>

        <View style={styles.taskBody}>
          <View style={styles.taskTopRow}>
            <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
              {item.title}
            </Text>
            <View style={[styles.statusBadge, estiloStatus]}>
              <Text style={[styles.statusBadgeText, estiloTextoStatus]}>
                {item.completed ? 'Concluída' : 'Pendente'}
              </Text>
            </View>
          </View>

          {item.description ? (
            <Text
              style={[
                styles.taskDescription,
                item.completed && styles.taskDescriptionCompleted,
              ]}
            >
              {item.description}
            </Text>
          ) : null}

          <View style={styles.taskActions}>
            <Pressable
              onPress={() => abrirModalEdicao(item)}
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryActionText}>Editar</Text>
            </Pressable>
            <Pressable onPress={() => excluirTarefa(item.id)} style={styles.ghostAction}>
              <Text style={styles.ghostActionText}>Excluir</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Sua rotina</Text>
          <Text style={styles.headerTitle}>Oi, {nomeUsuario}</Text>
          <Text style={styles.headerText}>
            Um painel mais leve para manter o foco no que importa.
          </Text>
        </View>
        <Pressable onPress={() => router.replace('/login')} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.summaryCardPending]}>
          <Text style={styles.summaryLabel}>Pendentes</Text>
          <Text style={styles.summaryValue}>{totalPendentes}</Text>
          <Text style={styles.summaryHint}>Cor quente para o que pede atencao.</Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardCompleted]}>
          <Text style={styles.summaryLabel}>Concluidas</Text>
          <Text style={styles.summaryValue}>{totalConcluidas}</Text>
          <Text style={styles.summaryHint}>Verde suave para mostrar progresso real.</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['todas', 'pendentes', 'concluidas'] as Filtro[]).map((item) => {
          const ativo = filtro === item;

          return (
            <Pressable
              key={item}
              onPress={() => setFiltro(item)}
              style={[styles.filterButton, ativo && styles.filterButtonActive]}
            >
              <Text style={[styles.filterButtonText, ativo && styles.filterButtonTextActive]}>
                {item === 'todas'
                  ? 'Todas'
                  : item === 'pendentes'
                    ? 'Pendentes'
                    : 'Concluidas'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={tarefasFiltradas}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nada por aqui.</Text>
            <Text style={styles.emptyText}>
              Crie uma nova tarefa ou mude o filtro para ver outro grupo.
            </Text>
          </View>
        }
        renderItem={renderizarTarefa}
        showsVerticalScrollIndicator={false}
      />

      <Pressable onPress={abrirModalCriacao} style={styles.floatingButton}>
        <Text style={styles.floatingButtonText}>Nova tarefa</Text>
      </Pressable>

      <Modal
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
        transparent
        visible={modalVisivel}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {tarefaEmEdicao ? 'Editar tarefa' : 'Nova tarefa'}
            </Text>
            <Text style={styles.modalText}>
              Escreva algo objetivo. Fica mais facil manter o ritmo.
            </Text>

            <Text style={styles.modalLabel}>Titulo</Text>
            <TextInput
              onChangeText={(valor) => {
                setTituloInput(valor);
                if (erroFormulario) {
                  setErroFormulario('');
                }
              }}
              placeholder="Ex: revisar layout final"
              placeholderTextColor={palette.textMuted}
              style={styles.modalInput}
              value={tituloInput}
            />

            <Text style={styles.modalLabel}>Descricao</Text>
            <TextInput
              multiline
              numberOfLines={4}
              onChangeText={setDescricaoInput}
              placeholder="Adicione contexto se fizer sentido."
              placeholderTextColor={palette.textMuted}
              style={[styles.modalInput, styles.modalInputLarge]}
              textAlignVertical="top"
              value={descricaoInput}
            />

            {erroFormulario ? <Text style={styles.modalError}>{erroFormulario}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setModalVisivel(false);
                  limparFormulario();
                }}
                style={styles.modalSecondaryButton}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable onPress={salvarTarefa} style={styles.modalPrimaryButton}>
                <Text style={styles.modalPrimaryButtonText}>
                  {tarefaEmEdicao ? 'Salvar' : 'Criar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 20,
    paddingTop: 26,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
    gap: 16,
  },
  headerEyebrow: {
    color: palette.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: palette.textStrong,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  headerText: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 260,
  },
  logoutButton: {
    backgroundColor: palette.surfaceRaised,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.border,
  },
  logoutButtonText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  summaryCardPending: {
    backgroundColor: palette.pendingSurface,
    borderColor: palette.pendingBorder,
  },
  summaryCardCompleted: {
    backgroundColor: palette.completedSurface,
    borderColor: palette.completedBorder,
  },
  summaryLabel: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 18,
  },
  summaryValue: {
    color: palette.textStrong,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  summaryHint: {
    color: palette.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.surfaceRaised,
  },
  filterButtonActive: {
    backgroundColor: palette.accent,
  },
  filterButtonText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  filterButtonTextActive: {
    color: palette.white,
  },
  listContent: {
    paddingBottom: 120,
    gap: 12,
  },
  taskCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  taskCardCompleted: {
    borderColor: palette.completedBorder,
    backgroundColor: palette.completedSurfaceSoft,
  },
  checkButton: {
    minWidth: 62,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: palette.pendingStrong,
    alignItems: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: palette.completedStrong,
  },
  checkButtonText: {
    color: palette.textStrong,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  taskBody: {
    flex: 1,
  },
  taskTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    color: palette.textStrong,
    fontSize: 16,
    fontWeight: '700',
  },
  taskTitleCompleted: {
    color: palette.textMuted,
    textDecorationLine: 'line-through',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPending: {
    backgroundColor: palette.pendingStrong,
  },
  statusCompleted: {
    backgroundColor: palette.completedStrong,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusPendingText: {
    color: palette.pendingText,
  },
  statusCompletedText: {
    color: palette.completedText,
  },
  taskDescription: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  taskDescriptionCompleted: {
    color: palette.textSubtle,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryAction: {
    backgroundColor: palette.surfaceRaised,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: palette.textStrong,
    fontSize: 13,
    fontWeight: '700',
  },
  ghostAction: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.border,
  },
  ghostActionText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 26,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    color: palette.textStrong,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 240,
  },
  floatingButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 22,
    backgroundColor: palette.accent,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 18,
    shadowColor: palette.accentDeep,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  floatingButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(56, 41, 41, 0.28)',
  },
  modalCard: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalTitle: {
    color: palette.textStrong,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalText: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalLabel: {
    color: palette.textStrong,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: palette.surfaceRaised,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.textStrong,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  modalInputLarge: {
    minHeight: 96,
  },
  modalError: {
    color: palette.danger,
    fontSize: 13,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalSecondaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: palette.surfaceRaised,
    alignItems: 'center',
    paddingVertical: 15,
  },
  modalSecondaryButtonText: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  modalPrimaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: palette.accent,
    alignItems: 'center',
    paddingVertical: 15,
  },
  modalPrimaryButtonText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
