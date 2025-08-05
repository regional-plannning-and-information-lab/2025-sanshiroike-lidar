import { downloadXyzFiles, convertXyzToLas } from "./tools/setup.js";
import { runPotreeConverter } from "./tools/convert-to-potree.js";
import { connectXyzFiles } from "./tools/connect-xyz-files.js";
import { transformAllFiles } from "./tools/transform-points.js";
import path from 'path';
import fs from 'fs';

const __dirname = path.resolve(); // package.jsonのディレクトリを基準にするため

// XYZファイルをダウンロードする
console.log("🌐 XYZファイルをダウンロードしています...");
await downloadXyzFiles(false);
console.log("✅ ダウンロード完了！");

// 補正前のXYZファイルを結合して、 raw-connected/combined.xyzに書き出す
console.log("\n🔁補正前のXYZファイルを結合し、LASファイルに変換しています...");
await connectXyzFiles(path.resolve(__dirname, "./raw-xyz"), path.resolve(__dirname, "./raw-connected/combined.xyz"));
await convertXyzToLas(path.resolve(__dirname, "./raw-connected/combined.xyz"), path.resolve(__dirname, "./raw-las/combined.las"));

// PotreeConverterを実行する
console.log("🔁LASファイルをPotreeConverterで変換しています...");
await runPotreeConverter(path.resolve(__dirname, "./raw-las/combined.las"), path.resolve(__dirname, "./potree-files/raw-combined"));
console.log("🌲 補正前のファイルをPotreeConverterで変換しました！");

// XYZファイルを補正する
console.log("\n🧑‍🔧 測量で得られた座標をもとにXYZファイルを補正しています...");
await transformAllFiles();
console.log("✅ 測量で得られた座標をもとにXYZファイルを補正しました！");

// 補正後のXYZファイルを結合して、 transformed-connected/combined.xyzに書き出す
console.log("\n🔁補正後のXYZファイルを結合し、LASファイルに変換しています...");
await connectXyzFiles(path.resolve(__dirname, "./transformed-xyz"), path.resolve(__dirname, "./transformed-connected/combined.xyz"));
await convertXyzToLas(path.resolve(__dirname, "./transformed-connected/combined.xyz"), path.resolve(__dirname, "./transformed-las/combined.las"));

// PotreeConverterを実行する
console.log("🔁補正後のLASファイルをPotreeConverterで変換しています...");
await runPotreeConverter(path.resolve(__dirname, "./transformed-las/combined.las"), path.resolve(__dirname, "./potree-files/transformed-combined"));
console.log("🌲 補正後のファイルをPotreeConverterで変換しました！");

// 完了メッセージを表示する
console.log("\n🎉 すべての処理が完了しました！");