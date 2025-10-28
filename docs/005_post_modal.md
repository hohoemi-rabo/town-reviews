# 005: 投稿モーダル機能

## 概要
口コミを投稿するためのモーダルUIと基本的な投稿フロー実装

## 優先度
🔴 最高

## 見積もり時間
8時間

## Phase
Phase 1 - Week 1

## 詳細仕様

### 投稿フロー
1. 「口コミを投稿」ボタンクリック
2. モーダル表示
3. Google Mapsリンク貼り付け
4. スポット情報自動取得・表示
5. 情報源選択（プリセット or 自由記述）
6. メモ入力（200文字まで）
7. 写真アップロード（最大3枚、各5MB以内）
8. 投稿者名入力（任意、匿名選択可能）
9. 確認画面表示
10. 投稿完了

### 情報源プリセット
- 家族・親戚
- 友人・知人
- 近所の人
- お店の人
- SNS
- その他（自由記述）

### バリデーション
- Google Mapsリンク形式チェック
- メモ文字数制限（200文字）
- 画像形式チェック（JPEG/PNG）
- 画像サイズチェック（5MB以内）
- 必須項目チェック

### エラーハンドリング
- リンク解析失敗時
- 画像アップロード失敗時
- ネットワークエラー時
- バリデーションエラー時

## 実装タスク

- [ ] モーダルコンポーネント作成（`PostModal.tsx`）
- [ ] モーダル開閉状態管理（Zustand or React Context）
- [ ] Google Mapsリンク入力フィールド
- [ ] リンク解析API実装（`/api/parse-gmaps`）
  - [ ] Place IDの抽出
  - [ ] Place Details API呼び出し
  - [ ] スポット情報取得
- [ ] 情報源選択UI（ラジオボタン + その他入力）
- [ ] メモ入力フィールド
  - [ ] 文字数カウンター表示
  - [ ] リアルタイムバリデーション
- [ ] 画像アップロード機能
  - [ ] ドラッグ&ドロップ対応
  - [ ] プレビュー表示
  - [ ] 削除ボタン
  - [ ] 圧縮処理（Browser Image Compression）
- [ ] 投稿者名入力フィールド
- [ ] 匿名チェックボックス
- [ ] 確認画面実装
- [ ] 投稿API実装（`/api/recommendations`）
- [ ] ローディング状態表示
- [ ] 成功/エラートースト通知
- [ ] モーダルアクセシビリティ対応
  - [ ] フォーカストラップ
  - [ ] ESCキーで閉じる
  - [ ] ARIA属性設定

## 関連ファイル
- `src/components/PostModal/PostModal.tsx` (作成)
- `src/components/PostModal/ImageUpload.tsx` (作成)
- `src/components/PostModal/SourceSelector.tsx` (作成)
- `src/app/api/parse-gmaps/route.ts` (作成)
- `src/app/api/recommendations/route.ts` (作成)
- `src/lib/image-compression.ts` (作成)
- `src/hooks/usePostModal.ts` (作成)

## 完了条件
- [×] モーダルが正常に開閉する
- [×] Google Mapsリンクが正しく解析される
- [×] スポット情報が自動表示される
- [×] 画像アップロードが動作する
- [×] バリデーションが正しく機能する
- [×] 投稿が正常に完了する
- [×] エラーハンドリングが適切に行われる
- [×] アクセシビリティ要件を満たしている

## 備考
- 画像圧縮は`browser-image-compression`ライブラリを使用
- Google Maps APIの使用量に注意
- モーダルは`dialog`要素を使用してアクセシビリティ向上
