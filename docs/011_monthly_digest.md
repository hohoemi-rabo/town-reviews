# 011: 月次レポート生成

## 概要
AIによる月次要約レポートの自動生成機能

## 優先度
🟢 中

## 見積もり時間
5時間

## Phase
Phase 2 - β版

## 詳細仕様

### レポート内容
1. **今月のまちの声**: AI生成の月間サマリー
2. **人気スポットランキング**: TOP10
3. **新規発見スポット**: 今月初登場のスポット
4. **トレンドタグ**: 今月よく使われたタグ
5. **投稿統計**: 投稿数、リアクション数など

### 生成タイミング
- 毎月1日深夜0時に自動生成
- Vercel Cron Jobsを使用

### AIプロンプト
```
以下の今月の口コミデータから、地域の様子を温かく要約してください。
- 投稿総数: {count}
- 人気スポット: {top_spots}
- トレンドタグ: {trending_tags}

200文字程度で、地域の人々が読んで楽しい内容にしてください。
```

### 表示UI
- 月別アーカイブページ
- トップページに最新月を表示
- グラフ・チャートでの視覚化

## 実装タスク

- [ ] 月次集計API実装（`/api/digest/generate`）
  - [ ] 月間投稿数集計
  - [ ] スポット別投稿数集計
  - [ ] タグ使用頻度集計
  - [ ] リアクション数集計
- [ ] AI要約生成機能
  - [ ] 集計データをプロンプトに整形
  - [ ] GPT-4o-mini呼び出し
  - [ ] 要約文生成
- [ ] 月次データ保存
  - [ ] `monthly_digests`テーブルに保存
  - [ ] 重複チェック
- [ ] Cron Job設定
  - [ ] `vercel.json`にcron設定追加
  - [ ] `/api/cron/monthly-digest`エンドポイント作成
  - [ ] 認証トークンで保護
- [ ] 月次レポートページ作成
  - [ ] `/digest/[year_month]`ページ
  - [ ] レポート表示UI
  - [ ] グラフ・チャート表示
- [ ] アーカイブ一覧ページ
  - [ ] `/digest`ページ
  - [ ] 月別一覧表示
- [ ] トップページへの統合
  - [ ] 最新月のサマリー表示
  - [ ] 「詳しく見る」リンク
- [ ] データビジュアライゼーション
  - [ ] Chart.js導入
  - [ ] 人気スポットグラフ
  - [ ] タグ使用頻度グラフ

## 関連ファイル
- `src/app/api/digest/generate/route.ts` (作成)
- `src/app/api/cron/monthly-digest/route.ts` (作成)
- `src/app/digest/page.tsx` (作成)
- `src/app/digest/[year_month]/page.tsx` (作成)
- `src/components/Digest/DigestCard.tsx` (作成)
- `src/components/Digest/PopularSpotsChart.tsx` (作成)
- `src/components/Digest/TrendingTagsChart.tsx` (作成)
- `vercel.json` (作成/更新)

## 完了条件
- [×] 月次集計が正しく動作する
- [×] AI要約が生成される
- [×] Cron Jobが動作する
- [×] 月次レポートページが表示される
- [×] グラフが正しく表示される
- [×] アーカイブが閲覧できる

## 備考
- Vercel無料プランはCron Jobに制限あり（Pro推奨）
- 手動生成機能も用意（管理画面から）
- データ保持期間: 無期限（削除機能は将来対応）
