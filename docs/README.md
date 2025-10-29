# まち口コミ帳 - 開発チケット一覧

このディレクトリには、まち口コミ帳プロジェクトの開発タスクが機能ごとに分割されたチケットファイルとして格納されています。

## チケット管理について

各チケットファイルには以下が含まれます：
- 概要
- 優先度
- 見積もり時間
- フェーズ
- 詳細仕様
- 実装タスク（Todoリスト）
- 関連ファイル
- 完了条件

### Todoの管理方法

各チケット内のTodoは以下の形式で管理します：

```markdown
- [ ] 未完了のタスク
- [×] 完了したタスク
```

**重要**: タスクが完了したら `- [ ]` を `- [×]` に変更してください。

## Phase 1: MVP開発（2-3週間）

### Week 1: 基本UI実装
- [001_project_setup.md](./001_project_setup.md) - プロジェクトセットアップ ✅ **完了**
- [002_database_design.md](./002_database_design.md) - データベース設計とSupabase連携 ✅ **完了**
- [003_map_display.md](./003_map_display.md) - 地図表示機能 ✅ **完了**
- [004_review_card_ui.md](./004_review_card_ui.md) - カード型口コミ表示UI ✅ **完了**
- [005_post_modal.md](./005_post_modal.md) - 投稿モーダル機能 ✅ **完了**

### Week 2: バックエンド実装
- [006_image_upload.md](./006_image_upload.md) - 画像アップロード機能 ✅ **完了** *(005で基本実装、006で最適化)*

### Week 3: 仕上げ
- [007_reaction_feature.md](./007_reaction_feature.md) - リアクション機能 ✅ **完了**

## Phase 1.5: UX改善（仕様変更）

- [016_facility_database.md](./016_facility_database.md) - 施設データベース事前登録 & 検索機能 ✅ **完了（Phase 1-3）**

### 背景
Google Maps URL入力方式は高齢者には難しいため、施設を事前登録しキーワード検索で選択する方式に変更。投稿フローを大幅に簡略化。

### 完了内容
- ✅ Phase 1: データベース & API（施設検索API、施設追加リクエストAPI、RLSポリシー）
- ✅ Phase 2: UI改修（FacilitySearchInput、FacilityRequestModal、PostModal改修、**ひらがな/カタカナ検索サポート追加**）
- ✅ Phase 3: データ取得 & インポート（Google Places API、130件登録完了、CSV import/export）
- ⏳ Phase 4: 管理画面拡張（未実装）

---

### Phase 1 残タスク
- [008_search_filter.md](./008_search_filter.md) - 検索・フィルタ機能 🟡
- [009_admin_panel.md](./009_admin_panel.md) - 管理画面 🟡

## Phase 2: β版リリース（MVP後1ヶ月）

- [010_ai_features.md](./010_ai_features.md) - AI機能（トーン変換・タグ生成） 🟢
- [011_monthly_digest.md](./011_monthly_digest.md) - 月次レポート生成 🟢
- [012_performance_optimization.md](./012_performance_optimization.md) - パフォーマンス最適化 🟡

## 継続的改善

- [013_accessibility.md](./013_accessibility.md) - アクセシビリティ対応 🟡
- [014_security.md](./014_security.md) - セキュリティ対策 🔴
- [015_terms_privacy.md](./015_terms_privacy.md) - 利用規約・プライバシーポリシー 🔴

## 優先度の見方

- 🔴 最高: 必須機能、リリース前に完了必須
- 🟡 高: 重要機能、早めに対応
- 🟢 中: 追加機能、余裕があれば対応

## 進捗管理

各チケットの進捗は以下の方法で確認できます：

1. チケットファイルを開く
2. 「実装タスク」セクションのTodoリストを確認
3. 「完了条件」セクションで完了基準を確認

## チケットの追加

新しいチケットを追加する場合：

1. 連番を振る（016, 017...）
2. ファイル名は `{連番}_{機能名}.md` の形式
3. 既存チケットの構造に従う
4. このREADMEに追記する

## 関連ドキュメント

- [REQUIREMENTS.md](../REQUIREMENTS.md) - 要件定義書
- [CLAUDE.md](../CLAUDE.md) - Claude Code向けガイドライン
- [README.md](../README.md) - プロジェクト概要
