import spawn from 'child_process';

const potreeConverterPath = "/usr/local/bin/PotreeConverter";

export const convertToPotree = async (overwrite) => {

	// potree-files ディレクトリが存在しないときは作成する
	const potreeFilesDir = path.join(__dirname, "potree-files");
	if (!fs.existsSync(potreeFilesDir)) {
		fs.mkdirSync(potreeFilesDir, { recursive: true });
	}

	// raw-las ディレクトリ内のすべてのファイルを取得
	const files = fs.readdirSync(rawLasDir).filter(file => file.endsWith('.las'));

	// 各ファイルをPotree形式に変換（全ての変換が終わるまで待つ）
	const tasks = files.map(file => {
		const inputPath = path.join(rawLasDir, file);
		const outputDir = path.join(potreeFilesDir, path.basename(file, '.las'));

		if (!fs.existsSync(outputDir) || overwrite) {
			return runPotreeConverter(inputPath, outputDir);
		} else {
			console.log(`Skipping conversion for ${file}, already exists.`);
			return Promise.resolve();
		}
	});

	await Promise.all(tasks);

}

const runPotreeConverter = async (inputPath, outputDir) => {
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