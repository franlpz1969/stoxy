const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  try {
    if (!fs.existsSync('artifacts')) fs.mkdirSync('artifacts');

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const logs = [];

    page.on('console', msg => {
      logs.push({ type: 'console', level: msg.type(), text: msg.text() });
    });

    page.on('pageerror', err => {
      logs.push({ type: 'pageerror', message: err.message, stack: err.stack });
    });

    page.on('requestfailed', req => {
      const f = req.failure();
      logs.push({ type: 'requestfailed', url: req.url(), errorText: f && f.errorText });
    });

    page.on('response', response => {
      const status = response.status();
      if (status >= 400) {
        logs.push({ type: 'response-error', url: response.url(), status });
      }
    });

    console.log('📡 Navegando a http://localhost:8080 ...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2', timeout: 30000 });

    // Esperar a que la app inicialice internamente
    await new Promise(r => setTimeout(r, 1500));

    const title = await page.title();
    console.log('🔖 Title:', title);

    const screenshotPath = 'artifacts/frontend.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('📸 Captura guardada en', screenshotPath);

    console.log('📝 Consola capturada:');
    console.log(JSON.stringify(logs, null, 2));

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en headless test:', error);
    process.exit(2);
  }
})();
