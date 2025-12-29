# XP Combinado

Aplicativo educativo para engajar crianças na realização de atividades domésticas, higiene pessoal e cuidados com pets através de gamificação, convertendo pontos em tempo de tela.

## Sobre o Projeto

O XP Combinado permite que pais registrem as atividades diárias realizadas pelos filhos. Cada atividade tem uma pontuação que é convertida em tempo de tela (celular, TV, computador, etc).

### Funcionalidades

- Cadastro e autenticação de usuários (pais)
- Gerenciamento de múltiplos filhos
- 39 atividades pré-definidas em 6 categorias:
  - Higiene Pessoal
  - Organização
  - Tarefas Domésticas
  - Cuidados com Pet
  - Desenvolvimento Pessoal
  - Comportamento
- Marcação de atividades completadas
- Cálculo automático de pontos e tempo de tela
- Reset diário de atividades

### Tabela de Conversão

| Pontos | Tempo de Tela |
|--------|---------------|
| 10 pts | 15 min |
| 20 pts | 30 min |
| 30 pts | 45 min |
| 40 pts | 1 hora |
| 60 pts | 1h30 |
| 80 pts | 2 horas |

## Tech Stack

- **Frontend:** React Native + Expo (SDK 54)
- **Backend:** Supabase (PostgreSQL + Auth)
- **Estado:** Zustand
- **Navegação:** React Navigation
- **Linguagem:** TypeScript

## Get Started

### Pre-requisitos

