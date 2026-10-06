const { test, expect } = require('@playwright/test');

async function calculateCart(request, items, coupon) {
  const body = { itens: items };
  if (coupon) body.cupom = coupon;

  return request.post('/api/carrinho/calcular', { data: body });
}

const validCustomer = {
  nome: 'Maria Silva',
  email: 'maria@exemplo.com',
  cep: '01310-100',
};

// CA01: API aplica 10% de desconto sobre os produtos.
test('CA01: API aplica 10% de desconto sobre os produtos', async ({ request }) => {
  const response = await calculateCart(request, [{ produtoId: 'P005', quantidade: 1 }], 'BEMVINDO10');
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.subtotal).toBe(100);
  expect(body.desconto).toBe(10);
  expect(body.frete).toBe(19.9);
  expect(body.total).toBe(109.9);
  expect(body.cupom.aplicado).toBe(true);
});

// CA02: API aceita cupom em minusculas e com espacos externos.
test('CA02: API aceita cupom em minusculas e com espacos externos', async ({ request }) => {
  const response = await calculateCart(request, [{ produtoId: 'P005', quantidade: 1 }], '  bemvindo10  ');
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.cupom.aplicado).toBe(true);
  expect(body.desconto).toBe(10);
});

// CA03: API informa cupom inexistente sem aplicar desconto.
test('CA03: API informa cupom inexistente sem aplicar desconto', async ({ request }) => {
  const response = await calculateCart(request, [{ produtoId: 'P005', quantidade: 1 }], 'CUPOM_INVALIDO');
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.cupom.aplicado).toBe(false);
  expect(body.cupom.mensagem).toBe('Cupom inválido.');
  expect(body.desconto).toBe(0);
});

// CA04: API informa cupom expirado sem aplicar desconto.
test('CA04: API informa cupom expirado sem aplicar desconto', async ({ request }) => {
  const response = await calculateCart(request, [{ produtoId: 'P005', quantidade: 1 }], 'VERAO2026');
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.cupom.aplicado).toBe(false);
  expect(body.cupom.mensagem).toBe('Cupom expirado.');
  expect(body.desconto).toBe(0);
});

// CA06: API oferece frete gratis no limite de R$ 200,00.
test('CA06: API oferece frete gratis no limite de R$ 200,00', async ({ request }) => {
  const response = await calculateCart(request, [{ produtoId: 'P005', quantidade: 2 }]);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.subtotal).toBe(200);
  expect(body.frete).toBe(0);
  expect(body.freteGratis).toBe(true);
  expect(body.valorFaltanteFreteGratis).toBe(0);
});

// CA07: API calcula frete fixo e valor faltante abaixo de R$ 200,00.
test('CA07: API calcula frete fixo e valor faltante abaixo de R$ 200,00', async ({ request }) => {
  const response = await calculateCart(request, [{ produtoId: 'P003', quantidade: 1 }]);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.subtotal).toBe(189.9);
  expect(body.frete).toBe(19.9);
  expect(body.freteGratis).toBe(false);
  expect(body.valorFaltanteFreteGratis).toBe(10.1);
});

// CA08: frete gratis usa o subtotal antes do desconto.
test('CA08: frete gratis usa o subtotal antes do desconto', async ({ request }) => {
  const response = await calculateCart(request, [{ produtoId: 'P005', quantidade: 2 }], 'BEMVINDO10');
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.subtotal).toBe(200);
  expect(body.desconto).toBe(20);
  expect(body.frete).toBe(0);
  expect(body.total).toBe(180);
});

// CA09: API nao aplica o desconto do cupom sobre o frete.
test('CA09: API nao aplica o desconto do cupom sobre o frete', async ({ request }) => {
  const response = await calculateCart(request, [{ produtoId: 'P003', quantidade: 1 }], 'BEMVINDO10');
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.subtotal).toBe(189.9);
  expect(body.desconto).toBe(18.99);
  expect(body.frete).toBe(19.9);
  expect(body.total).toBe(190.81);
});

// CA10: API aceita cinco unidades e rejeita seis.
test('CA10: API aceita cinco unidades e rejeita seis', async ({ request }) => {
  const validResponse = await calculateCart(request, [{ produtoId: 'P001', quantidade: 5 }]);
  const validBody = await validResponse.json();
  expect(validResponse.status()).toBe(200);
  expect(validBody.subtotal).toBe(299.5);

  const overLimitResponse = await request.post('/api/carrinho/calcular', {
    data: { itens: [{ produtoId: 'P001', quantidade: 6 }] },
  });
  expect(overLimitResponse.status()).toBe(422);
  expect((await overLimitResponse.json()).erro.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
});

// CA11: API retorna os valores monetarios com precisao de centavos.
test('CA11: API retorna os valores monetarios com precisao de centavos', async ({ request }) => {
  const response = await calculateCart(request, [{ produtoId: 'P001', quantidade: 3 }], 'BEMVINDO10');
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.subtotal).toBe(179.7);
  expect(body.desconto).toBe(17.97);
  expect(body.frete).toBe(19.9);
  expect(body.total).toBe(181.63);
});

// API: cria pedido com resumo de valores e numero no formato esperado.
test('API: cria pedido com resumo de valores e numero no formato esperado', async ({ request }) => {
  const response = await request.post('/api/pedidos', {
    data: {
      cliente: validCustomer,
      itens: [{ produtoId: 'P005', quantidade: 1 }],
      cupom: 'BEMVINDO10',
    },
  });
  const body = await response.json();

  expect(response.status()).toBe(201);
  expect(body.numero).toMatch(/^VZ-\d{6}$/);
  expect(body.subtotal).toBe(100);
  expect(body.desconto).toBe(10);
  expect(body.frete).toBe(19.9);
  expect(body.total).toBe(109.9);
});

// API: pedido com cupom expirado retorna erro 422.
test('API: pedido com cupom expirado retorna erro 422', async ({ request }) => {
  const response = await request.post('/api/pedidos', {
    data: {
      cliente: validCustomer,
      itens: [{ produtoId: 'P005', quantidade: 1 }],
      cupom: 'VERAO2026',
    },
  });

  expect(response.status()).toBe(422);
  expect((await response.json()).erro.codigo).toBe('CUPOM_EXPIRADO');
});
