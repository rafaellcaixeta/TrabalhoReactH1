import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { buscarUsuarioPorLogin } from '../data/usuarios';
import { palette } from '../theme/palette';

export default function TelaLogin() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarAcesso, setLembrarAcesso] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const entrarNoApp = async () => {
    const loginDigitado = login.trim().toLowerCase();
    const senhaDigitada = senha.trim();

    if (!loginDigitado || !senhaDigitada) {
      setMensagemErro('Preencha usuario ou e-mail e senha para continuar.');
      return;
    }

    setCarregando(true);

    try {
      const usuarioEncontrado = await buscarUsuarioPorLogin(loginDigitado);

      if (usuarioEncontrado && usuarioEncontrado.senha === senhaDigitada) {
        setMensagemErro('');
        router.replace(`/home?nome=${encodeURIComponent(usuarioEncontrado.usuario)}`);
        return;
      }

      setMensagemErro('Credenciais invalidas.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.tela}
    >
      <View style={styles.topo}>
        <View style={styles.circuloGrande} />
        <View style={styles.circuloPequeno} />

        <View style={styles.conteudoTopo}>
          <Text style={styles.sobreTitulo}>Organize</Text>
          <Text style={styles.textoTopo}>
            Organize seu dia com uma interface mais leve, clara e facil de usar.
          </Text>
        </View>
      </View>

      <View style={styles.cartao}>
        <Text style={styles.tituloCartao}>Entrar</Text>
        <Text style={styles.textoCartao}>
          Entre para acompanhar tarefas pendentes e concluidas.
        </Text>

        <View style={styles.grupoCampo}>
          <Text style={styles.rotulo}>Usuario ou e-mail</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={(valor) => {
              setLogin(valor);
              if (mensagemErro) {
                setMensagemErro('');
              }
            }}
            placeholder="Digite seu usuario ou e-mail"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
            value={login}
          />
        </View>

        <View style={styles.grupoCampo}>
          <View style={styles.cabecalhoSenha}>
            <Text style={styles.rotulo}>Senha</Text>
            <Pressable>
              <Text style={styles.link}>Esqueci minha senha</Text>
            </Pressable>
          </View>
          <View style={styles.linhaSenha}>
            <TextInput
              autoCapitalize="none"
              onChangeText={(valor) => {
                setSenha(valor);
                if (mensagemErro) {
                  setMensagemErro('');
                }
              }}
              placeholder="Digite sua senha"
              placeholderTextColor={palette.textMuted}
              secureTextEntry={!mostrarSenha}
              style={styles.inputSenha}
              value={senha}
            />
            <Pressable
              hitSlop={10}
              onPress={() => setMostrarSenha((atual) => !atual)}
              style={styles.botaoMostrarSenha}
            >
              <Text style={styles.textoMostrarSenha}>
                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.linhaMeta}>
          <View style={styles.linhaLembrar}>
            <Switch
              onValueChange={setLembrarAcesso}
              thumbColor={lembrarAcesso ? palette.surface : palette.surfaceRaised}
              trackColor={{
                false: palette.borderStrong,
                true: palette.accentSoft,
              }}
              value={lembrarAcesso}
            />
            <Text style={styles.textoLembrar}>Lembrar acesso</Text>
          </View>
          <Text style={styles.textoTeste}>Teste: admin / 123</Text>
        </View>

        {mensagemErro ? <Text style={styles.textoErro}>{mensagemErro}</Text> : null}

        <Pressable onPress={() => void entrarNoApp()} style={styles.botaoPrimario}>
          <Text style={styles.textoBotaoPrimario}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </Text>
        </Pressable>

        <View style={styles.rodapeCadastro}>
          <Text style={styles.textoRodape}>Primeiro acesso?</Text>
          <Pressable
            hitSlop={10}
            onPress={() => router.push('/cadastro')}
            style={styles.botaoRodape}
          >
            <Text style={styles.linkRodape}>Criar conta</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: palette.accent,
  },
  topo: {
    flex: 0.72,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  circuloGrande: {
    position: 'absolute',
    top: 24,
    left: -10,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: palette.accentLine,
  },
  circuloPequeno: {
    position: 'absolute',
    right: -34,
    top: 78,
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: palette.accentLine,
  },
  conteudoTopo: {
    paddingHorizontal: 28,
    paddingBottom: 34,
  },
  sobreTitulo: {
    color: palette.whiteSoft,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  textoTopo: {
    color: palette.whiteSoft,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 280,
  },
  cartao: {
    flex: 1.28,
    backgroundColor: palette.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 30,
  },
  tituloCartao: {
    color: palette.textStrong,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 6,
  },
  textoCartao: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  grupoCampo: {
    marginBottom: 18,
  },
  rotulo: {
    color: palette.textStrong,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.9,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: palette.surfaceRaised,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.textStrong,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  cabecalhoSenha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  link: {
    color: palette.accentDeep,
    fontSize: 12,
    fontWeight: '600',
  },
  linhaSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceRaised,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  inputSenha: {
    flex: 1,
    color: palette.textStrong,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  botaoMostrarSenha: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textoMostrarSenha: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  linhaMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  linhaLembrar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  textoLembrar: {
    color: palette.textMuted,
    fontSize: 13,
  },
  textoTeste: {
    color: palette.textSubtle,
    fontSize: 12,
    fontWeight: '600',
  },
  textoErro: {
    color: palette.danger,
    fontSize: 13,
    marginBottom: 14,
  },
  botaoPrimario: {
    backgroundColor: palette.accent,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
    shadowColor: palette.accentDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  textoBotaoPrimario: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  textoRodape: {
    color: palette.textMuted,
    fontSize: 13,
  },
  rodapeCadastro: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 18,
  },
  botaoRodape: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 1,
  },
  linkRodape: {
    color: palette.accentDeep,
    fontSize: 13,
    fontWeight: '700',
  },
});
