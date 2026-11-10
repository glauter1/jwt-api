# Biblioteca API (jwt-api)

API de um sistema de gestão de biblioteca: cadastro de categorias, autores, livros, leitores e atendentes, com controle de empréstimos e devoluções. Trabalho da disciplina de Back-end , ads, Unipar.

**Integrantes:** [gLAUTER JUNIOR ALBERICO RA:60006591]

## Tecnologias

- Node.js 20 e Express 5
- Sequelize com SQLite
- JWT (jsonwebtoken) e bcrypt
- CORS liberado para o front em `http://localhost:3001`

## Como instalar e rodar

```bash
git clone [link do seu fork do jwt-api]
cd jwt-api
npm install
cp .envex .env        # no Windows: copy .envex .env
npm start
```

A API sobe em `http://localhost:3000`. Na primeira execução o banco (`database.sqlite`) é criado sozinho, com todas as tabelas, e o administrador inicial é criado pelo seed.

## Variáveis de ambiente

Copie o `.envex` para `.env` e preencha:

| Variável | Para que serve | Exemplo |
|---|---|---|
| `JWT_SECRET` | Chave que assina o access token | um texto longo e aleatório |
| `ACCESS_EXPIRES` | Validade do access token | `15m` (use `30s` para demonstrar a renovação) |
| `PORT` | Porta da API | `3000` |
| `LOAN_DAYS` | Prazo do empréstimo, em dias | `7` |
| `ADMIN_EMAIL` | E-mail do administrador criado pelo seed | `admin@biblioteca.com` |
| `ADMIN_PASSWORD` | Senha do administrador criado pelo seed | escolha uma senha |

O arquivo `.env` não vai para o repositório. Só o `.envex`, sem valores secretos.

## Administrador inicial (seed)

Ao iniciar, se não existir nenhum administrador, a API cria um com `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Se esses valores não forem informados, usa `admin@biblioteca.com` e `123456`. Troque a senha fora de testes.

A rota `POST /v1/user` não é pública: só administrador cria atendentes.

## Estrutura

```
jwt-api/
├── auth/        login, refresh, logout, me, middlewares (authMiddleware e isAdmin)
├── user/        atendentes e administradores
├── category/
├── author/
├── book/
├── reader/
├── loan/        empréstimos e devoluções (loan.utils.js tem datas, status e multa)
├── report/      dashboard
├── models/      index.js com as associações
├── config/      db.js e seed.js
└── index.js
```

Cada recurso segue o mesmo caminho: router, controller, service e model.

## Autenticação

1. `POST /v1/auth/login` devolve `{ accessToken, refreshToken, user }`.
2. O access token (JWT, 15 minutos, com `id`, `name`, `email` e `isAdmin`) vai no cabeçalho `Authorization: Bearer <token>`.
3. Quando ele expira, a API responde **401**.
4. O front chama `POST /v1/auth/refresh` com o refresh token e recebe um **novo par** de tokens. O refresh token antigo é revogado (rotação).
5. Se um refresh token já revogado for usado de novo, **todos** os refresh tokens daquele usuário são revogados (detecção de roubo).
6. `POST /v1/auth/logout` revoga o refresh token informado.
7. `GET /v1/auth/me` devolve o usuário logado.

Respostas: **401** para token ausente, inválido ou expirado. **403** quando o usuário está logado mas não pode (atendente em rota de administrador, ou atendente desativado tentando entrar).

## Perfis

- **Administrador**: gerencia atendentes, categorias, autores e livros, e vê o dashboard.
- **Atendente**: consulta o acervo, cadastra leitores e registra empréstimos e devoluções.

## Endpoints

(A) = somente administrador. Todas as rotas, exceto login e refresh, exigem access token.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/v1/auth/login` | Login |
| POST | `/v1/auth/refresh` | Renova o par de tokens |
| POST | `/v1/auth/logout` | Revoga o refresh token |
| GET | `/v1/auth/me` | Usuário logado |
| GET / POST | `/v1/user` | Listar / criar atendente (A) |
| GET | `/v1/user/:id` e `/v1/user/email/:email` | Buscar usuário (A) |
| PUT | `/v1/user/:id` | Editar atendente (A) |
| PATCH | `/v1/user/:id/active` | Ativar ou desativar (A) |
| GET | `/v1/categories`, `/v1/categories/:id` | Consultar |
| POST / PUT / DELETE | `/v1/categories` | Escrita (A) |
| GET | `/v1/authors`, `/v1/authors/:id` | Consultar |
| POST / PUT / DELETE | `/v1/authors` | Escrita (A) |
| GET | `/v1/books?title=&categoryId=&authorId=&available=true` | Busca com filtros |
| GET | `/v1/books/:id` | Consultar |
| POST / PUT / DELETE | `/v1/books` | Escrita, com categoria e autores (A) |
| GET / POST / PUT | `/v1/readers` | Leitores |
| GET | `/v1/readers/:id/loans` | Histórico do leitor |
| POST | `/v1/loans` | Registrar empréstimo `{ bookId, readerId }` |
| PATCH | `/v1/loans/:id/return` | Registrar devolução |
| GET | `/v1/loans?status=ATIVO\|ATRASADO\|DEVOLVIDO` | Listar empréstimos |
| GET | `/v1/reports/dashboard` | Totais de livros, empréstimos, atrasos e multas (A) |

