const path = require('node:path');
const fs = require('node:fs/promises');
const { chromium } = require('@playwright/test');

const baseUrl = process.env.BASE_URL || 'https://verzel-store.qa-test-verzel-store.workers.dev';
const evidenceDirectory = path.join(__dirname, '..', 'docs', 'evidencias', 'bug-001');
const videoDirectory = path.join(evidenceDirectory, 'video-tmp');
const videoPath = path.join(evidenceDirectory, 'bug-001-frete-no-limite.webm');

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
    await page.waitForTimeout(1800);

    await page.getByRole('textbox', { name: 'Cupom de desconto' }).fill('BEMVINDO10');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await page.getByText(/Cupom .* aplicado\./).waitFor();
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
