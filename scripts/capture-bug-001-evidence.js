const path = require('node:path');
const { chromium } = require('@playwright/test');

const baseUrl = process.env.BASE_URL || 'https://verzel-store.qa-test-verzel-store.workers.dev';
const evidenceDirectory = path.join(__dirname, '..', 'docs', 'evidencias', 'bug-001');

async function clearAnnotations(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-evidence-annotation]').forEach((annotation) => annotation.remove());
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(200);
}

async function circleOnScreenshot(page, target) {
  const box = await target.boundingBox();
  if (!box) throw new Error('Nao foi possivel localizar o elemento da evidencia.');

  const pageSize = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  }));

  await page.evaluate(({ box, pageSize }) => {
    const namespace = 'http://www.w3.org/2000/svg';
    const overlay = document.createElementNS(namespace, 'svg');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('data-evidence-annotation', '');
    overlay.setAttribute('width', String(pageSize.width));
    overlay.setAttribute('height', String(pageSize.height));
    overlay.style.cssText = `position:absolute;left:0;top:0;width:${pageSize.width}px;height:${pageSize.height}px;overflow:visible;pointer-events:none;z-index:2147483647`;

    const circle = document.createElementNS(namespace, 'ellipse');
    circle.setAttribute('cx', String(box.x + pageSize.scrollX + box.width / 2));
    circle.setAttribute('cy', String(box.y + pageSize.scrollY + box.height / 2));
    circle.setAttribute('rx', String(Math.max(box.width / 2 + 18, 55)));
    circle.setAttribute('ry', String(Math.max(box.height / 2 + 12, 22)));
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#ff3b56');
    circle.setAttribute('stroke-width', '5');
    overlay.append(circle);
    document.body.append(overlay);
  }, { box, pageSize });
}

async function captureEvidence() {
  const fs = require('node:fs/promises');
  await fs.mkdir(evidenceDirectory, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  try {
    await page.goto(baseUrl);
    await page.getByRole('heading', { name: 'Produtos' }).waitFor();
    const backpack = page.getByRole('article', { name: 'Mochila Urbana 20L' });
    await clearAnnotations(page);
    await circleOnScreenshot(page, backpack.getByRole('heading', { name: 'Mochila Urbana 20L' }));
    await page.screenshot({ path: path.join(evidenceDirectory, '01-catalogo.png'), fullPage: true });

    await backpack.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await backpack.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    const itemCount = backpack.getByText('2 no carrinho');
    await itemCount.waitFor();
    await clearAnnotations(page);
    await circleOnScreenshot(page, itemCount);
    await page.screenshot({ path: path.join(evidenceDirectory, '02-produto-adicionado-duas-vezes.png'), fullPage: true });

    await page.getByRole('link', { name: /Carrinho/ }).click();
    await page.getByText('Subtotal', { exact: true }).waitFor();
    await clearAnnotations(page);
    await circleOnScreenshot(page, page.locator('dd[data-valor="frete"]'));
    await page.screenshot({ path: path.join(evidenceDirectory, '03-carrinho-subtotal-200-frete-cobrado.png'), fullPage: true });

    await page.getByRole('textbox', { name: 'Cupom de desconto' }).fill('BEMVINDO10');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await page.getByText(/Cupom .* aplicado\./).waitFor();
    await clearAnnotations(page);
    await circleOnScreenshot(page, page.locator('dd[data-valor="frete"]'));
    await circleOnScreenshot(page, page.locator('dd[data-valor="total"]'));
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
