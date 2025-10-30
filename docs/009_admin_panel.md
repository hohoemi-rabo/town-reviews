# 009: 管理画面

## 概要
投稿の管理・削除・編集ができる管理者専用画面

## 優先度
🟡 高

## 見積もり時間
8時間

## Phase
Phase 1 - Week 3

## 詳細仕様

### 管理者権限
- 全投稿の閲覧
- 24時間経過後も編集・削除可能
- 不適切投稿の削除
- 投稿統計の閲覧

### 管理画面機能

#### 1. 投稿一覧
- 新着順/通報順でソート
- ページネーション（20件/ページ）
- 検索・フィルタ機能
- 一括選択・一括削除

#### 2. 投稿詳細・編集
- すべての項目を編集可能
- 編集履歴の記録
- 削除理由の記録

#### 3. 施設管理（Ticket 016 Phase 4と統合）
- **施設追加リクエスト管理**
  - リクエスト一覧表示（pending/approved/rejected）
  - 詳細モーダル
  - 承認/却下機能
  - 施設情報入力フォーム
  - placesテーブルへ追加
- **施設データ管理**
  - 施設一覧表示
  - 検索・絞り込み
  - 編集機能
  - 削除機能（論理削除）
  - Google Maps URL編集
- **CSVインポート/エクスポート**
  - CSVアップロードUI
  - ファイル検証
  - 重複チェック
  - 一括INSERT
  - CSVエクスポート機能

#### 4. 統計ダッシュボード
- 総投稿数
- 今月の投稿数
- 人気スポットTOP10
- タグ使用状況
- リアクション統計
- **施設統計（追加）**:
  - 登録施設数
  - エリア別分布
  - カテゴリー別分布

#### 5. ユーザー管理
- IP別投稿数
- 不適切投稿の多いIPの特定

### 認証
- 環境変数による簡易認証
- `ADMIN_PASSWORD`で保護
- セッション管理（Cookie）

## 実装タスク

### Phase 1: 基盤・認証
- [×] 管理画面レイアウト作成
  - [×] `/admin`ページ作成（ダッシュボード）
  - [×] サイドバーナビゲーション（投稿/施設/統計/ログ）
  - [×] ヘッダー
- [×] 認証機能実装
  - [×] ログインページ（`/admin/login`）
  - [×] パスワード検証API
  - [×] セッション管理（Cookie）
  - [×] ミドルウェアで保護

### Phase 2: 投稿管理
- [×] 投稿一覧機能
  - [×] テーブル表示
  - [×] ソート機能
  - [×] ページネーション
  - [×] 一括選択
- [×] 投稿編集機能
  - [×] 編集モーダル
  - [×] すべてのフィールド編集可能
  - [ ] 編集履歴記録（未実装）
- [×] 投稿削除機能
  - [×] 削除確認モーダル
  - [ ] 削除理由入力（未実装）
  - [×] 一括削除

### Phase 3: 施設管理（Ticket 016 Phase 4統合）
- [×] 施設追加リクエスト管理
  - [×] リクエスト一覧表示（`/admin/facility-requests`）
  - [×] フィルタリング（pending/approved/rejected）
  - [×] 詳細モーダル
  - [×] 承認/却下機能
  - [×] 施設情報入力フォーム
  - [×] placesテーブルへ追加
  - [×] （オプション）リクエスト者にメール通知（実装済み、RESEND_API_KEY設定時のみ）
- [×] 施設データ管理
  - [×] 施設一覧表示（`/admin/facilities`）
  - [×] 検索・絞り込み（1秒デバウンス）
  - [×] 編集機能
  - [×] 削除機能（論理削除: `is_verified = false`）
  - [×] Google Maps URL編集
- [ ] CSVインポート/エクスポート
  - [ ] CSVアップロードUI（未実装）
  - [ ] ファイル検証（未実装）
  - [ ] 重複チェック（upsert）（未実装）
  - [ ] 一括INSERT（Ticket 016で実装済みのAPIを活用）（未実装）
  - [×] CSVエクスポート機能（BOM付きUTF-8対応）

### Phase 4: 統計・監査
- [ ] 統計ダッシュボード実装
  - [ ] 総投稿数表示
  - [ ] 施設統計（登録数、エリア別、カテゴリー別）
  - [ ] グラフ表示（Chart.js or Recharts）
  - [ ] 期間絞り込み
- [ ] ユーザー管理機能
  - [ ] IP別統計表示
  - [ ] ブロック機能（将来）
- [ ] 監査ログ機能
  - [ ] 管理者操作の記録
  - [ ] ログ一覧表示

## 関連ファイル

### 新規作成
- `src/app/admin/page.tsx` - ダッシュボード
- `src/app/admin/login/page.tsx` - ログインページ
- `src/app/admin/posts/page.tsx` - 投稿一覧
- `src/app/admin/facility-requests/page.tsx` - 施設リクエスト管理（Ticket 016 Phase 4）
- `src/app/admin/facilities/page.tsx` - 施設データ管理（Ticket 016 Phase 4）
- `src/app/admin/stats/page.tsx` - 統計ダッシュボード
- `src/components/Admin/PostTable.tsx` - 投稿テーブル
- `src/components/Admin/EditModal.tsx` - 投稿編集モーダル
- `src/components/Admin/FacilityRequestList.tsx` - 施設リクエスト一覧（Ticket 016で予定）
- `src/components/Admin/FacilityImport.tsx` - CSVインポート（Ticket 016で予定）
- `src/components/Admin/FacilityList.tsx` - 施設一覧管理（Ticket 016で予定）
- `src/components/Admin/StatsChart.tsx` - 統計グラフ
- `src/app/api/admin/auth/route.ts` - 認証API

### 修正
- `src/middleware.ts` - 管理画面保護
- `src/app/api/admin/import-facilities/route.ts` - CSVインポートAPI（Ticket 016で実装済み）

### 再利用（Ticket 016で実装済み）
- `src/app/api/facility-requests/route.ts` - 施設追加リクエストAPI

## 完了条件
- [×] 管理画面にログインできる
- [×] 投稿一覧が表示される
- [×] 投稿を編集できる
- [×] 投稿を削除できる
- [×] 施設追加リクエストを承認・却下できる（Ticket 016 Phase 4）
- [×] 施設データを編集・削除できる（Ticket 016 Phase 4）
- [ ] CSVから施設をインポートできる（Ticket 016 Phase 4）（未実装）
- [ ] 統計が正しく表示される（投稿 + 施設）（Phase 4未実装）
- [×] 不正アクセスが防止されている
- [ ] 操作ログが記録される（Phase 4未実装）

## 備考

### Ticket 016 Phase 4との統合
- **Ticket 009**: 管理画面の基盤・投稿管理・統計
- **Ticket 016 Phase 4**: 施設管理機能を追加
- **統合のメリット**:
  - 認証・レイアウトを共有できる
  - 一貫したUI/UX
  - 実装効率が向上

### セキュリティ
- 本番環境では強力なパスワードを設定（環境変数）
- 将来的には本格的な認証システム（Auth.js）に移行
- 監査ログは別テーブルで管理
- CSRF対策（Next.js組み込み機能）

### 技術選定
- UI: Tailwind CSS（既存デザインシステムを活用）
- グラフ: Chart.js または Recharts
- 状態管理: React Server Components + URL Search Params
