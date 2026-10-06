const path = require('node:path');
const fs = require('node:fs/promises');
const { chromium } = require('@playwright/test');

const baseUrl = process.env.BASE_URL || 'https://verzel-store.qa-test-verzel-store.workers.dev';
const evidenceDirectory = path.join(__dirname, '..', 'docs', 'evidencias', 'bug-001');
const videoDirectory = path.join(evidenceDirectory, 'video-tmp');
const videoPath = path.join(evidenceDirectory, 'bug-001-frete-no-limite.webm');

async function clearVideoAnnotations(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-video-annotation]').forEach((annotation) => annotation.remove());
  });
}

async function circleVideoTarget(page, target) {
  const box = await target.boundingBox();
  if (!box) throw new Error('Nao foi possivel localizar o valor para destacar no video.');

  await page.evaluate(({ box }) => {
    const namespace = 'http://www.w3.org/2000/svg';
    const overlay = document.createElementNS(namespace, 'svg');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('data-video-annotation', '');
    overlay.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;overflow:visible;pointer-events:none;z-index:2147483647';

    const circle = document.createElementNS(namespace, 'ellipse');
    circle.setAttribute('cx', String(box.x + box.width / 2));
    circle.setAttribute('cy', String(box.y + box.height / 2));
    circle.setAttribute('rx', String(Math.max(box.width / 2 + 18, 55)));
    circle.setAttribute('ry', String(Math.max(box.height / 2 + 12, 22)));
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#ff3b56');
    circle.setAttribute('stroke-width', '5');
    overlay.append(circle);
    document.body.append(overlay);
  }, { box });
}

async function captureVideo() {
  await fs.mkdir(videoDirectory, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: {
      dir: videoDirectory,
      size: { width: 1280, height: 900 },
    },
  });
  const page = await context.newPage();
  const video = page.video();

  try {
    await page.goto(baseUrl);
    await page.getByRole('heading', { name: 'Produtos' }).waitFor();
    await page.waitForTimeout(1000);

    const backpack = page.getByRole('article', { name: 'Mochila Urbana 20L' });
    await backpack.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await backpack.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.waitForTimeout(800);

    await page.getByRole('link', { name: /Carrinho/ }).click();
    await page.getByText('Subtotal', { exact: true }).waitFor();
    await circleVideoTarget(page, page.locator('dd[data-valor="frete"]'));
    await page.waitForTimeout(1800);

    await clearVideoAnnotations(page);
    await page.getByRole('textbox', { name: 'Cupom de desconto' }).fill('BEMVINDO10');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await page.getByText(/Cupom .* aplicado\./).waitFor();
    await circleVideoTarget(page, page.locator('dd[data-valor="frete"]'));
    await circleVideoTarget(page, page.locator('dd[data-valor="total"]'));
    await page.waitForTimeout(2000);
  } finally {
    await context.close();
    await browser.close();
  }

  const temporaryVideoPath = await video.path();
  await fs.rm(videoPath, { force: true });
  await fs.rename(temporaryVideoPath, videoPath);
  await fs.rm(videoDirectory, { recursive: true, force: true });

  console.log(`Video salvo em ${videoPath}`);
}

captureVideo().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
