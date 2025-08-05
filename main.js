import { downloadXyzFiles, convertXyzToLas } from "./tools/setup.js";
import { runPotreeConverter } from "./tools/potree.js";
import { confirm, select } from '@inquirer/prompts';

// XYZファイルをダウンロードする
const overwriteXyzFiles = await select({
	message: "📁 XYZファイルをダウンロードします。",
	choices: [
		{ name: "既存のファイルがあっても上書きする", value: true },
		{ name: "既存のファイルがあればスキップする", value: false }
	],
	default: false
});
await downloadXyzFiles(overwriteXyzFiles);

// XYZファイルをLAS形式に変換する
const overwriteLasFiles = await select({
	message: "\n⚙️ XYZファイルをLAS形式に変換します。",
	choices: [
		{ name: "既存のファイルがあっても上書きする", value: true },
		{ name: "既存のファイルがあればスキップする", value: false }
	],
	default: true
});
await convertXyzToLas(overwriteLasFiles);

// PotreeConverterを実行する
const overwritePotreeFiles = await select({
	message: "\n🚀 PotreeConverterを実行します。",
	choices: [
		{ name: "既存のファイルがあっても上書きする", value: true },
		{ name: "既存のファイルがあればスキップする", value: false }
	],
	default: true
});
await runPotreeConverter(overwritePotreeFiles);

// 完了メッセージを表示する
await confirm({
	message: "\n🎉 すべての処理が完了しました！",
	default: true
});