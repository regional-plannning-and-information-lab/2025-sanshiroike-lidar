import path from 'path';
import fs from 'fs';

const __dirname = path.resolve(); // package.jsonのディレクトリを基準にするため

// 補正前のPotreeファイルのディレクトリ
const rawPotreeSourceDir = path.resolve(__dirname, './potree-files/raw-combined');
const rawPotreeDir = path.resolve(__dirname, './viewer/pointclouds/sanshiroike-raw');

// 補正後のPotreeファイルのディレクトリ
const transformedPotreeSourceDir = path.resolve(__dirname, './potree-files/transformed-combined');
const transformedPotreeDir = path.resolve(__dirname, './viewer/pointclouds/sanshiroike-transformed');

// ビューワーのHTMLファイルを生成するディレクトリ
const htmlDir = path.resolve(__dirname, './viewer/examples/');

export const exportToPotreeViewer = async () => {

	// ディレクトリがなければ作成
	if (!fs.existsSync(rawPotreeDir)) {
		fs.mkdirSync(rawPotreeDir, { recursive: true });
	}
	if (!fs.existsSync(transformedPotreeDir)) {
		fs.mkdirSync(transformedPotreeDir, { recursive: true });
	}

	// rawPotreeSourceDirからrawPotreeDirへファイルをコピー
	const rawFiles = fs.readdirSync(rawPotreeSourceDir);
	for (const file of rawFiles) {
		const sourceFilePath = path.join(rawPotreeSourceDir, file);
		const destFilePath = path.join(rawPotreeDir, file);
		fs.copyFileSync(sourceFilePath, destFilePath);
	}

	// transformedPotreeSourceDirからtransformedPotreeDirへファイルをコピー
	const transformedFiles = fs.readdirSync(transformedPotreeSourceDir);
	for (const file of transformedFiles) {
		const sourceFilePath = path.join(transformedPotreeSourceDir, file);
		const destFilePath = path.join(transformedPotreeDir, file);
		fs.copyFileSync(sourceFilePath, destFilePath);
	}

	// HTMLファイルを作成
	["raw", "transformed"].forEach((type) => {
		const htmlContent = `<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8" /> <meta name="description" content="" /> <meta name="author" content="" /> <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" /> <title>Potree Viewer</title>  <link rel="stylesheet" type="text/css" href="../build/potree/potree.css" /> <link rel="stylesheet" type="text/css" href="../libs/jquery-ui/jquery-ui.min.css" /> <link rel="stylesheet" type="text/css" href="../libs/openlayers3/ol.css" /> <link rel="stylesheet" type="text/css" href="../libs/spectrum/spectrum.css" /> <link rel="stylesheet" type="text/css" href="../libs/jstree/themes/mixed/style.css" /> </head>  <body> <script src="../libs/jquery/jquery-3.1.1.min.js"></script> <script src="../libs/spectrum/spectrum.js"></script> <script src="../libs/jquery-ui/jquery-ui.min.js"></script>  <script src="../libs/other/BinaryHeap.js"></script> <script src="../libs/tween/tween.min.js"></script> <script src="../libs/d3/d3.js"></script> <script src="../libs/proj4/proj4.js"></script> <script src="../libs/openlayers3/ol.js"></script> <script src="../libs/i18next/i18next.js"></script> <script src="../libs/jstree/jstree.js"></script> <script src="../build/potree/potree.js"></script> <script src="../libs/plasio/js/laslaz.js"></script>   <div class="potree_container" style="position: absolute; width: 100%; height: 100%; left: 0px; top: 0px" > <div id="potree_render_area" style=" background-image: url('../build/potree/resources/images/background.jpg'); " ></div> <div id="potree_sidebar_container"></div> </div>  <script type="module"> window.viewer = new Potree.Viewer( document.getElementById("potree_render_area") );  viewer.setEDLEnabled(false); viewer.setFOV(60); viewer.setPointBudget(1_000_000); viewer.loadSettingsFromURL(); viewer.setBackground("skybox");  viewer.setDescription( "LRTKとiPadを用いた三四郎池のレーザ点群データ${type == "raw" ? "補正前" : "補正後"}。" );  viewer.loadGUI(() => { viewer.setLanguage("en"); $("#menu_tools").next().show(); $("#menu_clipping").next().show(); viewer.toggleSidebar(); }); let url = "../pointclouds/sanshiroike-${type}/metadata.json"; Potree.loadPointCloud(url).then((e) => { let pointcloud = e.pointcloud; let material = pointcloud.material;  material.activeAttributeName = "rgba"; material.minSize = 2; material.pointSizeType = Potree.PointSizeType.ADAPTIVE;  viewer.scene.addPointCloud(pointcloud); viewer.fitToScreen(); }); </script> </body> </html> `;
		const htmlFilePath = path.join(htmlDir, `sanshiroike-${type}.html`);
		fs.writeFileSync(htmlFilePath, htmlContent);
	});

};