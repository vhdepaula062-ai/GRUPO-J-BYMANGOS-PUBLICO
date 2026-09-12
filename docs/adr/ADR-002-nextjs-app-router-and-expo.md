# ADR-002: Next.js App Router para Web e Expo / React Native para Mobile

## Status
Aprovado

## Contexto
O ecossistema necessita de alta performance, renderização no servidor para SEO nas páginas públicas das oficinas, painéis administrativos com carregamento instantâneo e uma experiência mobile nativa de verdade para os motoristas no trânsito e na oficina (câmera fluida para QR Code e fotos de hodômetro, feedback tátil, operação offline suave).

## Decisão
1. **Aplicações Web e API (`admin-web`, `workshop-web`, `api`)**: Utilizar **Next.js 14+ com App Router**, adotando Server Components por padrão e Client Components restritos a áreas de interatividade real, estilizados com Tailwind CSS.
2. **Aplicativo do Motorista (`customer-mobile`)**: Utilizar **Expo SDK com Expo Router (React Native)** em TypeScript strict, gerando binários nativos reais para Android (.aab) e iOS (.ipa) via EAS Build, rejeitando terminantemente o uso de WebView descartável.

## Consequências
* **Positivas**: SSR e streaming para a web, segurança aprimorada ao manter segredos em Server Components, aplicativo nativo de alta responsividade e facilidade de publicação no Google Play e Apple App Store.
* **Mitigações**: Separação estrita dos pacotes de interface gráfica (`ui-web` vs `ui-mobile`).
