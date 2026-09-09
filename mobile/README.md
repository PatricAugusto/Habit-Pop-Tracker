# Habit Pop Tracker Mobile

Aplicacao Expo/React Native para registrar cerveja, cigarro, agua e cafe com funcionamento offline-first.

## Requisitos

- Node.js LTS
- npm
- Expo Go ou emulador/dispositivo

## Instalar e executar

```powershell
npm install
npx expo start
```

Comandos uteis:

```powershell
npm run android
npm run ios
npm run web
npx expo export --platform android
```

## Configuracao da API

A URL atual da API esta em `src/config/appConfig.js`, na constante `API_URL`.

- Em emulador Android, use o endereco adequado ao ambiente, frequentemente `10.0.2.2` para acessar o host.
- Em dispositivo fisico, use o IP local da maquina que executa o server.
- O dispositivo e o server precisam estar na mesma rede quando a API estiver na rede local.

A URL esta fixa no estado atual do projeto para desenvolvimento. Para builds reais, mova essa configuracao para variaveis por ambiente ou configuracao de build e use HTTPS.

## Arquitetura

```text
App.js
src/
  components/   componentes de apresentacao
  config/       URL, tipos e metadados visuais
  domain/       criacao, filtros e totais de registros
  hooks/        estado da tela e orquestracao offline-first
  services/     AsyncStorage e comunicacao com a API
```

`App.js` apenas compoe a tela. O hook `useConsumptions` coordena carregamento local, estado de conectividade, inclusao, sincronizacao e exclusao.

## Persistencia local

O app usa AsyncStorage com duas chaves:

- `@habit-pop-tracker/consumptions`: registros exibidos localmente.
- `@habit-pop-tracker/deleted-consumptions`: `clientId`s excluidos localmente aguardando sincronizacao.

Cada registro recebe um `clientId` gerado no dispositivo. Esse identificador permite repetir uma sincronizacao sem criar duplicatas no backend.

## Operacoes offline

- Criar: salva localmente e marca como pendente.
- Sincronizar: envia pendencias para `POST /api/v1/sync` quando a rede volta.
- Excluir registro pendente: remove localmente sem criar uma exclusao remota.
- Excluir registro sincronizado: remove localmente e agenda um `DELETE` remoto.
- Falha de rede: os dados permanecem no dispositivo e a operacao pode ser repetida.

## Seguranca

- Nao coloque tokens, senhas ou chaves privadas no bundle do app.
- Nao trate `API_URL` HTTP como adequada para producao; use HTTPS.
- Evite registrar payloads de consumo em logs de debug.
- Considere que AsyncStorage nao e um cofre seguro. Para dados sensiveis, avalie armazenamento criptografado e bloqueio por dispositivo.
- Valide no servidor tudo que vier do app; a validacao do cliente e apenas uma melhoria de UX.
- Nao habilite builds de producao apontando para bancos ou APIs de desenvolvimento.

## Diagnostico

Se registros nao sincronizarem:

1. Confirme o status ONLINE/OFFLINE no app.
2. Confirme que a URL aponta para o IP/porta corretos.
3. Verifique se o dispositivo alcanca `GET /health`.
4. Confira o contador de pendencias.
5. Nao apague o AsyncStorage antes de investigar, pois ele contem os registros locais.
