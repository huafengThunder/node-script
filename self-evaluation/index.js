const { readFileSync, writeFileSync } = require("fs");
const _ = require("lodash");
const XLSX = require("xlsx");

// 读取 JSON 文件并解析内容
function readJsonFile(path) {
  try {
    const res = readFileSync(path, "utf8");
    const data = JSON.parse(res);
    if (data.tasks) {
      console.log(`找到 ${data.tasks.length} 个任务`);
    }
    return data;
  } catch (err) {
    console.error("读取文件时出错:", err.message);
    if (err.code === "ENOENT") {
      console.error("错误：未找到 origin.json 文件，请确保文件存在");
    } else if (err.name === "SyntaxError") {
      console.error("错误：JSON 格式无效，请检查文件内容");
    }
    throw err; // 让调用者处理异常
  }
}

// 将数据写入 JSON 文件
function writeJsonFile(path, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    writeFileSync(path, jsonString, "utf8");
    console.log(`已成功写入文件: ${path}`);
  } catch (err) {
    console.error("写入文件时出错:", err.message);
    throw err;
  }
}

// 处理数据并导出为 Excel
function processAndExportData() {
  try {
    // 读取原始数据
    const json = readJsonFile("self-evaluation/origin.json");
    // 验证 JSON 数据是否为空
    if (!json || (Array.isArray(json) && json.length === 0)) {
      console.error("\x1b[31m%s\x1b[0m", "origin.json为空，请先复制好");
      return;
    }

    const filterField = _.map(json, (item) =>
      _.pick(item, [
        "issueType",
        "issueKey",
        "issueName",
        "issueUrl",
        "timeSpent",
        "registerDate",
      ])
    );
    // 过滤不需要的 issueType
    const filters = filterField.filter(
      (i) =>
        !["缺陷", "会议沟通子任务"].includes(i.issueType) &&
        i.issueName !== "需求评审"
    );

    // 按 issueName 去重
    const uniqueByName = _.uniqBy(filters, "issueName");

    // 按 projectType 和 issueName 排序
    const sortedData = _.orderBy(
      uniqueByName,
      ["projectType", "issueName"],
      ["asc", "asc"]
    );

    console.log("过滤后的任务数量:", sortedData.length);

    // 保存中间结果
    writeJsonFile("self-evaluation/filtered_tasks.json", sortedData);

    // 导出为 Excel
    exportToExcel(sortedData);
  } catch (error) {
    console.error("处理过程中发生错误:", error);
  }
}

// 导出数据到 Excel
function exportToExcel(data) {
  try {
    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 设置列宽 - 使用对象格式确保兼容性
    worksheet["!cols"] = [
      { wch: 15 }, // A: issueType
      { wch: 12 }, // B: issueKey
      { wch: 120 }, // C: issueName - 大幅增加宽度以适应长文本
      { wch: 40 }, // D: issueUrl
      { wch: 10 }, // E: timeSpent
      { wch: 18 }, // F: registerDate
    ];

    // 创建工作簿并添加工作表
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "自我评价");

    // 写入文件 - 使用详细选项确保列宽生效
    XLSX.writeFile(workbook, "self-evaluation/自我评价.xlsx", {
      bookType: "xlsx",
      bookSST: false,
      type: "buffer",
      cellStyles: true, // 启用单元格样式支持
      sheetStubs: true, // 包含工作表存根
    });

    console.log("Excel 文件生成成功：自我评价.xlsx");
  } catch (error) {
    console.error("导出到 Excel 时出错:", error);
  }
}

// 执行主程序
processAndExportData();