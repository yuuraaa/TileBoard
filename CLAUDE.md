# TileBoard 開発メモ

プロジェクトの概要・セットアップ・使い方は [README.md](./README.md) を参照。
ここには実装作業をする上での実務的な情報のみ。

## 構成

pnpm workspaceによるモノレポ。

- `frontend/`: React + Vite + react-bootstrap
- `backend/`: Hono（`/api`とSPA配信を同一プロセスで担当）
- `data/`: ローカル開発用のYAML設定データ置き場（本番はPVCマウント想定）
- `docker/`: Dockerfile / compose.yaml

## よく使うコマンド

```bash
pnpm install          # 依存関係インストール（ルートで実行）
pnpm dev:backend      # backend起動 (http://localhost:3000)
pnpm dev:frontend     # frontend起動 (http://localhost:5173, /apiはbackendにプロキシ)
pnpm build:frontend   # frontendビルド
pnpm --filter backend build  # backendビルド
pnpm lint             # oxlintでリポジトリ全体をチェック
pnpm format           # prettierで全体をフォーマット
```

## データ設計

- 設定はYAML管理。UI上での編集内容はAPI経由でファイルへ書き戻す（コメントは保持されない前提）
- ダッシュボードのカードは `type` フィールドで種別を判定する拡張可能な設計。新しいカード種別を追加する際はこの前提を崩さないこと

## Lint/Format

- Lintは `oxlint`（設定はリポジトリルートの `.oxlintrc.json` 一本化。frontend/backend個別の設定は持たない）
- Formatは `prettier`（`.prettierrc.json`）
