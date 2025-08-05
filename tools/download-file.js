import https from 'https';
import fs from 'fs';
import path from 'path';
import urlModule from 'url';

function downloadFile(url, destPath) {

	return new Promise((resolve, reject) => {
		const request = https.get(url, (response) => {
			// 3xx系のステータスコードをチェック
			if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
				// リダイレクト先URLを解決
				const redirectUrl = urlModule.resolve(url, response.headers.location);
				// console.log(`リダイレクト: ${url} -> ${redirectUrl}`);
				// 再帰的にダウンロード関数を呼び出す
				return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
			}

			// 200 OK でない場合はエラー
			if (response.statusCode !== 200) {
				reject(new Error(`HTTPエラー: ${response.statusCode}`));
				return;
			}

			// console.log(`Downloading: ${url} to ${destPath}`);

			const file = fs.createWriteStream(destPath);
			response.pipe(file);

			file.on('finish', () => {
				file.close(resolve);
			});
		}).on('error', (err) => {
			fs.unlink(destPath, () => { });
			reject(err);
		});
	});
}

export default downloadFile;