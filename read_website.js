const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');

async function main() {
  const filepath = process.argv[2];
  const urls = fs.readFileSync(filepath, 'utf8').split('\n').filter(Boolean);

  const browser = await puppeteer.launch();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];

    try {
      // 检测网址可访问性
      await axios.get(url);
      console.log(`Successfully accessed ${url}`);

      // 在这里执行原来的爬取操作
      const page = await browser.newPage();
      await page.goto(url);
      // ...

    } catch (error) {
      console.log(`Failed to access ${url}: ${error.message}`);
      continue; // 跳过当前网址
    }
  }

  await browser.close();
}

main();
