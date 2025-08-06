# Ubuntu 22.04 LTS (長期サポート版) をベースイメージとして使用
FROM ubuntu:22.04

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

# NodeSourceのGPGキーを追加
# RUN mkdir -p /etc/apt/keyrings && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

# Node.js LTS版のNodeSourceリポジトリを追加
# Node.jsのバージョンを指定する場合は、'noderepo'の後にバージョン（例: 'noderepo-20'）を追加
# RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x noderepo main" | tee /etc/apt/sources.list.d/nodesource.list

# 新しいリポジトリを追加したので、パッケージリストを更新
# Node.jsとnpmをインストール
# RUN apt-get update && apt-get install -y nodejs npm

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


# Potree(ビューワー)のソースコードをダウンロード
WORKDIR /usr/src/
RUN git clone https://github.com/potree/potree.git \
		&& cd potree \
		&& npm install \
		&& npm run build

# Node.js アプリケーションの作業ディレクトリを作成
WORKDIR /usr/src/app

# Node.js アプリケーションの依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのソースコードをコンテナにコピー
COPY . .

# 変換のアプリケーションを実行
RUN npm start

# Potree(ビューワー)の作業ディレクトリに移動
WORKDIR /usr/src/potree

# ビューワーを起動
EXPOSE 1234
CMD ["sh", "-c", "npm run start"]