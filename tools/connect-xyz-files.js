import fs from "fs";
import path from "path";

/**
 * 指定されたルートフォルダ内のすべてのテキストファイルをストリームで結合し、新しいファイルにUTF-8で書き出します。
 * サブフォルダも再帰的に探索し、各ファイルの末尾の余分な改行を削除します。
 * @param {string} rootFolderPath 探索を開始するルートフォルダのパス
 * @param {string} outputFilePath 結合した内容を書き出すファイルのパス
 */
export const connectXyzFiles = async (rootFolderPath, outputFilePath) => {
	try {
		// ルートフォルダが存在するか確認
		if (!fs.existsSync(rootFolderPath)) {
			console.error(
				`エラー: 指定されたルートフォルダが見つかりません: ${rootFolderPath}`
			);
			return;
		}

		// 出力先のディレクトリが存在しない場合は作成
		const outputDir = path.dirname(outputFilePath);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		//  console.log(`ルートフォルダ '${rootFolderPath}' とそのサブフォルダ内のテキストファイルを探索し、UTF-8で結合中...`);

		// 出力用ストリームをUTF-8エンコーディングで作成
		const writeStream = fs.createWriteStream(outputFilePath, {
			encoding: "utf8",
		});

		const filesToCombine = [];

		/**
		 * 指定されたフォルダ内のテキストファイルを見つけ、filesToCombine配列に追加します。
		 * サブフォルダも再帰的に探索します。
		 * @param {string} currentPath 現在探索中のパス
		 */
		async function findTextFiles(currentPath) {
			const entries = await fs.promises.readdir(currentPath, {
				withFileTypes: true,
			});

			for (const entry of entries) {
				const fullPath = path.join(currentPath, entry.name);

				if (entry.isFile() && path.extname(entry.name) === ".xyz") {
					filesToCombine.push(fullPath);
				} else if (entry.isDirectory()) {
					await findTextFiles(fullPath);
				}
			}
		}

		await findTextFiles(rootFolderPath);

		if (filesToCombine.length === 0) {
			writeStream.end();
			return;
		}

		filesToCombine.sort(); // 結合順序を確定するため

		for (let i = 0; i < filesToCombine.length; i++) {
			const filePath = filesToCombine[i];
			const relativePath = path.relative(rootFolderPath, filePath);

			const fileContent = await new Promise((resolve, reject) => {
				const chunks = [];
				// ReadStreamもUTF-8エンコーディングで作成
				const readStream = fs.createReadStream(filePath, { encoding: "utf8" });

				readStream.on("data", (chunk) => {
					chunks.push(chunk);
				});

				readStream.on("end", () => {
					resolve(chunks.join("").trimEnd());
				});

				readStream.on("error", (err) => {
					console.error(
						`ファイル '${relativePath}' の読み込み中にエラーが発生しました:`,
						err
					);
					reject(err);
				});
			});

			// トリムされた内容をWriteStreamにUTF-8で書き込む
			writeStream.write(fileContent, "utf8");

			if (i < filesToCombine.length - 1) {
				writeStream.write("\n", "utf8"); // 改行もUTF-8で書き込む
			}
		}

		writeStream.end();
	} catch (error) {
		console.error("ファイルの結合中にエラーが発生しました:", error);
	}
};
