"use strict";

import fs from "fs";
import path from "path";
import downloadFile from "./download-file.js";
const __dirname = path.resolve(); // package.jsonのディレクトリを基準にするための設定
import { spawn } from "child_process";
import { confirm, select } from "@inquirer/prompts";

const files = [
	"2DF732B8-F74C-4F4D-B235-7510C27FDA22.xyz",
	"3CA7D827-0547-4E9E-B197-8D03DA7BBC7B.xyz",
	"7EB77F70-5529-42A2-BE63-A07C0C623F97.xyz",
	"6786A3EA-246D-45AC-A520-7BE0BC2325D7.xyz",
	"256519D7-B9A1-40D4-B1DA-EB419A545A96.xyz",
	"9618444F-4D68-4294-895D-F201B666A12D.xyz",
	"69983025-8968-428D-826F-839CC1E5CCC6.xyz",
	"A79CBACA-D14A-45A9-BC84-1BCC18D8DA96.xyz",
	"E425358B-0817-4484-9EF1-63B8EE0F3A3B.xyz",
	"FFF4D8D2-BDB1-40C5-8264-08556BC032BE.xyz",
];

const rawXyzDir = path.join(__dirname, "raw-xyz");
const pdalPipelineDir = path.join(__dirname, "pdal-pipelines");
const rawLasDir = path.join(__dirname, "raw-las");

export const downloadXyzFiles = async (overwrite) => {

	console.log("Downloading XYZ files...");

	// raw-xyz ディレクトリが存在しないときは作成する
	if (!fs.existsSync(rawXyzDir)) {
		fs.mkdirSync(rawXyzDir, { recursive: true });
	}

	// raw-xyz ディレクトリにファイルをダウンロードする
	const downloadRepo =
		"https://github.com/regional-plannning-and-information-lab/2025-sanshiroike-lidar/releases/download/v1.0.0/";

	// すべてのダウンロードPromiseを作成
	const downloadPromises = files.map(async (file) => {
		const filePath = path.join(rawXyzDir, file);
		if (!fs.existsSync(filePath) || overwrite) {
			const fileUrl = downloadRepo + file;
			try {
				await downloadFile(fileUrl, filePath);
				console.log(`Downloaded: ${file} to ${filePath}`);
			} catch (error) {
				console.error(`Error downloading ${file}:`, error);
			}
		}
	});

	// すべてのダウンロードが終了したらresolve
	await Promise.all(downloadPromises);
};

export const convertXyzToLas = async (overwrite) => {
	// pdal-pipelines ディレクトリが存在しないときは作成する
	if (!fs.existsSync(pdalPipelineDir)) {
		fs.mkdirSync(pdalPipelineDir, { recursive: true });
	}

	// PDALパイプラインのJSONファイルを作成する
	files.forEach((file) => {
		const fileNameWithoutExt = path.basename(file, path.extname(file));
		const pipelineFilePath = path.join(
			pdalPipelineDir,
			`${fileNameWithoutExt}-pipeline.json`
		);
		if (!fs.existsSync(pipelineFilePath) || overwrite) {
			const pipelineContent = {
				pipeline: [
					{
						type: "readers.text",
						filename: path.join(rawXyzDir, file),
						header: "Y X Z Red Green Blue",
					},
					{
						type: "filters.reprojection",
						in_srs: "EPSG:6677",
						out_srs: "EPSG:6677",
					},
					{
						type: "writers.las",
						filename: path.join(
							__dirname,
							"raw-las",
							`${fileNameWithoutExt}.las`
						),
						scale_x: 0.001,
						scale_y: 0.001,
						scale_z: 0.001,
						offset_x: "auto",
						offset_y: "auto",
						offset_z: "auto",
					},
				],
			};
			fs.writeFileSync(
				pipelineFilePath,
				JSON.stringify(pipelineContent, null, 2)
			);
			console.log(`Created PDAL pipeline file: ${pipelineFilePath}`);
		} else {
			console.log(`PDAL pipeline file already exists: ${pipelineFilePath}`);
		}
	});

	// raw-las ディレクトリが存在しないときは作成する
	if (!fs.existsSync(rawLasDir)) {
		fs.mkdirSync(rawLasDir, { recursive: true });
	}

	// PDALの実行
	await Promise.all(
		files.map((file) => {
			return new Promise((resolve, reject) => {
				const fileNameWithoutExt = path.basename(file, path.extname(file));
				const pipelineFilePath = path.join(
					pdalPipelineDir,
					`${fileNameWithoutExt}-pipeline.json`
				);

				if (fs.existsSync(pipelineFilePath)) {
					const pdalCommand = `pdal pipeline ${pipelineFilePath}`;
					const pdalProcess = spawn(pdalCommand, { shell: true });

					pdalProcess.stdout.on("data", (data) => {
						console.log(`stdout: ${data}`);
					});

					pdalProcess.stderr.on("data", (data) => {
						console.error(`stderr: ${data}`);
					});

					pdalProcess.on("close", (code) => {
						if (code === 0) {
							console.log(
								`PDAL processing completed for ${fileNameWithoutExt}.las`
							);
							resolve();
						} else {
							console.error(`PDAL process exited with code ${code}`);
							resolve(); // エラーが発生しても処理を継続する
						}
					});
				} else {
					console.error(`Pipeline file does not exist: ${pipelineFilePath}`);
					resolve(); // 存在しない場合も処理継続
				}
			});
		})
	);
};
