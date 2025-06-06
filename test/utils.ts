import Decimal from "decimal.js";
import XLSX from "xlsx";
import { ABValue } from "../src";

export type Round = {
  label?: string;
  prices: ABValue;
  prevPrices: ABValue;
  tokenWeights: ABValue;
  exponentPrice: Decimal;
};

export function writeIndexPricesToExcel(
  rounds: Round[],
  indexPrices: Decimal[],
  filename: string = "index_prices.xlsx"
): void {
  let maxPercentDelta = new Decimal(0);
  let minPercentDelta = new Decimal(0);
  let maxPercentDeltaRound = 0;
  let minPercentDeltaRound = 0;

  const tableData: (string | number)[][] = [
    [
      "Round",
      "Trump",
      "Doge",
      "Trump/Doge",
      "IndexPrice",
      "ChargeValues",
      "ChargeValues(%)",
    ],
  ];

  for (let i = 0; i < rounds.length; i++) {
    const trump = rounds[i].prices.A;
    const doge = rounds[i].prices.B;
    const ratio = trump.div(doge);

    const currentIndexPrice = indexPrices[i + 1];
    const prevIndexPrice = indexPrices[i];

    const delta = currentIndexPrice.sub(prevIndexPrice);
    const percentDelta = prevIndexPrice.isZero()
      ? new Decimal(0)
      : delta.div(prevIndexPrice).mul(100);

    if (percentDelta.gt(maxPercentDelta)) {
      maxPercentDelta = percentDelta;
      maxPercentDeltaRound = i + 1;
    }
    if (percentDelta.lt(minPercentDelta)) {
      minPercentDelta = percentDelta;
      minPercentDeltaRound = i + 1;
    }

    tableData.push([
      i + 1,
      trump.toFixed(6),
      doge.toFixed(6),
      ratio.toFixed(6),
      currentIndexPrice.toFixed(7),
      delta.toFixed(6),
      percentDelta.toFixed(2) + "%",
    ]);
  }

  const maxFluctuation = maxPercentDelta.add(minPercentDelta.abs());

  // Summary
  const summaryData: (string | number)[][] = [
    ["Summary"],
    ["Metric", "Value"],
    [
      "Max Increase",
      `Round ${maxPercentDeltaRound} (${maxPercentDelta.toFixed(4)}%)`,
    ],
    [
      "Max Decrease",
      `Round ${minPercentDeltaRound} (${minPercentDelta.toFixed(4)}%)`,
    ],
    ["Max Fluctuation", `${maxFluctuation.toFixed(4)}%`],
    [],
  ];

  const allData = [...summaryData, ...tableData];

  const worksheet = XLSX.utils.aoa_to_sheet(allData);

  const colWidths = [
    { wch: 8 }, // Round
    { wch: 12 }, // Trump
    { wch: 12 }, // Doge
    { wch: 14 }, // Trump/Doge
    { wch: 14 }, // IndexPrice
    { wch: 14 }, // ChargeValues
    { wch: 16 }, // ChargeValues(%)
  ];

  worksheet["!cols"] = colWidths;

  worksheet["!freeze"] = { xSplit: 0, ySplit: summaryData.length + 1 };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "IndexPrices");

  XLSX.writeFile(workbook, filename);

  console.log(`✅ Excel file written: ${filename}`);
}
