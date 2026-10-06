const { test, expect } = require('@playwright/test');

async function addProductToCart(page, productName, quantity = 1) {
  const product = page.getByRole('article', { name: productName });

  for (let index = 0; index < quantity; index += 1) {
    await product.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  }

  await page.getByRole('link', { name: /Carrinho/ }).click();
}

async function applyCoupon(page, coupon) {
  await page.getByRole('textbox', { name: 'Cupom de desconto' }).fill(coupon);
  await page.getByRole('button', { name: 'Aplicar cupom' }).click();
}

function summaryValue(page, label) {
  const keys = {
    Subtotal: 'subtotal',
    Desconto: 'desconto',
    Frete: 'frete',
    Total: 'total',
  };

  return page.locator(`dd[data-valor="${keys[label]}"]`);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('CA00: abre a pagina inicial da loja', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Frete grátis a partir de R$ 200,00.' })).toBeVisible();
});

test('CA01: aplica 10% sobre o subtotal dos produtos', async ({ page }) => {
  await addProductToCart(page, 'Mochila Urbana 20L');
  await applyCoupon(page, 'BEMVINDO10');

  await expect(summaryValue(page, 'Subtotal')).toHaveText('R$ 100,00');
  await expect(summaryValue(page, 'Desconto')).toContainText('R$ 10,00');
  await expect(summaryValue(page, 'Frete')).toHaveText('R$ 19,90');
  await expect(summaryValue(page, 'Total')).toHaveText('R$ 109,90');
});

test('CA02: aceita o codigo do cupom em letras minusculas', async ({ page }) => {
  await addProductToCart(page, 'Mochila Urbana 20L');
  await applyCoupon(page, 'bemvindo10');

  await expect(summaryValue(page, 'Desconto')).toContainText('R$ 10,00');
});

test('CA02: ignora espacos no inicio e no fim do cupom', async ({ page }) => {
  await addProductToCart(page, 'Mochila Urbana 20L');
  await applyCoupon(page, '  BEMVINDO10  ');

  await expect(summaryValue(page, 'Desconto')).toContainText('R$ 10,00');
});

test('CA03: cupom inexistente exibe erro e nao aplica desconto', async ({ page }) => {
  await addProductToCart(page, 'Mochila Urbana 20L');
  await applyCoupon(page, 'CUPOM_INVALIDO');

  await expect(page.getByText('Cupom inválido.', { exact: true })).toBeVisible();
  await expect(summaryValue(page, 'Desconto')).toHaveText('R$ 0,00');
});

test('CA04: cupom expirado exibe erro e nao aplica desconto', async ({ page }) => {
  await addProductToCart(page, 'Mochila Urbana 20L');
  await applyCoupon(page, 'VERAO2026');

  await expect(page.getByText('Cupom expirado.', { exact: true })).toBeVisible();
  await expect(summaryValue(page, 'Desconto')).toHaveText('R$ 0,00');
});

test('CA05: remove o cupom atual antes de aplicar outro', async ({ page }) => {
  await addProductToCart(page, 'Mochila Urbana 20L');
  await applyCoupon(page, 'BEMVINDO10');
  await page.getByRole('button', { name: 'Remover cupom' }).click();

  await expect(summaryValue(page, 'Desconto')).toHaveText('R$ 0,00');
  await applyCoupon(page, 'VERAO2026');

  await expect(page.getByText('Cupom expirado.', { exact: true })).toBeVisible();
  await expect(summaryValue(page, 'Desconto')).toHaveText('R$ 0,00');
});

test('CA06: frete gratis a partir de subtotal de R$ 200,00', async ({ page }) => {
  await addProductToCart(page, 'Mochila Urbana 20L', 2);

  await expect(summaryValue(page, 'Subtotal')).toHaveText('R$ 200,00');
  await expect(summaryValue(page, 'Frete')).toHaveText('R$ 0,00');
});

test('CA07: abaixo de R$ 200,00 cobra frete e informa o valor faltante', async ({ page }) => {
  await addProductToCart(page, 'Tênis Casual Urbano');

  await expect(summaryValue(page, 'Frete')).toHaveText('R$ 19,90');
  await expect(page.getByText('Faltam R$ 10,10 para o frete grátis.')).toBeVisible();
});

test('CA08: frete gratis considera o subtotal antes do desconto', async ({ page }) => {
  await addProductToCart(page, 'Mochila Urbana 20L', 2);
  await applyCoupon(page, 'BEMVINDO10');

  await expect(summaryValue(page, 'Subtotal')).toHaveText('R$ 200,00');
  await expect(summaryValue(page, 'Desconto')).toContainText('R$ 20,00');
  await expect(summaryValue(page, 'Frete')).toHaveText('R$ 0,00');
  await expect(summaryValue(page, 'Total')).toHaveText('R$ 180,00');
});

test('CA09: o desconto do cupom nao incide sobre o frete', async ({ page }) => {
  await addProductToCart(page, 'Tênis Casual Urbano');
  await applyCoupon(page, 'BEMVINDO10');

  await expect(summaryValue(page, 'Subtotal')).toHaveText('R$ 189,90');
  await expect(summaryValue(page, 'Desconto')).toContainText('R$ 18,99');
  await expect(summaryValue(page, 'Frete')).toHaveText('R$ 19,90');
  await expect(summaryValue(page, 'Total')).toHaveText('R$ 190,81');
});

test('CA10: interface limita cada produto a cinco unidades', async ({ page }) => {
  await addProductToCart(page, 'Camiseta Essencial', 5);

  await expect(page.getByRole('status', { name: 'Quantidade de Camiseta Essencial' })).toHaveText('5');
  await expect(page.getByRole('button', { name: 'Aumentar quantidade de Camiseta Essencial' })).toBeDisabled();
});

test('CA11: arredonda valores monetarios para duas casas decimais', async ({ page }) => {
  await addProductToCart(page, 'Camiseta Essencial');
  await applyCoupon(page, 'BEMVINDO10');

  await expect(summaryValue(page, 'Subtotal')).toHaveText('R$ 59,90');
  await expect(summaryValue(page, 'Desconto')).toContainText('R$ 5,99');
  await expect(summaryValue(page, 'Frete')).toHaveText('R$ 19,90');
  await expect(summaryValue(page, 'Total')).toHaveText('R$ 73,81');
});