## Regras de negócio

- Só empresta livro com exemplar disponível. O empréstimo diminui o estoque e a devolução aumenta.
- Prazo de 7 dias (configurável por `LOAN_DAYS`).
- Cada leitor pode ter no máximo 3 empréstimos ativos e não pode pegar livro se tiver algum atrasado.
- Devolução depois do prazo gera multa de R$ 1,00 por dia de atraso.
- Empréstimo e devolução rodam dentro de uma transação (`db.transaction`), então estoque e empréstimo nunca ficam inconsistentes.
- Não é possível excluir categoria com livros, autor com livros, nem livro com empréstimo ativo. A API responde **409** com mensagem clara.
- Atendente desativado não consegue entrar nem renovar o token.
- O administrador não pode desativar a própria conta.

## Decisões tomadas

- **Refresh token como string aleatória** (`crypto.randomBytes`), guardada na tabela `RefreshTokens`. Por isso não existe `JWT_REFRESH_SECRET`.
- **Sem blacklist de access token.** A tabela `logout_list` deixou de ser usada: depois do logout o refresh token está revogado, e o access token expira sozinho em 15 minutos.
- **Status `ATRASADO` calculado**, não gravado: é `dueDate` menor que hoje e sem `returnDate`. Assim ele nunca fica desatualizado.
- **Datas sem horário** (`DATEONLY`), calculadas pela data local, para o empréstimo não sair com o dia errado por causa do fuso.
- **Senhas** com bcrypt. Nenhuma resposta da API devolve a senha.
- **Livro excluído:** os empréstimos já devolvidos permanecem no histórico, com o campo do livro vazio.

## Limitações conhecidas

- O access token não é invalidado antes de expirar. Se um atendente for desativado, ou se o papel dele mudar, o token já emitido continua valendo por até 15 minutos.
- O refresh token é devolvido no corpo da resposta (e não em cookie `httpOnly`).

## Coleção de requisições

O arquivo `biblioteca-api-v2.postman_collection.json`, na raiz do projeto, tem todas as rotas. Importe no Postman ou no Insomnia e rode primeiro **Auth, Login admin**: o token é guardado sozinho para as outras requisições. Os ids nos endereços são exemplos e precisam existir no seu banco.

## Como demonstrar a renovação do token

1. No `.env`, coloque `ACCESS_EXPIRES=30s` e reinicie a API.
2. Faça login no front e espere 30 segundos.
3. Clique em qualquer tela: o front recebe 401, chama `/auth/refresh` e repete a requisição sozinho.
4. Depois volte para `ACCESS_EXPIRES=15m`.