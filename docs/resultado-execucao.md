# Resultado da execucao

Data: 06/10/2026  
Comando: `npm test`  
Runner: Playwright Test, Chromium  
Resultado: 25 testes executados, 20 aprovados e 5 reprovados.

## Resultado por criterio

| Criterio | Resultado automatizado | Observacao |
| --- | --- | --- |
| CA00 | Aprovado | Pagina inicial carregada. |
| CA01 | Aprovado | Cupom aplicou 10% sobre os produtos. |
| CA02 | Aprovado | Codigo em minusculas e com espacos externos aceito. |
| CA03 | Aprovado | Mensagem de cupom invalido e desconto zero. |
| CA04 | Aprovado | Mensagem de cupom expirado e desconto zero. |
| CA05 | Aprovado | Remocao do cupom antes de tentar outro. |
| CA06 | Reprovado | API e interface retornaram frete de R$ 19,90 para subtotal de R$ 200,00; esperado R$ 0,00. |
| CA07 | Aprovado | Frete de R$ 19,90 e faltante de R$ 10,10. |
| CA08 | Reprovado | Com subtotal de R$ 200,00 e cupom, API e interface mantiveram frete de R$ 19,90; esperado R$ 0,00. |
| CA09 | Aprovado | Desconto aplicado aos produtos, sem reduzir o frete. |
| CA10 | Parcial | Interface limita a cinco e API aceita cinco. API aceitou seis; esperado erro 422. |
| CA11 | Aprovado | Valores de subtotal, desconto, frete e total com duas casas decimais. |

## Execucao manual e exploratoria

Antes de criar a automacao, executei manualmente e de forma exploratoria todos os cenarios de teste. Analisei as regras de negocio de cupons e frete, percorri os fluxos da loja e da API, registrei os comportamentos observados e documentei os bugs encontrados. Somente depois de concluir essa validacao manual criei a suite de testes E2E com Playwright, para automatizar a regressao dos cenarios e facilitar novas execucoes.

## Evidencias

O Playwright guarda screenshots, traces e contexto dos testes reprovados em `test-results/`. O relatorio HTML e gerado em `playwright-report/` e pode ser aberto com `npm run test:report`.

## Uso de inteligencia artificial

Utilizei o assistente de IA integrado ao VS Code como apoio durante o fluxo de trabalho de QA. Depois da analise da documentacao e da validacao manual e exploratoria completa, usei a IA para auxiliar na estrutura e na escrita dos testes automatizados E2E com Playwright, bem como no ajuste de seletores e assercoes.

A IA foi uma ferramenta de produtividade para apoiar a codificacao. As regras de negocio e os criterios testados foram definidos a partir da minha analise da documentacao e das observacoes da aplicacao; os resultados foram conferidos pela execucao dos testes.
