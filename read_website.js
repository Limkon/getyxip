const puppeteer = require('puppeteer');
const moment = require('moment');
const fs = require('fs');

async function main() {
  const filepath = process.argv[2];
  const browser = await puppeteer.launch({ headless: "new" });

  try {
    const urls = fs.readFileSync(filepath, 'utf8').split('\n').filter(Boolean);

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const page = await browser.newPage();
        await page.goto(url);
        const content = await page.content();
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const filename = `${url.replace(/[:/]/g, '_')}_${timestamp}.txt`;
        fs.writeFileSync(filename, content);
        console.log(`Successfully crawled ${url}`);
      } catch (error) {
        console.log(`Failed to crawl ${url}: ${error.message}`);
        continue; // Skip to the next iteration
      } finally {
        if (page) {
          await page.close();
        }
      }
    }
  } catch (error) {
    console.log(`Failed to read file: ${error.message}`);
  } finally {
    await browser.close();
  }
}

main();
