const fs = require('fs');
const path = require('path');
const moment = require('moment');
const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // 设置页面的最大等待时间为 20 秒
    page.setDefaultTimeout(20000);

    // 读取文件内容，获取所有要抓取的 URL 列表
    const urls = fs
      .readFileSync('urls', 'utf-8')
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');

    for (const url of urls) {
      try {
        await page.goto(url);

        // 尝试不同的选择器
        const selectors = [
          '#app',
          '.content',
          'div',
          '.my-class',
          '#my-id',
          '[name="my-name"]',
          '.my-parent .my-child',
        ];

        let content = '';
        let success = false;

        for (const selector of selectors) {
          try {
            await page.waitForSelector(selector);
            const element = await page.$(selector);
            content = await page.evaluate(element => element.innerText, element);
            success = true;
            break;
          } catch (error) {
            console.error(`尝试通过选择器 ${selector} 获取 ${url} 内容失败：${error.message}`);
          }
        }

        if (success && content.trim() !== '') {
          const date = moment().format('YYYY-MM-DD');
          const urlWithoutProtocol = url.replace(/^(https?:\/\/)/, '');
          const fileName = path.join('data', `${urlWithoutProtocol.replace(/[:?<>|"*\r\n/]/g, '_')}_${date}.txt`);

          fs.writeFileSync(fileName, content);

          console.log(`网站 ${url} 内容已保存至文件：${fileName}`);
        } else {
          console.error(`无法提取 ${url} 的内容`);
        }
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
