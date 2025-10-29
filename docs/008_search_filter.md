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

#### 4. 施設フィルタ（Ticket 016で実装済み）
- 施設での絞り込み（ドロップダウンまたはオートコンプリート）
- FacilitySearchInputコンポーネントを再利用
- 選択した施設のrecommendationsのみ表示

#### 5. キーワード検索
- 口コミ内容（note_formatted）を対象
- 部分一致検索
- 検索ワードをハイライト表示
- **注**: 施設名検索はTicket 016で実装済み（施設フィルタを使用）

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

### Phase 1: フィルタ基盤
- [ ] フィルタ状態管理（URL Search Params推奨）
- [ ] フィルタUIコンポーネント作成
  - [ ] `FilterPanel.tsx` (デスクトップ)
  - [ ] `FilterBottomSheet.tsx` (モバイル)
  - [ ] `TagFilter.tsx`
  - [ ] `SeasonFilter.tsx`
  - [ ] `SourceFilter.tsx`
  - [ ] `FacilityFilter.tsx` - **Ticket 016のFacilitySearchInputを再利用**
  - [ ] `ContentSearchInput.tsx` - 口コミ内容専用検索

### Phase 2: API実装
- [ ] タグ一覧取得API（`/api/tags`）
  - [ ] 使用頻度順にソート
  - [ ] キャッシング
- [ ] 口コミ検索API拡張（`/api/recommendations`）
  - [ ] クエリパラメータ対応: `?facility_id=`, `?tags=`, `?season=`, `?heard_from_type=`, `?search=`
  - [ ] フルテキスト検索（PostgreSQL - note_formatted対象）
  - [ ] 複数条件の組み合わせ（AND条件）
  - [ ] **注**: 施設検索はTicket 016で実装済み（`/api/facilities/search`）

### Phase 3: UX改善
- [ ] デバウンス機能実装
  - [ ] `useDebounce` hook作成
  - [ ] 500ms遅延
- [ ] URL同期機能
  - [ ] フィルタ条件をURLに反映
  - [ ] ブラウザバック対応
  - [ ] シェア可能なURL生成
- [ ] フィルタバッジ表示（アクティブなフィルタ数）
- [ ] クリア機能実装（全フィルタ解除）

### Phase 4: 仕上げ
- [ ] レスポンシブ対応
  - [ ] モバイル: ボトムシート
  - [ ] デスクトップ: サイドバー
- [ ] アクセシビリティ対応
  - [ ] キーボードナビゲーション
  - [ ] スクリーンリーダー対応
- [ ] ローディング状態表示

## 関連ファイル

### 新規作成
- `src/components/Filter/FilterPanel.tsx` - デスクトップ用フィルタパネル
- `src/components/Filter/FilterBottomSheet.tsx` - モバイル用ボトムシート
- `src/components/Filter/TagFilter.tsx` - タグフィルタ
- `src/components/Filter/SeasonFilter.tsx` - 季節フィルタ
- `src/components/Filter/SourceFilter.tsx` - 情報源フィルタ
- `src/components/Filter/FacilityFilter.tsx` - 施設フィルタ（FacilitySearchInputを再利用）
- `src/components/Filter/ContentSearchInput.tsx` - 口コミ内容検索
- `src/app/api/tags/route.ts` - タグ一覧API
- `src/hooks/useFilter.ts` - フィルタ状態管理
- `src/hooks/useDebounce.ts` - デバウンス処理

### 再利用（Ticket 016で実装済み）
- `src/components/PostModal/FacilitySearchInput.tsx` - 施設検索コンポーネント
- `src/app/api/facilities/search/route.ts` - 施設検索API
- `src/lib/text-utils.ts` - テキスト変換ユーティリティ

### 修正
- `src/app/page.tsx` - フィルタパネル統合
- `src/app/api/recommendations/route.ts` - GETメソッドにフィルタパラメータ追加

## 完了条件
- [×] 各フィルタが正常に動作する
- [×] 複数フィルタの組み合わせが動作する
- [×] キーワード検索が動作する
- [×] デバウンス処理が動作する
- [×] URL同期が動作する
- [×] レスポンシブ対応ができている
- [×] パフォーマンスが良好（1秒以内）

## 備考

### Ticket 016との関係
- **施設検索**: Ticket 016で実装済み（`/api/facilities/search`）
- **再利用**: FacilitySearchInputコンポーネントをフィルタパネルに統合
- **役割分担**:
  - Ticket 016: 投稿時の施設選択
  - Ticket 008: 既存口コミの施設フィルタ

### 技術仕様
- PostgreSQLの全文検索機能を活用（口コミ内容のみ）
- フィルタ条件はURLクエリパラメータで管理（シェア可能なURL）
- 日本語検索対応（pg_trgm拡張機能 - Ticket 016で有効化済み）
- デバウンス: 500ms（Ticket 016は300ms）

### パフォーマンス考慮
- クライアント側キャッシング（タグ一覧など）
- インデックス活用（places.name_kana、recommendations.note_formatted）
- ページネーション（無限スクロール継続）
