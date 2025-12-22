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

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo Go (no celular) ou emulador
- Conta no [Supabase](https://supabase.com)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/zagari/xpcombinado.git
cd xpcombinado
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Supabase:
   - Crie um projeto no [Supabase](https://supabase.com)
   - Execute o SQL em `supabase/schema.sql` no SQL Editor
   - Copie as credenciais do projeto

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais do Supabase.

5. Inicie o app:
```bash
npm start
```

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
