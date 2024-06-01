/**
 * 首先创建一个MD5 Hash实例，
 * 然后读取目录md5-sum下的所有文件。
 * 对于每个文件，读取文件内容并将内容更新进Hash实例中。遍历完所有文件后，计算并打印出整个目录的MD5 Hash
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const hash = crypto.createHash('md5');
const dir = './crypto/md5-sum';

fs.readdir(dir, (err, files) => {
  if(err) {
    console.error(`读取目录失败: ${err}`);
    return;
  }
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const fileContent = fs.readFileSync(filePath);
    hash.update(fileContent);
  });
  const digest = hash.digest('hex');
  console.log(`整个目录的MD5 Hash值为: ${digest}`);
});