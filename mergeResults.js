const fs = require('fs');
const path = require('path');
const moment = require('moment');

// 获取 data 目录下的所有文件
const files = fs.readdirSync(path.join(__dirname, '..', 'data'));

// 存储每个网址的结果内容
const results = {};

// 遍历文件
for (const file of files) {
  // 解析文件名，获取网址和日期
  const [url, _, date] = file.split('_');
  
  // 构建结果文件名
  const resultFileName = `${url}_result_${date}`;
  
  // 读取文件内容
  const content = fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf-8');
  
  // 如果结果中已存在该网址的内容，则合并内容并去重
  if (results[url]) {
    const mergedContent = results[url] + '\n' + content;
    results[url] = Array.from(new Set(mergedContent.split('\n'))).join('\n');
  } else {
    results[url] = content;
  }
  
  // 删除原始文件
  fs.unlinkSync(path.join(__dirname, '..', 'data', file));
  
  // 保存合并结果到文件
  const dateToday = moment().format('YYYY-MM-DD');
  const resultFilePath = path.join(__dirname, '..', 'result', `${resultFileName}_${dateToday}.txt`); // 修改保存路径为 "result" 目录下，并加上当前日期
  fs.writeFileSync(resultFilePath, results[url]);
  
  console.log(`合并并保存 ${file} 到 ${resultFilePath}`);
}
