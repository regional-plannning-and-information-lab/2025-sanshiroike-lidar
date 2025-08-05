import { downloadXyzFiles, convertXyzToLas } from "./tools/setup";
import { confirm, select } from '@inquirer/prompts';

const overwriteXyzFiles = await select({
	message: "📁 XYZファイルをダウンロードします。",
	choices: [
		{ name: "既存のファイルがあっても上書きする", value: true },
		{ name: "既存のファイルがあればスキップする", value: false }
	],
	default: false
});
await downloadXyzFiles(overwriteXyzFiles);

const overwriteLasFiles = await select({
	message: "\n⚙️ XYZファイルをLAS形式に変換します。",
	choices: [
		{ name: "既存のファイルがあっても上書きする", value: true },
		{ name: "既存のファイルがあればスキップする", value: false }
	],
	default: false
});
await convertXyzToLas(overwriteLasFiles);