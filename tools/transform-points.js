import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { transformations } from '../transformations/transformations.js';

const __dirname = path.resolve();

export const transformAllFiles = async () => {

	// transformed-xyzのディレクトリが存在しない場合は作成
	const transformedXyzDir = path.join(__dirname, './transformed-xyz');
	if (!fs.existsSync(transformedXyzDir)) {
		fs.mkdirSync(transformedXyzDir, { recursive: true });
	}

	// transformationsオブジェクトの各変換行列に対してファイルを変換
	for (const [key, matrix] of Object.entries(transformations)) {
		const inputPath = path.join(__dirname, './raw-xyz', `${key}`);
		const outputPath = path.join(__dirname, './transformed-xyz', `${key}`);
		await transformPoints(inputPath, outputPath, matrix);
	}
}

export const transformPoints = async (inputPath, outputPath, transformationMatrix) => {
	// 入力ファイルを行ごとに読み込むStreamを作成
	const inputStream = fs.createReadStream(inputPath, { encoding: 'utf8' });
	// 出力ファイルに書き込むStreamを作成
	const outputStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

	const rl = readline.createInterface({
		input: inputStream,
		output: outputStream,
		terminal: false
	});

	return new Promise((resolve, reject) => {
		rl.on('line', (line) => {
			const parts = line.split(' ');
			if (parts.length == 6) {
				const x = parseFloat(parts[0]);
				const y = parseFloat(parts[1]);
				const z = parseFloat(parts[2]);
				// 行列を使用して座標を変換
				const transformedX = transformationMatrix[0][0] * x + transformationMatrix[0][1] * y + transformationMatrix[0][2] * z + transformationMatrix[0][3];
				const transformedY = transformationMatrix[1][0] * x + transformationMatrix[1][1] * y + transformationMatrix[1][2] * z + transformationMatrix[1][3];
				const transformedZ = transformationMatrix[2][0] * x + transformationMatrix[2][1] * y + transformationMatrix[2][2] * z + transformationMatrix[2][3];
				outputStream.write(`${transformedX} ${transformedY} ${transformedZ} ${parts[3]} ${parts[4]} ${parts[5]}\n`);
			} else {
				outputStream.write(`${line}\n`);
			}
		});
		rl.on('close', () => {
			outputStream.end();
			resolve();
		});
		inputStream.on('error', (err) => {
			console.error(`Error reading file: ${err.message}`);
			resolve(); // Resolve even on read error to avoid hanging
		});
		outputStream.on('error', (err) => {
			console.error(`Error writing file: ${err.message}`);
			resolve(); // Resolve even on write error to avoid hanging
		});
	});
};