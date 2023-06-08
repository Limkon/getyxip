const fs = require('fs');
const path = require('path');
const moment = require('moment');
const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // 读取文件内容，获取所有要抓取的URL列表
    const urls = fs
      .readFileSync('urls_tmp', 'utf-8')
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');

    const processedUrls = [];
    const failedUrls = [];

    for (const url of urls) {
      try {
        await page.goto(url);
        await page.waitForSelector('#app');

        const title = await page.title();
        const appElement = await page.$('#app');
        const content = await page.evaluate(element => element.innerText, appElement);

        const date = moment().format('YYYY-MM-DD');
        const fileName = path.join('data', `${title}_${date}.txt`).replace(/[:?<>|"*\r\n]/g, '_');

        fs.writeFileSync(fileName, content);
        processedUrls.push(url);

        console.log(`网站 ${url} 内容已保存至文件：${fileName}`);
      } catch (error) {
        console.error(`处理 ${url} 失败：${error.message}`);
        failedUrls.push(url);
      }
    }

    fs.writeFileSync('url2', failedUrls.join('\n'));
    console.log('所有网站内容保存完成！');

    await browser.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
