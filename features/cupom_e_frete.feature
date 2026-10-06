# language: pt
Funcionalidade: Cupom de desconto e frete grátis
  Como cliente da Verzel Store
  Quero aplicar cupons de desconto e obter frete grátis conforme o subtotal
  Para pagar o valor correto pelo meu pedido

  Cenário: CA00 - Abrir a página inicial da loja
    Quando eu acessar a loja Verzel Store
    Então a página de produtos deve ser exibida

  Cenário: CA01 - Aplicar cupom válido sobre o subtotal dos produtos
    Dado que eu tenha 1 Mochila Urbana 20L de R$ 100,00 no carrinho
    Quando eu aplicar o cupom "BEMVINDO10"
    Então o subtotal deve ser "R$ 100,00"
    E o desconto deve ser "R$ 10,00"
    E o frete deve ser "R$ 19,90"
    E o total deve ser "R$ 109,90"

  Esquema do Cenário: CA02 - Ignorar diferenças entre maiúsculas e minúsculas
    Dado que eu tenha 1 Mochila Urbana 20L no carrinho
    Quando eu aplicar o cupom "<codigo>"
    Então o desconto de "R$ 10,00" deve ser aplicado

    Exemplos:
      | codigo     |
      | bemvindo10 |
      | BemVindo10 |

  Cenário: CA02 - Remover espaços no início e no fim do código
    Dado que eu tenha 1 Mochila Urbana 20L no carrinho
    Quando eu aplicar o cupom "  BEMVINDO10  "
    Então o desconto de "R$ 10,00" deve ser aplicado

  Cenário: CA03 - Rejeitar cupom inexistente
    Dado que eu tenha 1 Mochila Urbana 20L no carrinho
    Quando eu aplicar o cupom "CUPOM_INVALIDO"
    Então devo ver a mensagem "Cupom inválido."
    E o desconto deve permanecer em "R$ 0,00"

  Cenário: CA04 - Rejeitar cupom expirado
    Dado que eu tenha 1 Mochila Urbana 20L no carrinho
    Quando eu aplicar o cupom "VERAO2026"
    Então devo ver a mensagem "Cupom expirado."
    E o desconto deve permanecer em "R$ 0,00"

  Cenário: CA05 - Remover o cupom antes de trocar
    Dado que eu tenha 1 Mochila Urbana 20L no carrinho
    E o cupom "BEMVINDO10" esteja aplicado
    Quando eu remover o cupom atual
    E eu aplicar o cupom "VERAO2026"
    Então devo ver a mensagem "Cupom expirado."
    E o desconto deve permanecer em "R$ 0,00"

  Cenário: CA06 - Frete grátis no limite de R$ 200,00
    Dado que eu tenha 2 Mochilas Urbanas 20L no carrinho
    Então o frete deve ser "R$ 0,00"

  Cenário: CA07 - Frete fixo abaixo do limite
    Dado que eu tenha 1 Tênis Casual Urbano de R$ 189,90 no carrinho
    Então o frete deve ser "R$ 19,90"
    E faltam "R$ 10,10" para o frete grátis

  Cenário: CA08 - Calcular frete pelo subtotal sem desconto
    Dado que eu tenha 2 Mochilas Urbanas 20L no carrinho
    Quando eu aplicar o cupom "BEMVINDO10"
    Então o desconto deve ser "R$ 20,00"
    E o frete deve continuar "R$ 0,00"
    E o total deve ser "R$ 180,00"

  Cenário: CA09 - Não descontar o frete
    Dado que eu tenha 1 Tênis Casual Urbano de R$ 189,90 no carrinho
    Quando eu aplicar o cupom "BEMVINDO10"
    Então o desconto deve ser "R$ 18,99"
    E o frete deve continuar "R$ 19,90"
    E o total deve ser "R$ 190,81"

  Cenário: CA10 - Limitar quantidade por produto na interface
    Dado que eu selecione a Camiseta Essencial
    Quando eu adicionar 5 unidades ao carrinho
    Então a quantidade deve ser 5
    E a interface deve impedir adicionar uma sexta unidade

  Cenário: CA10 - Limitar quantidade por produto na API
    Quando eu calcular o carrinho com 5 unidades do produto "P001"
    Então a API deve responder com status 200
    Quando eu calcular o carrinho com 6 unidades do produto "P001"
    Então a API deve responder com status 422
    E o código do erro deve ser "QUANTIDADE_MAXIMA_EXCEDIDA"

  Cenário: CA11 - Arredondar valores para duas casas decimais
    Dado que eu tenha 3 Camisetas Essenciais de R$ 59,90 cada no carrinho
    Quando eu aplicar o cupom "BEMVINDO10"
    Então o subtotal deve ser "R$ 179,70"
    E o desconto deve ser "R$ 17,97"
    E o frete deve ser "R$ 19,90"
    E o total deve ser "R$ 181,63"
