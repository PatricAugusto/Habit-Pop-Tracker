# Habit Pop Tracker API

API HTTP do Habit Pop Tracker, construida com Express, TypeScript e SQLite. O servidor recebe registros do mobile, persiste os dados e processa sincronizacoes idempotentes.

## Requisitos

- Node.js LTS
- npm

## Instalar e executar

```powershell
npm install
npm run dev
```

O servidor escuta em `0.0.0.0` e usa a porta `3000` por padrao.

Scripts:

- `npm run build`: compila `src` para `dist`.
- `npm run dev`: compila e inicia o servidor.
- `npm start`: inicia o conteudo ja compilado de `dist`.
- `npm test`: atualmente executa o build TypeScript.

## Configuracao

Variaveis suportadas:

- `PORT`: porta HTTP; padrao `3000`.
- `DATABASE_PATH`: caminho do arquivo SQLite; padrao `./data/habit-pop.sqlite`.

Exemplo de desenvolvimento:

```powershell
$env:PORT = "3000"
$env:DATABASE_PATH = ".\data\habit-pop.sqlite"
npm run dev
```

Nao versione arquivos `.env`, SQLite ou dados de usuario. O `.gitignore` ja cobre `dist`, `.env`, bancos e journals SQLite.

## Persistencia e migracao

A tabela `consumptions` possui:

- `id`: identificador interno.
- `client_id`: identificador unico gerado pelo dispositivo.
- `type`: `beer`, `cigarette`, `water` ou `coffee`.
- `quantity`: inteiro positivo.
- `occurred_at`: data ISO-8601 informada pelo dispositivo.
- `created_at`: data de persistencia no servidor.

Ao inicializar, o servidor cria a tabela se necessario. Bancos antigos que aceitavam apenas cerveja e cigarro sao migrados automaticamente para a nova restricao de tipos, preservando os registros existentes.

## Rotas

### `GET /health`

Resposta:

```json
{ "status": "ok" }
```

### `GET /api/v1/consumptions`

Lista registros em ordem decrescente de `occurredAt`. Filtros opcionais:

```text
/api/v1/consumptions?from=2026-09-09T00:00:00.000Z&to=2026-09-09T23:59:59.999Z
```

### `GET /api/v1/consumptions/:clientId`

Retorna `404` quando o identificador nao existe.

### `POST /api/v1/consumptions`

Cria um registro individual. O mesmo `clientId` pode ser reenviado sem duplicar o dado.

### `POST /api/v1/sync`

Recebe:

```json
{
  "consumptions": [
    {
      "clientId": "mobile-1720000000000-ab12",
      "type": "coffee",
      "quantity": 1,
      "occurredAt": "2026-09-09T12:00:00.000Z"
    }
  ]
}
```

O lote aceita no maximo 500 itens e e gravado dentro de uma transacao. Retries sao seguros por causa da restricao unica em `client_id`.

### `DELETE /api/v1/consumptions/:clientId`

Remove o registro se existir e sempre retorna `204`, tornando a operacao idempotente. O mobile pode repetir a chamada depois de uma falha de rede.

## Seguranca

Estado atual de desenvolvimento:

- CORS esta aberto com `cors()`.
- Nao ha autenticacao ou autorizacao.
- O servidor escuta em todas as interfaces.
- A API nao aplica rate limiting.
- O mobile aponta para HTTP por padrao.

Antes de disponibilizar publicamente:

1. Coloque a API atras de HTTPS/TLS.
2. Adicione autenticacao e associe cada registro a um usuario autorizado.
3. Restrinja CORS a origens conhecidas.
4. Adicione rate limiting e limite de tamanho do body.
5. Use validacao de schema centralizada e rejeite campos desconhecidos quando apropriado.
6. Nao retorne stack traces ou dados pessoais em erros.
7. Adicione logs estruturados, alertas e auditoria de exclusoes sem registrar payloads sensiveis.
8. Restrinja permissoes do arquivo SQLite e faça backups criptografados.
9. Use `npm audit`, atualizacoes regulares e revisao de dependencias.
10. Separe configuracoes e bancos de desenvolvimento, homologacao e producao.

A API valida tipo, quantidade, identificador e data no servidor, mas isso nao substitui autenticacao, autorizacao e transporte seguro.

## Validacao local

```powershell
npm run build
```

Para um teste manual, inicie o servidor e consulte:

```powershell
Invoke-RestMethod http://localhost:3000/health
```
