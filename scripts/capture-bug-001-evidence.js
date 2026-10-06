const path = require('node:path');
const { chromium } = require('@playwright/test');

const baseUrl = process.env.BASE_URL || 'https://verzel-store.qa-test-verzel-store.workers.dev';
const evidenceDirectory = path.join(__dirname, '..', 'docs', 'evidencias', 'bug-001');

async function captureEvidence() {
  const fs = require('node:fs/promises');
  await fs.mkdir(evidenceDirectory, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  try {
    await page.goto(baseUrl);
    await page.getByRole('heading', { name: 'Produtos' }).waitFor();
    await page.screenshot({ path: path.join(evidenceDirectory, '01-catalogo.png'), fullPage: true });

    const backpack = page.getByRole('article', { name: 'Mochila Urbana 20L' });
    await backpack.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await backpack.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await backpack.screenshot({ path: path.join(evidenceDirectory, '02-produto-adicionado-duas-vezes.png') });

    await page.getByRole('link', { name: /Carrinho/ }).click();
    await page.getByText('Subtotal', { exact: true }).waitFor();
    await page.screenshot({ path: path.join(evidenceDirectory, '03-carrinho-subtotal-200-frete-cobrado.png'), fullPage: true });

    await page.getByRole('textbox', { name: 'Cupom de desconto' }).fill('BEMVINDO10');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await page.getByText(/Cupom .* aplicado\./).waitFor();
    await page.screenshot({ path: path.join(evidenceDirectory, '04-carrinho-apos-cupom.png'), fullPage: true });
  } finally {
    await browser.close();
  }

  console.log(`Evidencias salvas em ${evidenceDirectory}`);
}

captureEvidence().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
