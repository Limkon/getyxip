const puppeteer = require('puppeteer');
const moment = require('moment');
const fs = require('fs');

async function main() {
  const url = process.argv[2];
  const filepath = process.argv[3];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const content = await page.content();
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const filename = `${url.replace(/[:/]/g, '_')}_${timestamp}.txt`;
  fs.writeFileSync(filepath, content);
  await browser.close();
}

main();
