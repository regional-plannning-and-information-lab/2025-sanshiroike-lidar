import { spawn } from "child_process";
import path from 'path';
import fs from 'fs';

const potreeConverterPath = "/usr/local/bin/PotreeConverter";

export const runPotreeConverter = async (inputPath, outputDir) => {

	// outputDirが存在しない場合は作成する
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	const command = potreeConverterPath;
	const args = [
		inputPath,
		"-o", outputDir
	];
	const options = {
		stdio: 'inherit',
		shell: true
	};

	return new Promise((resolve, reject) => {
		const process = spawn(command, args, options);

		process.on('error', (error) => {
			console.error(`Error executing PotreeConverter: ${error.message}`);
			resolve(); // エラーが発生しても処理を継続する
		});

		process.on('exit', (code) => {
			if (code === 0) {
				console.log(`PotreeConverter completed successfully for ${inputPath}`);
				resolve();
			} else {
				console.error(`PotreeConverter exited with code ${code}`);
				resolve(); // エラーが発生しても処理を継続する
			}
		});
	});
};