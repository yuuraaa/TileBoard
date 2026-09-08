# TileBoard

セルフホスト型のカードダッシュボードです。設定はYAMLファイルで管理し、Web UI上での編集内容がそのままファイルへ書き戻されます。

> **Status: Early development.** APIやYAMLのスキーマは今後変更される可能性があります。

## 目次

- [特徴](#特徴)
- [スクリーンショット](#スクリーンショット)
- [技術スタック](#技術スタック)
- [動作環境](#動作環境)
- [インストール](#インストール)
- [使い方](#使い方)
- [ビルド](#ビルド)
- [ディレクトリ構成](#ディレクトリ構成)
- [ライセンス](#ライセンス)

## 特徴

- カード形式のダッシュボードUI（React + Bootstrap）
- 設定はYAMLファイルで管理し、UI上での編集がファイルにそのまま反映される
- APIサーバーとフロントエンドの配信を単一プロセスで完結（Hono）
- カードは `type` フィールドによる拡張を前提とした設計（将来のウィジェット追加等に対応予定）
- 認証機能はなし（信頼できるネットワーク内での利用を想定）

## スクリーンショット

_準備中_

## 技術スタック

- フロントエンド: React, Vite, Bootstrap (react-bootstrap)
- バックエンド: [Hono](https://hono.dev/)
- パッケージ管理: pnpm (workspace)

## 動作環境

- Node.js 22系
- pnpm（`corepack enable` で有効化）

## インストール

```bash
git clone https://github.com/yuuraaa/TileBoard.git
cd TileBoard
corepack enable
pnpm install
```

## 使い方

フロントエンドとバックエンドをそれぞれ別ターミナルで起動します。

```bash
# バックエンド（http://localhost:3000）
pnpm dev:backend

# フロントエンド（http://localhost:5173、/api は backend にプロキシ）
pnpm dev:frontend
```

### Dockerコンテナで開発する場合

```bash
docker compose -f docker/compose.yaml up
```

## ビルド

```bash
pnpm build:frontend
pnpm --filter backend build
```

本番用イメージは、リポジトリルートをDocker build contextとして指定してビルドします。

```bash
docker build -f docker/Dockerfile -t tileboard .
```

## ディレクトリ構成

```
.
├── frontend/   # React + Vite フロントエンド
├── backend/    # Hono バックエンド（APIとSPA配信）
├── data/       # ローカル開発用データ（本番はPVCなどの永続ボリュームを想定）
└── docker/     # Dockerfile / compose.yaml
```

## ライセンス

[MIT](./LICENSE)
