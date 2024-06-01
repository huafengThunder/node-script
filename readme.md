#### 不要把输出文件和目标文件上传了
- canvas 操作图片
    - 指令 node canvas/merge.js
        - merge.js 将merge目录下图片合并到merge-res
    - 指令 node canvas/translate.js
        - translate.js 将translate目录下图片合并到translate-res
- crypto 加密相关的操作
    - 使用md5
        - 指令 node crypto/md5.js 遍历完md5-sum下的所有文件后，计算并打印出整个目录的MD5 Hash