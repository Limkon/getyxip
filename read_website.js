const fs = require('fs');
const path = require('path');
const moment = require('moment');
const puppeteer = require('puppeteer-core');

const urls = fs
  .readFileSync('urls_tmp', 'utf-8')
  .split('\n')
  .map(url => url.trim())
  .filter(url => url !== '');

const processedUrls = [];
const failedUrls = [];

const puppeteerDefaultArgs = {
  launchOptions: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--incognito',
    ],
    defaultViewport: { width: 1280, height: 800 },
  },

  async isPageAlive(pageUrl) {
    try {
      const browser = await puppeteer.launch(this.launchOptions);
      const page = await browser.newPage();
      await page.goto(pageUrl, { timeout: 10000 });
      await browser.close();
      return true;
    } catch (error) {
      return false;
    }
  },
};

(async () => {
  for (const url of urls) {
    try {
      // 解析文件名
      const filename = url.split('/')[2];
      const timestamp = moment().format('YYYYMMDDHHmmss');
      const filepath = path.join('data', `${filename}_${timestamp}.txt`).replace(/[:?<>|"*\r\n]/g, '_');

      // 检查链接是否可以访问
      if (!(await puppeteerDefaultArgs.isPageAlive(url))) {
        console.error(`Skipping URL: ${url}, unable to access.`);
        failedUrls.push(url);
        continue;
      }

      // 使用 puppeteer 爬取网页
      const browser = await puppeteer.launch(puppeteerDefaultArgs.launchOptions);
      const page = await browser.newPage();
      await page.goto(url, { timeout: 10000 });
      const content = await page.content();
      fs.writeFileSync(filepath, content);
      await browser.close();
      processedUrls.push(url);

      console.log(`网站 ${url} 内容已保存至文件：${filepath}`);
    } catch (error) {
      console.error(`处理 ${url} 失败：${error.message}`);
      failedUrls.push(url);
    }
  }

  fs.writeFileSync('urls2_tmp', failedUrls.join('\n'));
  console.log('所有网站内容保存完成！');
})();
