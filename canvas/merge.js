const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 定义目录路径
const directoryPath = './merge'; // 替换为您的目录路径

// 创建一个新的 Canvas 实例
async function compositeImages() {
    // 读取目录下的所有文件
    const fileNames = fs.readdirSync(directoryPath);
    
    // 过滤出图片文件
    const imagePaths = fileNames.filter(fileName => {
        const ext = path.extname(fileName).toLowerCase();
        return ext === '.jpg' || ext === '.png' || ext === '.jpeg';
    }).map(fileName => path.join(directoryPath, fileName));

    // 加载所有图片并获取它们的宽度和高度
    const images = await Promise.all(imagePaths.map(async (path) => {
        const image = await loadImage(path);
        return { image, width: image.width, height: image.height };
    }));

    // 计算合成后的图片尺寸（总宽度为所有图片宽度之和，总高度为所有图片中最高的高度）
    const maxWidth = Math.max(...images.map(img => img.width));
    const totalHeight = images.reduce((acc, img) => acc + img.height, 0);

    // 创建合成后的 Canvas
    const canvas = createCanvas(maxWidth, totalHeight);
    const ctx = canvas.getContext('2d');

    // 当前图片在合成图片中的纵向偏移
    let offsetY = 0;

    // 在合成图片上绘制所有图片
    images.forEach(imgObj => {
        // 绘制当前图片
        ctx.drawImage(imgObj.image, 0, offsetY);
        // 更新纵向偏移
        offsetY += imgObj.height;
    });

    // 将合成后的图片保存到文件，使用哈希值作为文件名
    const hash = crypto.createHash('md5').update(await getImageData(imagePaths)).digest('hex');
    const out = fs.createWriteStream(path.join('./merge-res', `${hash}.jpg`));
    const stream = canvas.createJPEGStream({ quality: 1 });
    stream.pipe(out);
    out.on('finish', () => console.log('The composite image was saved successfully.'));
}

// 读取图片内容并返回哈希值
async function getImageData(paths) {
    const buffers = await Promise.all(paths.map(async (path) => {
        return fs.promises.readFile(path);
    }));
    const data = Buffer.concat(buffers);
    return data;
}

compositeImages();
