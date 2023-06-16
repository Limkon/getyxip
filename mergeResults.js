const fs = require('fs');
const path = require('path');
const moment = require('moment');

// 获取 data 目录下的所有文件
const dataDir = 'data';
const files = fs.readdirSync(dataDir);

// 存储每个网址的结果内容
const results = {};

// 遍历文件
for (const file of files) {
  // 解析文件名，获取网址和日期
  const [url, _, date] = file.split('_');

  // 构建结果文件名
  const resultFileName = `${url}_result`;

  // 读取文件内容
  const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');

  // 去除空白行
  const nonEmptyLines = content.split('\n').filter(line => line.trim() !== '');

  // 合并内容到对应网址的结果，去除重复内容和空白行
  if (results[url]) {
    const uniqueLines = nonEmptyLines.filter(line => !results[url].includes(line));
    results[url] += '\n' + uniqueLines.join('\n');
  } else {
    results[url] = nonEmptyLines.join('\n');
  }

  // 删除原始文件
  fs.unlinkSync(path.join(dataDir, file));

  console.log(`合并 ${file} 到 ${resultFileName}`);
}

// 保存合并结果到文件
for (const url in results) {
  const dateToday = moment().format('YYYY-MM-DD');
  const resultFilePath = path.join('result', `${url}_result_${dateToday}.txt`); // 修改保存路径为 "result" 目录下，并加上网址和当前日期
  fs.writeFileSync(resultFilePath, results[url]);

  console.log(`保存合并结果到 ${resultFilePath}`);
}
