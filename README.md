# Verzel Store QA

Testes da entrega de cupons e frete grátis. Primeiro foram executados manualmente e de forma exploratória; depois, os cenários foram automatizados com Playwright Test para apoiar a regressão.

## Requisitos

- Node.js 20 ou superior
- npm
- Navegador Chromium instalado pelo Playwright

## Instalação

```bash
npm install
npx playwright install chromium
```

## Executar

```bash
npm test
```

Executar somente um grupo:

```bash
npm run test:ui
npm run test:api
npm run evidence:bug-001
npm run video:bug-001
```

Os testes usam a loja de QA configurada em `playwright.config.js`. Para apontar para outro ambiente:

```powershell
$env:BASE_URL = "https://seu-ambiente"
npm test
```

No bash:

```bash
BASE_URL=https://seu-ambiente npm test
```

## Relatórios e evidências

- `tests/ui.spec.js`: cenários de interface para CA00 e CA01–CA11.
- `tests/api.spec.js`: cenários da API de cálculo e pedidos.
- `features/cupom_e_frete.feature`: cenários de aceite em Gherkin para consulta.
- `docs/resultado-execucao.md`: resultados da execução manual e automatizada, bugs e uso de IA.
- `docs/bugs-encontrados.md`: defeitos observados contra os critérios de aceite.
- `docs/evidencias/bug-001/`: capturas de tela do passo a passo para reproduzir o problema de frete.
- `docs/evidencias/bug-001/bug-001-frete-no-limite.webm`: vídeo curto da reprodução do BUG-001.
- `playwright-report/`: relatório HTML após a execução.
- `test-results/`: traces e screenshots de falhas.

Para abrir o relatório HTML:

```bash
npm run test:report
```

## Resultados conhecidos

Os testes mantêm as expectativas definidas nos critérios de aceite. Se o ambiente de QA divergir, os casos relacionados falham de propósito e deixam evidências em `test-results/`; não ajuste a asserção para aceitar um comportamento contrário à regra.
