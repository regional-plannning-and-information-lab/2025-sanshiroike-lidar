# 2025-sanshiroike-lidar

## 必要な環境

- Docker がインストールされていること

## 事前準備

### 点群データをGitHubにアップロード

✅ https://github.com/regional-plannning-and-information-lab/2025-sanshiroike-lidar/releases/tag/v2.0 にアップロード済

### 変換行列を設定

`2025-sanshiroike-lidar/transformations/transformations.js` にある変換行列を書き換えてください。

- ダウンロードしたXYZファイルそのままの、XYZをYXZに入れ替える前（すなわち左手系）に対して変換行列をかけているので、もしかしたらその点を考慮する必要があるかもしれないです
- 補正に使う座標も右手系なので、普通に変換できる気もしますが

## 立ち上げ

プロジェクトホームで、

```bash
docker build -t docker-sanshiroike-1 --progress=plain .
```

このコマンドを実行すると、

1. GitHubからXYZファイルのダウンロード
2. 補正前のXYZファイルを、LASファイルを経由して、Potree形式への変換
3. あらかじめ定めておいた変換行列に基づいて、XYZファイルを補正
4. 補正後のXYZファイルを、LASファイルを経由して、Potree形式への変換
5. 生成したファイルを、ビューワーが参照できる場所にコピー

というステップを経て、Dockerコンテナが作成されます。（コンテナ作成にはかなり時間がかかります。）

続いて、

```bash
docker run -it -p 1234:1234 docker-sanshiroike-1
```

を実行すると、ローカルサーバーが立ち上がり、ビューワーソフトを開けるようになります。

http://localhost:1234/examples/ の中に、 `sanshiroike-raw.html` と `sanshiroike-transformed.html` が表示されているはずです。