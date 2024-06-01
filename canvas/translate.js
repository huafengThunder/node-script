const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// 定义输入和输出图片文件夹路径
const inputDirectoryPath = './canvas/translate';
const outputDirectoryPath = './canvas/translate-res';

// 创建一个新的 Canvas 实例并旋转图片
async function rotateImages() {
    // 读取输入目录下的所有文件
    const fileNames = fs.readdirSync(inputDirectoryPath);

    // 过滤出图片文件
    const imagePaths = fileNames.filter(fileName => {
        const ext = path.extname(fileName).toLowerCase();
        return ext === '.jpg' || ext === '.png' || ext === '.jpeg';
    }).map(fileName => path.join(inputDirectoryPath, fileName));

    // 遍历所有图片并旋转
    for (const imagePath of imagePaths) {
        await rotateAndSaveImage(imagePath);
    }

    console.log('All images rotated and saved successfully.');
}

// 旋转单张图片并保存到输出目录
async function rotateAndSaveImage(inputImagePath) {
    // 加载图片
    const image = await loadImage(inputImagePath);

    // 创建与图片尺寸相匹配的 Canvas（交换宽度和高度）
    const canvas = createCanvas(image.height, image.width);
    const ctx = canvas.getContext('2d');

    // 将图片中心设置为旋转中心
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // 旋转角度（以弧度表示）
    const angleInRadians = -Math.PI * 2 / 4; // -90 度

    // 在旋转前保存当前状态
    ctx.save();

    // 旋转图片
    ctx.rotate(angleInRadians);

    // 绘制图片（在旋转后绘制）
    ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);

    // 恢复到旋转前的状态
    ctx.restore();

    // 构建输出路径
    const outputFileName = path.basename(inputImagePath);
    const outputImagePath = path.join(outputDirectoryPath, outputFileName);

    // 保存旋转后的图片到输出文件路径
    const out = fs.createWriteStream(outputImagePath);
    const stream = canvas.createJPEGStream({ quality: 1 });
    stream.pipe(out);

    // 等待流写入完成
    await new Promise((resolve, reject) => {
        out.on('finish', resolve);
        out.on('error', reject);
    });

    console.log(`Image ${inputImagePath} rotated and saved to ${outputImagePath} successfully.`);
}

rotateImages();
