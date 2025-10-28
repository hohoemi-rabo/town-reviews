# 008: 検索・フィルタ機能

## 概要
タグ、季節、キーワード、情報源タイプでの絞り込み機能

## 優先度
🟡 高

## 見積もり時間
6時間

## Phase
Phase 1 - Week 3

## 詳細仕様

### フィルタ種類

#### 1. タグ絞り込み
- 複数選択可能（OR条件）
- よく使われるタグを上位表示
- 選択中のタグをハイライト

#### 2. 季節絞り込み
- 春・夏・秋・冬から選択
- 単一選択

#### 3. 情報源タイプ絞り込み
- 家族・親戚
- 友人・知人
- 近所の人
- お店の人
- SNS
- その他
- 複数選択可能（OR条件）

#### 4. キーワード検索
- スポット名、口コミ内容を対象
- 部分一致検索
- 検索ワードをハイライト表示

### フィルタUI
- **モバイル**: ボトムシート形式
- **デスクトップ**: サイドバー形式
- 選択中のフィルタ数をバッジ表示
- 「クリア」ボタンで一括解除

### パフォーマンス
- デバウンス処理（キーワード検索）
- クライアント側キャッシング
- フィルタ結果のプリフェッチ

## 実装タスク

- [ ] フィルタ状態管理（Zustand or URL Search Params）
- [ ] フィルタUIコンポーネント作成
  - [ ] `FilterPanel.tsx` (デスクトップ)
  - [ ] `FilterBottomSheet.tsx` (モバイル)
  - [ ] `TagFilter.tsx`
  - [ ] `SeasonFilter.tsx`
  - [ ] `SourceFilter.tsx`
  - [ ] `SearchInput.tsx`
- [ ] タグ一覧取得API（`/api/tags`）
  - [ ] 使用頻度順にソート
  - [ ] キャッシング
- [ ] 検索API実装（`/api/recommendations?search=...`）
  - [ ] クエリパラメータ対応
  - [ ] フルテキスト検索（PostgreSQL）
  - [ ] 複数条件の組み合わせ
- [ ] デバウンス機能実装
  - [ ] `useDebounce` hook作成
  - [ ] 500ms遅延
- [ ] URL同期機能
  - [ ] フィルタ条件をURLに反映
  - [ ] ブラウザバック対応
  - [ ] シェア可能なURL生成
- [ ] フィルタバッジ表示
- [ ] クリア機能実装
- [ ] レスポンシブ対応
  - [ ] モバイル: ボトムシート
  - [ ] デスクトップ: サイドバー
- [ ] アクセシビリティ対応

## 関連ファイル
- `src/components/Filter/FilterPanel.tsx` (作成)
- `src/components/Filter/FilterBottomSheet.tsx` (作成)
- `src/components/Filter/TagFilter.tsx` (作成)
- `src/components/Filter/SeasonFilter.tsx` (作成)
- `src/components/Filter/SourceFilter.tsx` (作成)
- `src/components/Filter/SearchInput.tsx` (作成)
- `src/app/api/tags/route.ts` (作成)
- `src/hooks/useFilter.ts` (作成)
- `src/hooks/useDebounce.ts` (作成)

## 完了条件
- [×] 各フィルタが正常に動作する
- [×] 複数フィルタの組み合わせが動作する
- [×] キーワード検索が動作する
- [×] デバウンス処理が動作する
- [×] URL同期が動作する
- [×] レスポンシブ対応ができている
- [×] パフォーマンスが良好（1秒以内）

## 備考
- PostgreSQLの全文検索機能を活用
- フィルタ条件はURLクエリパラメータで管理
- 日本語検索対応（pg_bigm拡張機能）
