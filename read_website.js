const fs = require('fs');
const path = require('path');
const moment = require('moment');
const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const executablePath = await puppeteer.executablePath();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const urls = fs.readFileSync('urls', 'utf-8').split(/\r?\n/);
    const outputDir = path.join(__dirname, 'output');

    for (const url of urls) {
      // 如果 URL 是空行，则跳过
      if (!url.trim()) {
        continue;
      }

      try {
        console.log(`Visiting ${url}...`);
        await page.goto(url);

        // 等待页面中的任意一个元素加载完成
        await page.waitForSelector('body');

        const title = await page.title();
        const date = moment().format('YYYY-MM-DD');
        const filename = `${title.replace(/[:/\\]/g, '_')}_${date}.txt`;
        const content = await page.content();

        fs.writeFileSync(path.join(outputDir, filename), content);
        console.log(`Content saved to ${path.join(outputDir, filename)}`);
      } catch (err) {
        console.error(`Error occurred while processing ${url}: ${err.stack}`);
      }
    }

    await browser.close();
    console.log('All done!');
  } catch (err) {
    console.error(`Error occurred while launching Puppeteer: ${err.stack}`);
  }
})();
