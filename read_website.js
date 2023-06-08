const puppeteer = require('puppeteer');
const moment = require('moment');
const fs = require('fs');

async function crawlUrl(url, browser) {
  try {
    const page = await browser.newPage();
    await page.goto(url);
    const content = await page.content();
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const filename = `${url.replace(/[:/]/g, '_')}_${timestamp}.txt`;
    fs.writeFileSync(filename, content);
    console.log(`Successfully crawled ${url}`);
    await page.close();
  } catch (error) {
    console.log(`Failed to crawl ${url}: ${error.message}`);
  }
}

async function main() {
  const filepath = process.argv[2];
  const browser = await puppeteer.launch({ headless: "new" });

  try {
    const urls = fs.readFileSync(filepath, 'utf8').split('\n').filter(Boolean);

    async function processUrls(index) {
      if (index >= urls.length) {
        // Finished processing all urls
        await browser.close();
        return;
      }

      const url = urls[index];
      await crawlUrl(url, browser);

      // Process next url
      await processUrls(index + 1);
    }

    // Start processing urls
    await processUrls(0);
  } catch (error) {
    console.log(`Failed to read file: ${error.message}`);
    await browser.close();
  }
}

main();
