# Ubuntu 22.04 LTS (長期サポート版) をベースイメージとして使用
FROM ubuntu:22.04 AS builder

# 環境変数を設定して、apt-getコマンドのインタラクティブな質問を回避
ENV DEBIAN_FRONTEND=noninteractive

# 必要なビルドツールと依存ライブラリをインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    libeigen3-dev \
    libboost-program-options-dev \
    libxml2-dev \
    pdal \
    libpdal-dev \
    libjsoncpp-dev \
    libsqlite3-dev \
    libbz2-dev \
    liblzma-dev \
    libzstd-dev \
    libcurl4-gnutls-dev \
    libxerces-c-dev \
    libtbb-dev \
		ca-certificates \
		curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Node.js のリポジトリを追加し、Node.js をインストール
# Node.jsのバージョンは22.xを使用
RUN apt-get install -y curl \
		&& curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
		&& apt-get install -y nodejs \
		&& node -v

# PotreeConverterのソースコードをダウンロード
WORKDIR /usr/src
RUN git clone --depth 1 https://github.com/Potree/PotreeConverter.git

# PotreeConverterをビルドし、バイナリを手動でコピー
WORKDIR /usr/src/PotreeConverter
RUN mkdir build && cd build && \
    cmake .. && \
    make -j$(nproc) && \
    cp PotreeConverter /usr/local/bin/

# Node.js アプリケーションの作業ディレクトリを作成
WORKDIR /usr/src/app

# Node.js アプリケーションの依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのソースコードをコンテナにコピー
COPY . .

# 変換のアプリケーションを実行
RUN npm start

# サーバーの実行にはnode.jsベースイメージを利用
FROM node:24-alpine3.21

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# ビューワーのファイルをビルドステージからコピー
COPY --from=builder /usr/src/app/viewer ./viewer

# インストール
WORKDIR /usr/src/app/viewer
RUN npm install

# ビューワーを起動
EXPOSE 1234
CMD ["sh", "-c", "npm run start"]