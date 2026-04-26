import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { cadastrarUsuario } from '../data/usuarios';
import { palette } from '../theme/palette';

export default function TelaCadastro() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const criarConta = async () => {
    const emailTratado = email.trim().toLowerCase();
    const usuarioTratado = usuario.trim().toLowerCase();
    const senhaTratada = senha.trim();
    const confirmacaoTratada = confirmarSenha.trim();

    if (!emailTratado || !usuarioTratado || !senhaTratada || !confirmacaoTratada) {
      setMensagemErro('Preencha todos os campos para continuar.');
      return;
    }

    if (!emailTratado.includes('@') || !emailTratado.includes('.')) {
      setMensagemErro('Digite um e-mail valido.');
      return;
    }

    if (senhaTratada.length < 4) {
      setMensagemErro('A senha precisa ter pelo menos 4 caracteres.');
      return;
    }

    if (senhaTratada !== confirmacaoTratada) {
      setMensagemErro('As senhas não conferem.');
      return;
    }

    setSalvando(true);

    try {
      const usuarioCriado = await cadastrarUsuario({
        email: emailTratado,
        usuario: usuarioTratado,
        senha: senhaTratada,
      });

      Alert.alert('Conta criada', 'Seu cadastro foi salvo com sucesso.', [
        {
          text: 'Entrar',
          onPress: () =>
            router.replace(`/home?nome=${encodeURIComponent(usuarioCriado.usuario)}`),
        },
      ]);
    } catch (error) {
      setMensagemErro(
        error instanceof Error ? error.message : 'Nao foi possivel criar a conta.'
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.tela}
    >
      <View style={styles.topo}>
        <Text style={styles.sobreTitulo}>Novo acesso</Text>
        <Text style={styles.textoTopo}>
          Crie sua conta para salvar seus dados e entrar no aplicativo sempre que quiser.
        </Text>
      </View>

      <View style={styles.cartao}>
        <Text style={styles.tituloCartao}>Criar conta</Text>
        <Text style={styles.textoCartao}>
          Preencha seus dados para cadastrar um novo acesso.
        </Text>

        <View style={styles.grupoCampo}>
          <Text style={styles.rotulo}>E-mail</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(valor) => {
              setEmail(valor);
              if (mensagemErro) {
                setMensagemErro('');
              }
            }}
            placeholder="Digite seu e-mail"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.grupoCampo}>
          <Text style={styles.rotulo}>Usuario</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={(valor) => {
              setUsuario(valor);
              if (mensagemErro) {
                setMensagemErro('');
              }
            }}
            placeholder="Escolha um nome de usuario"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
            value={usuario}
          />
        </View>

        <View style={styles.grupoCampo}>
          <Text style={styles.rotulo}>Senha</Text>
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

        <View style={styles.grupoCampo}>
          <Text style={styles.rotulo}>Confirmar senha</Text>
          <View style={styles.linhaSenha}>
            <TextInput
              autoCapitalize="none"
              onChangeText={(valor) => {
                setConfirmarSenha(valor);
                if (mensagemErro) {
                  setMensagemErro('');
                }
              }}
              placeholder="Repita sua senha"
              placeholderTextColor={palette.textMuted}
              secureTextEntry={!mostrarConfirmacao}
              style={styles.inputSenha}
              value={confirmarSenha}
            />
            <Pressable
              hitSlop={10}
              onPress={() => setMostrarConfirmacao((atual) => !atual)}
              style={styles.botaoMostrarSenha}
            >
              <Text style={styles.textoMostrarSenha}>
                {mostrarConfirmacao ? 'Ocultar' : 'Mostrar'}
              </Text>
            </Pressable>
          </View>
        </View>

        {mensagemErro ? <Text style={styles.textoErro}>{mensagemErro}</Text> : null}

        <Pressable onPress={() => void criarConta()} style={styles.botaoPrimario}>
          <Text style={styles.textoBotaoPrimario}>
            {salvando ? 'Salvando...' : 'Criar conta'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.botaoSecundario}>
          <Text style={styles.textoBotaoSecundario}>Voltar para o login</Text>
        </Pressable>
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
    flex: 0.34,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 18,
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
    maxWidth: 300,
  },
  cartao: {
    flex: 1.66,
    backgroundColor: palette.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 22,
  },
  tituloCartao: {
    color: palette.textStrong,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
  },
  textoCartao: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  grupoCampo: {
    marginBottom: 14,
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
    marginTop: 2,
  },
  textoBotaoPrimario: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  botaoSecundario: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 14,
    marginTop: 8,
  },
  textoBotaoSecundario: {
    color: palette.textStrong,
    fontSize: 14,
    fontWeight: '700',
  },
});
