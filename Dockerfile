# Ubuntu 22.04 LTS (長期サポート版) をベースイメージとして使用
FROM ubuntu:22.04

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
    && rm -rf /var/lib/apt/lists/*

# PotreeConverterのソースコードをダウンロード
WORKDIR /usr/src
RUN git clone https://github.com/Potree/PotreeConverter.git

# PotreeConverterをビルドし、バイナリを手動でコピー
WORKDIR /usr/src/PotreeConverter
RUN mkdir build && cd build && \
    cmake .. && \
    make -j$(nproc) && \
    cp PotreeConverter /usr/local/bin/

# node.js、その他の依存関係をインストール
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Node.js アプリケーションの作業ディレクトリを作成
WORKDIR /usr/src/app

# Node.js アプリケーションの依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのソースコードをコンテナにコピー
COPY . .

# PotreeConverterがどこにあるかを確認するために、PATHを更新する必要はありません。
# /usr/local/binは標準でPATHに含まれています。

# コンテナ起動時に実行するコマンドを設定
# CMD ["your-app-command"]