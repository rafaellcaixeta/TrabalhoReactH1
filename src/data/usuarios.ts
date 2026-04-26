import * as SistemaArquivos from 'expo-file-system/legacy';

import bancoUsuarios from './banco-usuarios.json';

export type Usuario = {
  id: string;
  email: string;
  usuario: string;
  senha: string;
};

type EstruturaBancoUsuarios = {
  usuarios: Usuario[];
};

const bancoInicial = bancoUsuarios as EstruturaBancoUsuarios;
const URI_ARQUIVO_USUARIOS = `${SistemaArquivos.documentDirectory}banco-usuarios.json`;

export function obterUsuariosIniciais(): Usuario[] {
  return bancoInicial.usuarios.map((usuario) => ({ ...usuario }));
}

async function garantirArquivoUsuarios(): Promise<void> {
  const informacoesArquivo = await SistemaArquivos.getInfoAsync(URI_ARQUIVO_USUARIOS);

  if (informacoesArquivo.exists) {
    return;
  }

  const usuariosIniciais = obterUsuariosIniciais();
  await escreverArquivoUsuarios(usuariosIniciais);
}

async function escreverArquivoUsuarios(usuarios: Usuario[]): Promise<void> {
  await SistemaArquivos.writeAsStringAsync(
    URI_ARQUIVO_USUARIOS,
    JSON.stringify({ usuarios }, null, 2),
    { encoding: SistemaArquivos.EncodingType.UTF8 }
  );
}

export async function carregarUsuarios(): Promise<Usuario[]> {
  await garantirArquivoUsuarios();

  try {
    const conteudoArquivo = await SistemaArquivos.readAsStringAsync(URI_ARQUIVO_USUARIOS, {
      encoding: SistemaArquivos.EncodingType.UTF8,
    });
    const valorConvertido = JSON.parse(conteudoArquivo) as EstruturaBancoUsuarios;

    if (!Array.isArray(valorConvertido.usuarios)) {
      throw new Error('Arquivo de usuarios invalido');
    }

    return valorConvertido.usuarios.map((usuario) => ({ ...usuario }));
  } catch {
    const usuariosIniciais = obterUsuariosIniciais();
    await escreverArquivoUsuarios(usuariosIniciais);
    return usuariosIniciais;
  }
}

export async function salvarUsuarios(usuarios: Usuario[]): Promise<void> {
  await escreverArquivoUsuarios(usuarios);
}

export async function buscarUsuarioPorLogin(login: string): Promise<Usuario | null> {
  const usuarios = await carregarUsuarios();
  const loginTratado = login.trim().toLowerCase();

  return (
    usuarios.find(
      (usuario) =>
        usuario.usuario.trim().toLowerCase() === loginTratado ||
        usuario.email.trim().toLowerCase() === loginTratado
    ) ?? null
  );
}

export async function cadastrarUsuario(dados: Omit<Usuario, 'id'>): Promise<Usuario> {
  const usuarios = await carregarUsuarios();
  const emailTratado = dados.email.trim().toLowerCase();
  const usuarioTratado = dados.usuario.trim().toLowerCase();

  const emailJaExiste = usuarios.some(
    (usuario) => usuario.email.trim().toLowerCase() === emailTratado
  );

  if (emailJaExiste) {
    throw new Error('Ja existe uma conta com este e-mail.');
  }

  const usuarioJaExiste = usuarios.some(
    (usuario) => usuario.usuario.trim().toLowerCase() === usuarioTratado
  );

  if (usuarioJaExiste) {
    throw new Error('Este nome de usuario ja esta em uso.');
  }

  const novoUsuario: Usuario = {
    id: Date.now().toString(),
    email: emailTratado,
    usuario: usuarioTratado,
    senha: dados.senha,
  };

  const proximaLista = [...usuarios, novoUsuario];
  await salvarUsuarios(proximaLista);
  return novoUsuario;
}
