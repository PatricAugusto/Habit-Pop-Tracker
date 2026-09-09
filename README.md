# Habit Pop Tracker

Aplicacao mobile offline-first para registrar consumos de cerveja, cigarro, agua e cafe. Os registros sao salvos localmente primeiro e sincronizados com uma API quando houver conexao.

## Estrutura

```text
Habit-Pop-Tracker/
  mobile/   Aplicacao Expo/React Native
  server/   API Express + TypeScript + SQLite
```

## Requisitos

- Node.js LTS
- npm
- Expo CLI via `npx expo`
- Expo Go ou um emulador/dispositivo Android ou iOS
- Para testar em dispositivo fisico, mobile e server precisam estar acessiveis na mesma rede local

## Instalacao

Instale as dependencias de cada projeto:

```powershell
cd server
npm install

cd ..\mobile
npm install
```

## Executar localmente

Terminal 1, API:

```powershell
cd server
npm run dev
```

A API fica, por padrao, em `http://localhost:3000`.

Terminal 2, mobile:

```powershell
cd mobile
npx expo start
```

Para um dispositivo fisico, atualize `API_URL` em `mobile/src/config/appConfig.js` com o endereco IP da maquina que executa o server. Nao use `localhost` no celular, pois ele aponta para o proprio dispositivo.

## Fluxo de dados

1. O usuario cria um registro no mobile.
2. O registro e gravado no AsyncStorage com `pendingSync: true`.
3. A interface continua funcionando sem internet.
4. Ao detectar conexao, os registros pendentes sao enviados para `POST /api/v1/sync`.
5. O backend usa `clientId` unico para tornar retries idempotentes.
6. Exclusoes sao aplicadas localmente imediatamente e ficam numa fila persistida ate o `DELETE` ser confirmado.

## Tipos de registro

- `beer` - cerveja
- `cigarette` - cigarro
- `water` - agua
- `coffee` - cafe

## API resumida

- `GET /health` - verifica disponibilidade da API.
- `GET /api/v1/consumptions` - lista registros; aceita `from` e `to` como filtros ISO-8601.
- `GET /api/v1/consumptions/:clientId` - consulta um registro pelo identificador do dispositivo.
- `POST /api/v1/consumptions` - cria um registro individual.
- `POST /api/v1/sync` - sincroniza ate 500 registros em lote.
- `DELETE /api/v1/consumptions/:clientId` - remove um registro; e idempotente.

Exemplo de payload:

```json
{
  "clientId": "mobile-1720000000000-ab12",
  "type": "water",
  "quantity": 1,
  "occurredAt": "2026-09-09T12:00:00.000Z"
}
```

## Validacao

Backend:

```powershell
cd server
npm run build
```

Mobile:

```powershell
cd mobile
npx expo export --platform android
```

O diretorio `mobile/dist` gerado pelo export e apenas um artefato local de validacao.

## Seguranca e privacidade

O projeto armazena dados de consumo, que podem ser sensiveis. Antes de qualquer uso em producao:

- Nao use HTTP: publique a API somente com HTTPS/TLS.
- Remova a URL fixa do codigo e injete a URL por ambiente/build seguro.
- Restrinja CORS a origens conhecidas; nao mantenha `cors()` aberto.
- Adicione autenticacao e autorizacao por usuario antes de expor dados ou exclusoes.
- Adicione rate limiting, limites de payload, logs sem dados sensiveis e monitoramento.
- Valide tamanho e formato de `clientId`, datas e quantidades no servidor.
- Mantenha dependencias atualizadas e execute auditorias com `npm audit`.
- Nao versione `.env`, bancos SQLite, tokens, certificados ou dumps de dados.
- Proteja o arquivo SQLite e o diretorio `server/data` com permissoes minimas e backup criptografado.
- Considere criptografia local e politica de retencao para dados no dispositivo.
- Implemente exclusao/exportacao de dados por usuario quando houver contas.

O estado atual e adequado para desenvolvimento local, mas ainda nao deve ser considerado pronto para uma API publica sem essas camadas.
