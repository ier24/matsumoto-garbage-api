# 松本市田川地区ごみ収集日程API

松本市田川地区のごみ・資源物収集日程表を基にした、特定の日にちに出せるゴミの種類を返却するバックエンドAPIです。

## 機能

- 指定した日付のごみ収集情報をJSON形式で取得
- 田川地区のごみ収集スケジュールに対応
- 拡張性を考慮した設計（詳細情報の取得も可能）

## 技術スタック

- Node.js
- Hono（軽量Webフレームワーク）
- Docker / Docker Compose

## ローカル環境での実行方法

### 前提条件

- Docker と Docker Compose がインストールされていること

### Docker Composeでの起動

1. プロジェクトのルートディレクトリに移動します
   ```
   cd matsumoto-garbage-api
   ```

2. Docker Composeでコンテナを起動します
   ```
   docker-compose up
   ```

3. APIサーバーが起動し、ポート3000でリクエストを受け付けるようになります

### 手動での起動（Docker不使用）

1. Node.jsがインストールされていることを確認します

2. プロジェクトのルートディレクトリに移動します
   ```
   cd matsumoto-garbage-api
   ```

3. apiディレクトリに移動します
   ```
   cd api
   ```

4. 依存パッケージをインストールします
   ```
   npm install
   ```

5. サーバーを起動します
   ```
   npm start
   ```

## API仕様

### ごみ収集情報の取得

**エンドポイント**: `/api/tagawa/garbage`

**メソッド**: GET

**クエリパラメータ**:
- `date`: 日付（YYYY-MM-DD形式）【必須】
- `details`: 詳細情報を含める場合は `true` を指定【オプション】

**レスポンス例**:

基本レスポンス:
```json
{
  "date": "2025-06-02",
  "garbage_types": ["可燃ごみ"],
  "area": "tagawa"
}
```

詳細情報を含めた場合:
```json
{
  "date": "2025-06-25",
  "garbage_types": ["プラスチック資源"],
  "area": "tagawa",
  "details": [
    {
      "code": "プラ資",
      "name": "プラスチック資源",
      "description": "プラスチック資源（毎週 水曜日）",
      "examples": ["プラスチック容器", "プラスチック包装"]
    }
  ]
}
```

## 使用例

### curlでのリクエスト例

```bash
# 基本的な使用方法
curl "http://localhost:3000/api/tagawa/garbage?date=2025-06-02"

# 詳細情報を含める場合
curl "http://localhost:3000/api/tagawa/garbage?date=2025-06-25&details=true"
```

### JavaScriptでの使用例

```javascript
// 基本的な使用方法
fetch('http://localhost:3000/api/tagawa/garbage?date=2025-06-02')
  .then(response => response.json())
  .then(data => console.log(data));

// 詳細情報を含める場合
fetch('http://localhost:3000/api/tagawa/garbage?date=2025-06-25&details=true')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 拡張性について

このAPIは将来的な拡張を考慮して設計されています。現在は以下の拡張が可能です：

1. `details=true` パラメータを追加することで、ごみ種別の詳細情報（説明や例）を取得できます
2. 新しいごみ種別や収集日程の追加は `garbage_data.js` ファイルを編集するだけで対応可能です
3. 他の地区のデータを追加する場合は、同様のデータ構造で新しいファイルを作成し、APIエンドポイントを追加することで対応できます

## ファイル構成

- `api/` - APIソースコード
  - `index.js` - メインのAPIサーバーコード
  - `garbage_data.js` - ごみ収集日程データ
  - `package.json` - 依存パッケージ情報
- `docker-compose.yml` - Docker Compose設定ファイル
- `README.md` - 本ドキュメント
