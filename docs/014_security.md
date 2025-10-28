# 014: セキュリティ対策

## 概要
Webアプリケーションの基本的なセキュリティ対策実装

## 優先度
🔴 最高

## 見積もり時間
6時間

## Phase
Phase 1 / 継続的改善

## 詳細仕様

### セキュリティ要件

#### 1. HTTPS必須
- すべての通信をHTTPS化
- HTTP Strict Transport Security (HSTS)

#### 2. SQLインジェクション対策
- パラメータ化クエリ使用
- ORMの適切な使用（Supabase）

#### 3. XSS対策
- ユーザー入力のサニタイズ
- Content Security Policy (CSP)
- DOMPurifyライブラリ使用

#### 4. CSRF対策
- CSRFトークン実装
- SameSite Cookie属性

#### 5. 認証・認可
- セッション管理
- 管理者認証の強化
- レート制限

#### 6. データ保護
- IPアドレスのハッシュ化
- 画像メタデータ削除
- 個人情報の暗号化

#### 7. 入力検証
- クライアント側検証
- サーバー側検証
- ファイルアップロード制限

## 実装タスク

- [ ] HTTPS設定
  - [ ] Vercelで自動設定（確認）
  - [ ] HSTSヘッダー追加
- [ ] Content Security Policy (CSP)
  - [ ] CSPヘッダー設定
  - [ ] `next.config.ts`に追加
  - [ ] nonce生成（インラインスクリプト用）
- [ ] XSS対策
  - [ ] DOMPurify導入
  - [ ] ユーザー入力のサニタイズ
  - [ ] dangerouslySetInnerHTML回避
- [ ] CSRF対策
  - [ ] CSRFトークン実装
  - [ ] SameSite=Strict設定
- [ ] SQLインジェクション対策
  - [ ] Supabase RPCの適切な使用
  - [ ] 生SQLの回避
  - [ ] パラメータ化確認
- [ ] レート制限
  - [ ] API Routeにレート制限追加
  - [ ] `@upstash/ratelimit`導入
  - [ ] IPベース制限
- [ ] 入力検証
  - [ ] Zodスキーマ定義
  - [ ] サーバー側バリデーション
  - [ ] ファイルタイプ検証
  - [ ] ファイルサイズ検証
- [ ] IPハッシュ化
  - [ ] SHA-256でハッシュ化
  - [ ] 生IPは保存しない
- [ ] セキュリティヘッダー設定
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Referrer-Policy
  - [ ] Permissions-Policy
- [ ] 環境変数保護
  - [ ] `.env.local`の`.gitignore`確認
  - [ ] サーバー専用変数の分離
- [ ] 依存関係の脆弱性チェック
  - [ ] `npm audit`定期実行
  - [ ] Dependabot設定
  - [ ] 定期的な依存関係更新
- [ ] セキュリティテスト
  - [ ] OWASPトップ10チェック
  - [ ] ペネトレーションテスト（将来）

## 関連ファイル
- `next.config.ts` (更新)
- `src/middleware.ts` (更新)
- `src/lib/security.ts` (作成)
- `src/lib/rate-limit.ts` (作成)
- `src/lib/hash.ts` (作成)
- `src/lib/validation.ts` (作成)
- `.github/dependabot.yml` (作成)

## 完了条件
- [×] HTTPS強制されている
- [×] CSPが設定されている
- [×] XSS対策が実装されている
- [×] CSRF対策が実装されている
- [×] レート制限が動作している
- [×] 入力検証が適切に行われている
- [×] セキュリティヘッダーが設定されている
- [×] 依存関係に脆弱性がない

## 備考
- セキュリティは継続的な改善が必要
- 定期的なセキュリティ監査実施
- セキュリティインシデント対応手順の策定
- バグバウンティプログラム検討（将来）
