# Android: diagnóstico do build e estado da integração

## Escopo e conclusão

Análise realizada em 15/09/2026 sobre a árvore de trabalho, incluindo alterações locais já existentes. O APK atual é **staging, com fluxos de demonstração**. Não constitui uma versão final sincronizada e não deve ser usado para autenticar clientes, cobrar ou autorizar serviços reais.

## Falha reproduzida

`gradlew.bat assembleRelease` no diretório original falhou em `react-native-screens`, durante a compilação C++:

```text
ninja: error: manifest 'build.ninja' still dirty after 100 tries
BUILD FAILED
```

O log contém caminhos com o nome `PROGRAMAÇÃO` corrompido. A propriedade `android.overridePathCheck=true` desabilitava a proteção do Android contra caminhos não ASCII; ela não corrige o CMake/Ninja. Havia também caminhos absolutos para um JDK específico desta máquina.

Também foi reproduzida a mesma falha em um caminho ASCII dentro do perfil do usuário: `ninja -d explain` declarou inexistente um arquivo CMake que estava presente. O caminho de trabalho concatenado ao caminho relativo desse arquivo tinha exatamente 260 caracteres. Portanto, retirar acentos é insuficiente: a raiz de compilação também precisa ser muito curta. O script usa `C:\gjb\<id>` (no disco do sistema) e rejeita raízes acima de 20 caracteres. O Ninja instalado é 1.10.2; a limitação de caminhos Windows é documentada no [projeto Ninja](https://github.com/ninja-build/ninja/issues/2359).

Após resolver o caminho, apareceu uma segunda falha em `compileReleaseJavaWithJavac`: `cannot find symbol expo.core.ExpoModulesPackage`. O autolinking do Expo SDK 52 carrega configurações como texto; quando recebe o caminho simbólico do pnpm, não encontra as dependências da configuração do Expo, ignora o erro e deduz o pacote Java a partir do namespace Android. O pacote correto é `expo.modules.ExpoModulesPackage`. A configuração `apps/customer-mobile/react-native.config.js` agora fornece a raiz física do Expo via `require.resolve`, permitindo que a configuração original da biblioteca seja carregada. A saída do autolinking corrigido foi verificada diretamente.

## Correção e reprodução

Na raiz do repositório, executar:

```powershell
pnpm build:apk
```

O script `scripts/build-android.ps1` cria uma cópia física nova em caminho sem espaços ou acentos, instala exatamente o lockfile, verifica os tipos do aplicativo, compila `assembleRelease`, verifica a assinatura e copia o APK para `artifacts/android/grupo-j-staging.apk`, com SHA-256 e log. A cópia é mantida para diagnóstico e não altera nem apaga o checkout original. Junctions não são usadas, pois ferramentas podem resolver o caminho original.

Pré-requisitos: Node/pnpm do projeto, JDK 17 em `JAVA_HOME` ou no PATH, Android SDK em `ANDROID_HOME` ou `%LOCALAPPDATA%/Android/Sdk`, SDK/build-tools 35, NDK 26.1.10909125, CMake e o keystore de staging existente. Para definir caminhos explicitamente:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-android.ps1 -BuildRoot C:\gjb\build-01 -JavaHome 'C:\caminho\jdk-17' -AndroidSdk 'C:\Android\Sdk'
```

`BuildRoot` deve ser novo e estar fora do repositório. O script não copia arquivos `.env*` do backend; variáveis públicas necessárias devem ser fornecidas no ambiente do processo. Nenhum segredo do backend deve receber prefixo `EXPO_PUBLIC_`.

O perfil EAS `preview` agora especifica APK explicitamente. A configuração EAS não equivale a uma publicação executada. O identificador Android continua `br.com.grupoj.autocenter.staging`, versão 0.1.0. O keystore existente serve para staging e sua senha padrão está no Gradle preexistente; uma distribuição definitiva exige identidade e assinatura próprias, preservadas fora do controle de versão.

## Bloqueios de operação real encontrados

| Área | Evidência no código | Trabalho necessário |
| --- | --- | --- |
| Acesso mobile | `src/app/index.tsx` entra direto na área interna; `login.tsx` e `cadastro.tsx` usam temporizadores | Autenticação real, proteção de rotas, armazenamento seguro, renovação e revogação de sessão |
| Dados mobile | Início, veículos, perfil e histórico importam `@grupo-j/test-utils`; demais telas também têm listas fixas | Substituir dados fictícios por consultas autenticadas, com estados de erro, vazio e atualização |
| Vouchers | `beneficios.tsx` usa `Math.random()` e contador local | Emissão persistente no servidor, validade e uso único verificados em transação |
| API | Login gera `gj_jwt_` com Base64; refresh aceita prefixo; diversas rotas respondem mocks | Verificação criptográfica de sessão, autorização e persistência real por usuário/oficina |
| Contrato | `extra.apiUrl` termina em `/v1`, enquanto o cliente acrescenta `/api/v1/...`; cliente chama GET `/api/v1/benefits`, rota inexistente | Unificar base URL e contratos, implementar endpoints e testes de integração |
| Ambiente | `.env` e `.env.local` apontam para `localhost`; `app.json` aponta para staging sem DNS | Definir API HTTPS acessível pelo aparelho e o mesmo Supabase usado pelos SaaS |
| SaaS | `packages/database/src/workshops-store.ts` grava arquivo local ou memória e injeta oficinas de exemplo | Banco compartilhado como fonte de verdade; arquivo/memória não sincronizam instâncias publicadas |
| Check-in | Ação da oficina aceita códigos `DEMO`, `GRUPOJ`, `GJ-94021` e placa fixa; atualização não verifica erro | Remover atalhos e validar assinatura, oficina, saldo, expiração e concorrência |
| Pagamentos | Adaptadores PagSeguro e Mercado Pago criam IDs locais; webhook usa Set em memória | Integração efetiva com provedor, assinatura do webhook e idempotência persistente |
| Saúde | `/api/health` declara banco/storage disponíveis sem consultá-los | Probe real de dependências; HTTP 200 atual não comprova banco funcional |
| Banco | Existem migrations e RLS, mas várias tabelas habilitadas não têm políticas suficientes para os fluxos necessários | Revisar schema/políticas junto aos contratos e executar testes de isolamento num banco de homologação |

Esses problemas são anteriores à correção do build e **não foram resolvidos por compilar o APK**. Os textos de preparação e operação em outros documentos não comprovam implementação ou publicação completa.

## Verificações desta análise

- Build limpo em `C:\gjb\a6c7570e`: **BUILD SUCCESSFUL in 9m 12s**, 509 tarefas executadas.
- APK entregue: `artifacts/android/grupo-j-staging.apk`, versão 0.1.0, identificador `br.com.grupoj.autocenter.staging`. O build de 15/09/2026 com login inicial e ícones possui 65.170.899 bytes.
- Assinatura APK v2 e alinhamento ZIP verificados; pacote não marcado como debuggable; SDK mínimo 24 (Android 7), target 34, compilado com SDK 35.
- Bibliotecas para `arm64-v8a`, `armeabi-v7a`, `x86` e `x86_64`; bundle embarcado `assets/index.android.bundle` presente com 1.363.572 bytes e Hermes nas quatro arquiteturas. Não depende de Metro para fornecer o bundle; isso não equivale a teste de execução.
- SHA-256 atual: `C94AE08DB2C72B858597E2ED99EA3228FD75BDE6939FA4CB349B024931D1B565`.
- Na primeira finalização, o host não disponibilizou `Get-FileHash`, depois de já gerar e verificar o APK. A finalização foi extraída para `scripts/verify-android-apk.ps1`, usa SHA-256 via .NET e foi executada com sucesso sobre o APK gerado. O build nativo não precisou ser repetido para essa correção de empacotamento.
- `pnpm typecheck`: 17 tarefas bem-sucedidas, sendo 15 recuperadas do cache.
- `pnpm test`: 5 tarefas bem-sucedidas, sendo 4 recuperadas do cache; total reportado de 16 testes existentes. Não são testes ponta a ponta.
- API local em `localhost:3002` e Supabase local em `localhost:54321`: conexão recusada no momento da verificação.
- `staging-api.grupoj.com.br`: resolução DNS falhou (`ENOTFOUND`).
- Página `/login` do endereço de administração documentado `https://grupo-j-admin.vercel.app`: HTTP 200; isto não valida login, banco ou sincronização.
- ADB: nenhum aparelho/emulador conectado no momento da inspeção. Instalação e execução no Android ainda precisam ser verificadas.

## Dados necessários para concluir a versão final

Endereços e ambiente de publicação da API e dos dois SaaS; acesso ao projeto Supabase efetivamente usado por eles; ambiente do provedor de pagamentos escolhido; configuração segura de assinatura Android; conta de homologação e aparelho/emulador para o teste completo. Segredos devem ser configurados no ambiente local/serviço, nunca em mensagens nem no APK.

Depois de implementar os bloqueios acima, validar pelo menos: cadastro/login real, persistência após reiniciar, cadastro de veículo visível na oficina e no admin, alterações administrativas refletidas no aplicativo, emissão/consumo de voucher sem reutilização, isolamento entre clientes/oficinas e confirmação de pagamento via webhook. Apenas então classificar um artefato como versão final integrada.