- Node.js 18+
- npm ou yarn
- Expo Go (no celular) ou emulador iOS/Android
- Conta no [Supabase](https://supabase.com) (gratuito)
- (Opcional - Premium) Conta no [Railway](https://railway.app) para backend MS Family Safety

---

### 1. Supabase Setup

#### 1.1 Criar Projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Escolha um nome e senha para o banco de dados
4. Selecione a regiao mais proxima (South America - Sao Paulo)
5. Aguarde a criacao do projeto

#### 1.2 Executar Schema SQL

1. No dashboard do Supabase, va em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteudo do arquivo `supabase/schema.sql`
4. Cole no editor e clique em **Run**

> O schema cria todas as tabelas necessarias:
> - `children` - Filhos cadastrados
> - `daily_records` - Registros diarios de atividades
> - `user_activities` - Atividades customizaveis
> - `user_screen_time_conversions` - Tabela de conversao customizavel
> - `user_subscriptions` - Assinaturas Premium
> - `ms_family_connections` - Conexoes MS Family Safety
> - `ms_account_mappings` - Mapeamento filhos <-> contas MS
> - `screen_time_sessions` - Sessoes de tempo liberado

#### 1.3 Obter Credenciais

1. Va em **Project Settings** > **API**
2. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (em "Project API keys")

#### 1.4 Configurar Autenticacao (OTP por Email)

1. Va em **Authentication** > **Providers**
2. Confirme que **Email** esta habilitado
3. (Opcional) Configure SMTP customizado em **Authentication** > **Settings** > **SMTP Settings**

---

### 2. Mobile App Setup

#### 2.1 Clonar e Instalar

```bash
git clone https://github.com/zagari/xpcombinado.git
cd xpcombinado
npm install
```

#### 2.2 Configurar Variaveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Supabase Configuration (obrigatorio)
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Family Safety Backend (opcional - apenas para Premium)
EXPO_PUBLIC_FAMILY_SAFETY_API_URL=https://seu-backend.railway.app
```

#### 2.3 Executar o App

```bash
npm start
```

Opcoes:
- Pressione `i` para abrir no simulador iOS
- Pressione `a` para abrir no emulador Android
- Escaneie o QR Code com o app Expo Go no celular

---

### 3. Backend MS Family Safety (Premium - Opcional)

Esta secao so e necessaria se voce quiser usar a integracao com Microsoft Family Safety para controlar dispositivos Windows/Android.

#### 3.1 Registrar App no Azure

1. Acesse [Azure Portal](https://portal.azure.com)
2. Va em **Azure Active Directory** > **App registrations** > **New registration**
3. Configure:
   - **Name:** XPCombinado
   - **Supported account types:** Personal Microsoft accounts only
   - **Redirect URI:** Web - `https://seu-app.railway.app/auth/callback`
4. Apos criar, copie:
   - **Application (client) ID**
5. Va em **Certificates & secrets** > **New client secret**
   - Copie o **Value** do secret criado

#### 3.2 Deploy no Railway

1. Acesse [railway.app](https://railway.app) e crie uma conta
2. Clique em **New Project** > **Deploy from GitHub repo**
3. Conecte seu repositorio e selecione a pasta `/backend`
4. O Railway detectara automaticamente o Python

#### 3.3 Configurar Variaveis de Ambiente no Railway

No dashboard do Railway, va em **Variables** e adicione:

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| `SUPABASE_URL` | URL do seu projeto Supabase | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service Role Key (em Project Settings > API) | `eyJhbGc...` |
| `SUPABASE_JWT_SECRET` | JWT Secret (em Project Settings > API > JWT Settings) | `sua-jwt-secret` |
| `MS_CLIENT_ID` | Client ID do Azure App | `xxxxxxxx-xxxx-xxxx-xxxx` |
| `MS_CLIENT_SECRET` | Client Secret do Azure App | `xxxxxx~xxxxx` |
| `MS_REDIRECT_URI` | URL de callback do Railway | `https://seu-app.railway.app/auth/callback` |

> **IMPORTANTE:** Use a **Service Role Key** (nao a anon key) no backend para permitir operacoes administrativas.

#### 3.4 Obter URL do Railway

1. Apos o deploy, o Railway gera uma URL automatica
2. Va em **Settings** > **Domains** para ver ou customizar
3. A URL sera algo como: `https://xpcombinado-backend-production.up.railway.app`
4. Atualize:
   - `MS_REDIRECT_URI` no Railway para: `https://sua-url.railway.app/auth/callback`
   - `EXPO_PUBLIC_FAMILY_SAFETY_API_URL` no `.env` do app

#### 3.5 Verificar Deploy

Acesse `https://sua-url.railway.app/health` - deve retornar:

```json
{"status": "healthy"}
```

---

### 4. Ativar Premium para Usuario

Para testar a funcionalidade Premium, execute este SQL no Supabase SQL Editor:

```sql
-- Substituir pelo ID do usuario (encontre em Authentication > Users)
INSERT INTO user_subscriptions (user_id, is_premium, premium_source)
VALUES ('seu-user-id-aqui', true, 'manual')
ON CONFLICT (user_id) DO UPDATE SET is_premium = true;
```

---

### Resumo das Variaveis de Ambiente

#### App Mobile (`.env`)

| Variavel | Obrigatorio | Descricao |
|----------|-------------|-----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave publica do Supabase |
| `EXPO_PUBLIC_FAMILY_SAFETY_API_URL` | Nao | URL do backend Railway (Premium) |

#### Backend Railway (Premium)

| Variavel | Obrigatorio | Descricao |
|----------|-------------|-----------|
| `SUPABASE_URL` | Sim | URL do projeto Supabase |
| `SUPABASE_SERVICE_KEY` | Sim | Service Role Key do Supabase |
| `SUPABASE_JWT_SECRET` | Sim | JWT Secret do Supabase |
| `MS_CLIENT_ID` | Sim | Client ID do Azure App |
| `MS_CLIENT_SECRET` | Sim | Client Secret do Azure App |
| `MS_REDIRECT_URI` | Sim | URL de callback OAuth |

---

### Troubleshooting

**Erro de autenticacao no Supabase:**
- Verifique se as variaveis de ambiente estao corretas
- Confirme que o Email provider esta habilitado em Authentication > Providers

**Backend retorna 401:**
- Verifique se o `SUPABASE_JWT_SECRET` esta correto
- Confirme que o token esta sendo enviado no header Authorization

**MS Family Safety nao conecta:**
- Verifique se o redirect URI no Azure corresponde exatamente ao do Railway
- Confirme que as permissoes do app Azure incluem Microsoft Graph

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── constants/      # Atividades e conversões
├── navigation/     # Configuração de rotas
├── screens/        # Telas do app
├── services/       # Cliente Supabase
├── stores/         # Estado global (Zustand)
└── types/          # Tipos TypeScript
```

## Licença

MIT
