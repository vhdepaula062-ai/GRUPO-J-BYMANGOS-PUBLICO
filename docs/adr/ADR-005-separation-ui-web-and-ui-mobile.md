# ADR-005: Separação Rígida entre Pacotes Visuais UI Web e UI Mobile

## Status
Aprovado

## Contexto
Projetos multiplataforma frequentemente tentam compartilhar componentes visuais entre React Web e React Native através de camadas de abstração como React Native Web ou wrappers complexos. Na prática, essa abordagem gera dependências frágeis, incompatibilidades de bundler (Webpack/Turbopack vs Metro), inchaço de pacotes e experiência de usuário degradada em ambas as plataformas.

## Decisão
Manter os pacotes de componentes de interface estritamente separados:
* `@grupo-j/ui-web`: Componentes web semânticos (HTML5, Tailwind CSS, Radix Primitives).
* `@grupo-j/ui-mobile`: Componentes mobile nativos (React Native StyleSheet, Safe Area Context, Gestures).
* O compartilhamento entre plataformas ocorre no nível de tokens semânticos (`@grupo-j/design-tokens`), tipos (`@grupo-j/types`), regras de domínio (`@grupo-j/domain`) e validações (`@grupo-j/validation`).

## Consequências
* **Positivas**: Builds estáveis sem conflito de runtime, aproveitamento máximo das capacidades nativas de cada plataforma e isolamento total de falhas.
