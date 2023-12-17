const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // 设置页面超时时间为10秒
    page.setDefaultTimeout(10000);

    // 读取文件内容，获取所有要抓取的 URL 列表
    const urls = fs
      .readFileSync('urls', 'utf-8')
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');

    for (const url of urls) {
      try {
        await page.goto(url);

        // 页面加载后等待10秒
        await page.waitForTimeout(10000);

        const content = await page.evaluate(() => {
          return document.body.textContent; // 获取整个页面的文本内容
        });

        const date = moment().format('YYYY-MM-DD');
        const urlWithoutProtocol = url.replace(/^(https?:\/\/)/, '');
        const fileName = path.join('data', `${urlWithoutProtocol.replace(/[:?<>|"*\r\n/]/g, '_')}_${date}.txt`);

        fs.writeFileSync(fileName, content);

        console.log(`网站 ${url} 内容已保存至文件：${fileName}`);
      } catch (error) {
        console.error(`处理 ${url} 失败：${error.message}`);
      }
    }

    await browser.close();
    console.log('所有网站内容保存完成！');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
