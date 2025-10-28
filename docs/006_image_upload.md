# 006: 画像アップロード機能

## 概要
Supabase Storageを使用した画像アップロード・管理機能

## 優先度
🔴 最高

## 見積もり時間
5時間

## Phase
Phase 1 - Week 2

## 詳細仕様

### 画像仕様
- **最大枚数**: 3枚/投稿
- **最大サイズ**: 5MB/枚
- **対応形式**: JPEG, PNG
- **保存形式**: WebP（自動変換）
- **リサイズ**: 最大幅1200px

### ストレージ構造
```
recommendations/
  {recommendation_id}/
    image_1.webp
    image_2.webp
    image_3.webp
```

### セキュリティ
- ファイルタイプ検証
- ファイルサイズ検証
- ウイルススキャン（将来対応）
- 画像メタデータ削除

### パフォーマンス最適化
- クライアント側での圧縮
- Progressive JPEG対応
- 遅延読み込み（Lazy Loading）
- CDNキャッシング

## 実装タスク

- [ ] Supabase Storageバケット作成
  - [ ] `recommendations-images`バケット作成
  - [ ] パブリックアクセス設定
  - [ ] RLSポリシー設定
- [ ] 画像圧縮機能実装
  - [ ] `browser-image-compression`導入
  - [ ] 圧縮設定（品質80%、最大幅1200px）
- [ ] 画像アップロードAPI実装（`/api/upload/image`）
  - [ ] マルチパートフォーム対応
  - [ ] ファイルタイプ検証
  - [ ] ファイルサイズ検証
  - [ ] WebP変換処理
  - [ ] Supabase Storageへアップロード
- [ ] 画像削除API実装（`/api/upload/image/[id]`）
- [ ] 画像プレビュー機能
  - [ ] サムネイル生成
  - [ ] プログレッシブ読み込み
- [ ] エラーハンドリング
  - [ ] ネットワークエラー
  - [ ] ストレージ容量エラー
  - [ ] 形式エラー
- [ ] 画像最適化
  - [ ] Next.js Image Componentの活用
  - [ ] responsive images設定
  - [ ] blur placeholder生成

## 関連ファイル
- `src/app/api/upload/image/route.ts` (作成)
- `src/app/api/upload/image/[id]/route.ts` (作成)
- `src/lib/image-optimization.ts` (作成)
- `src/components/ImageUpload/ImagePreview.tsx` (作成)
- `supabase/storage/policies.sql` (作成)

## 完了条件
- [×] 画像が正常にアップロードされる
- [×] WebP形式で保存される
- [×] ファイルサイズが適切に圧縮される
- [×] プレビューが正常に表示される
- [×] 削除が正常に動作する
- [×] エラーハンドリングが適切に行われる
- [×] Next.js Imageで最適化されて表示される

## 備考
- Supabase無料プランは1GBまで（監視必要）
- WebP変換は`sharp`ライブラリを使用
- 画像メタデータ（EXIF）は自動削除される
