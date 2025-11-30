import * as XLSX from "xlsx";

export async function loadExcelFromPublic(path = "/data/nav.xlsx") {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();

    // read the workbook
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // use the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // convert to JSON
    const rows = XLSX.utils.sheet_to_json(sheet);

    return rows; // array of objects by column names
}
