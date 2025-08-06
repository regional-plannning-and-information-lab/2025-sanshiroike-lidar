"use strict";

import fs from "fs";
import path from "path";
import downloadFile from "./download-file.js";
const __dirname = path.resolve(); // package.jsonのディレクトリを基準にするための設定
import { spawn } from "child_process";

const files = [
	"1-5.xyz",
	"13-16.xyz",
	"16-18.xyz",
	"18-21.xyz",
	"22-1.xyz",
	"4-6.xyz",
	"6-7.xyz",
	"7-9.xyz",
	"9-11.xyz",
	"9-13.xyz",
	"result1.xyz",
	"result2.xyz",
	"result3.xyz",
	"result4.xyz",
	"result5.xyz"
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
		"https://github.com/regional-plannning-and-information-lab/2025-sanshiroike-lidar/releases/download/v2.0/";

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

export const convertXyzToLas = async (inputFilePath, outputFilePath) => {
	// pdal-pipelines ディレクトリが存在しないときは作成する
	if (!fs.existsSync(pdalPipelineDir)) {
		fs.mkdirSync(pdalPipelineDir, { recursive: true });
	} else {
		// 既存のパイプラインファイルを削除する
		const existingFiles = fs.readdirSync(pdalPipelineDir);
		existingFiles.forEach((file) => {
			const filePath = path.join(pdalPipelineDir, file);
			fs.unlinkSync(filePath);
		});
	}

	// outputFilePathのディレクトリが存在しないときは作成する
	if (!fs.existsSync(path.dirname(outputFilePath))) {
		fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
	}

	// PDALパイプラインのJSONファイルを作成する
	const pipelineFilePath = path.join(pdalPipelineDir, `pipeline.json`);

	const pipelineContent = {
		pipeline: [
			{
				type: "readers.text",
				filename: inputFilePath,
				header: "Y X Z Red Green Blue",
			},
			{
				type: "filters.reprojection",
				in_srs: "EPSG:6677",
				out_srs: "EPSG:6677",
			},
			{
				type: "writers.las",
				filename: outputFilePath,
				scale_x: 0.001,
				scale_y: 0.001,
				scale_z: 0.001,
				offset_x: "auto",
				offset_y: "auto",
				offset_z: "auto",
			},
		],
	};
	fs.writeFileSync(pipelineFilePath, JSON.stringify(pipelineContent, null, 2));

	// PDALの実行
	await new Promise((resolve) => {
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
				console.log(`PDAL processing completed for ${outputFilePath}`);
			} else {
				console.error(`PDAL process exited with code ${code}`);
			}
			resolve(); // 処理が完了しても、失敗しても resolveし、次の処理を継続
		});
	});
};
