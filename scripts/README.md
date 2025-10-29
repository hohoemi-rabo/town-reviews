# 施設データ取得・インポートスクリプト

このディレクトリには、Google Places APIから南信州エリアの施設データを取得し、データベースにインポートするためのスクリプトが含まれています。

## 前提条件

1. `.env.local`に`GOOGLE_MAPS_SERVER_API_KEY`が設定されていること
2. Google Places APIが有効化されていること（Nearby Search + Place Details）
3. `tsx`がインストールされていること（`npm install`で自動インストール）

## 使い方

### ステップ1: 施設データの取得

Google Places APIから南信州エリアの施設データを取得し、CSVファイルに出力します。

```bash
npm run fetch-facilities
```

**実行結果**:
- `scripts/output/facilities.csv` にデータが出力されます
- 最大500件の施設データが取得されます
- 飯田市を中心に半径30kmの範囲で検索します

**出力されるCSV形式**:
```csv
place_id,name,address,area,category,lat,lng,phone,google_maps_url,is_verified,created_by
ChIJ...,施設名,"住所",飯田市,飲食,35.5147,137.8219,0265-xx-xxxx,https://maps.google.com/?cid=...,true,api
```

**カテゴリ自動判定**:
- 飲食: レストラン、カフェ、食堂など
- 体験: 観光地、美術館、博物館など
- 自然: 公園、キャンプ場など
- 温泉: スパ、宿泊施設など
- その他: 上記以外

**エリア判定**:
住所から以下のエリアを自動判定します：
- 飯田市
- 下條村、売木村、天龍村、泰阜村、喬木村、豊丘村、大鹿村
- 阿南町、阿智村、平谷村、根羽村
- その他の下伊那郡・木曽郡の市町村

### ステップ2: データの確認と編集

出力された`scripts/output/facilities.csv`を確認・編集します。

- **重複削除**: place_idで重複があれば削除
- **カテゴリ修正**: 自動判定が間違っている場合は手動修正
- **不要なデータ削除**: 対象外の施設を削除

### ステップ3: データベースへのインポート

管理画面（予定）またはAPIから直接インポートします。

#### オプション A: curlコマンドでインポート

```bash
curl -X POST http://localhost:3000/api/admin/import-facilities \
  -H "x-admin-password: YOUR_ADMIN_PASSWORD" \
  -F "file=@scripts/output/facilities.csv"
```

#### オプション B: 管理画面からインポート（Phase 4で実装予定）

1. 管理画面にログイン
2. 「施設データ一括インポート」を選択
3. CSVファイルをアップロード
4. インポート実行

## Google Places API コスト見積もり

### 無料枠
- 月額$200の無料クレジット

### 料金（2024年時点）
- **Nearby Search**: $0.032 / リクエスト
- **Place Details**: $0.017 / リクエスト

### 500件取得時のコスト例
- Nearby Search: 10カテゴリ × 1リクエスト = $0.32
- Place Details: 500件 × $0.017 = $8.50
- **合計: 約$9** （無料枠内で実行可能）

## トラブルシューティング

### エラー: `GOOGLE_MAPS_SERVER_API_KEY が設定されていません`

`.env.local`ファイルに以下を追加してください：

```bash
GOOGLE_MAPS_SERVER_API_KEY=your_api_key_here
```

### エラー: `API Error: REQUEST_DENIED`

Google Cloud ConsoleでPlaces APIが有効化されているか確認してください。

### データが少ない（500件未満）

- 検索半径を広げる: `SEARCH_RADIUS`の値を増やす
- カテゴリを追加: `PLACE_TYPES`に新しいタイプを追加
- エリア判定を緩める: `detectArea()`関数を調整

### CSVインポートエラー

- CSV形式が正しいか確認（ヘッダー行必須）
- ダブルクォートのエスケープが正しいか確認
- place_idが重複していないか確認

## 今後の拡張

- [ ] 定期的な自動更新（cron）
- [ ] 差分更新機能
- [ ] 施設写真の取得
- [ ] 営業時間の取得
- [ ] レビュー情報の取得

## 参考リンク

- [Google Places API - Nearby Search](https://developers.google.com/maps/documentation/places/web-service/search-nearby)
- [Google Places API - Place Details](https://developers.google.com/maps/documentation/places/web-service/details)
- [Google Places API - Usage and Billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
