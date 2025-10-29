'use client'

import { useState, FormEvent } from 'react'

interface FacilityRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FacilityRequestModal({
  isOpen,
  onClose,
}: FacilityRequestModalProps) {
  const [facilityName, setFacilityName] = useState('')
  const [address, setAddress] = useState('')
  const [area, setArea] = useState('')
  const [category, setCategory] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [requesterEmail, setRequesterEmail] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // バリデーション
    if (!facilityName.trim()) {
      setError('施設名は必須です')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/facility-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_name: facilityName.trim(),
          address: address.trim() || undefined,
          area: area.trim() || undefined,
          category: category || undefined,
          requester_name: requesterName.trim() || undefined,
          requester_email: requesterEmail.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '送信に失敗しました')
        return
      }

      setIsSuccess(true)
    } catch (err) {
      console.error('Facility request error:', err)
      setError('サーバーエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFacilityName('')
    setAddress('')
    setArea('')
    setCategory('')
    setRequesterName('')
    setRequesterEmail('')
    setIsSuccess(false)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-washi-beige-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-4 border-washi-beige-300">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-washi-green-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-xl font-bold">📝 施設追加リクエスト</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-white hover:text-washi-beige-100 transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-washi-text-light">
                お探しの施設が見つからない場合、こちらからリクエストしてください。
                管理者が確認後、追加いたします。
              </p>

              {/* 施設名（必須） */}
              <div>
                <label className="block text-sm font-medium text-washi-text mb-1">
                  施設名 <span className="text-washi-orange-600">*</span>
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="例: まち口コミ帳カフェ"
                  className="w-full px-4 py-2 border-2 border-washi-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 住所（任意） */}
              <div>
                <label className="block text-sm font-medium text-washi-text mb-1">
                  住所（任意）
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="例: 長野県飯田市○○"
                  className="w-full px-4 py-2 border-2 border-washi-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green-500 focus:border-transparent"
                />
              </div>

              {/* エリア（任意） */}
              <div>
                <label className="block text-sm font-medium text-washi-text mb-1">
                  エリア（任意）
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-washi-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="飯田市">飯田市</option>
                  <option value="下條村">下條村</option>
                  <option value="売木村">売木村</option>
                  <option value="天龍村">天龍村</option>
                  <option value="泰阜村">泰阜村</option>
                  <option value="喬木村">喬木村</option>
                  <option value="豊丘村">豊丘村</option>
                  <option value="大鹿村">大鹿村</option>
                  <option value="阿南町">阿南町</option>
                  <option value="阿智村">阿智村</option>
                  <option value="平谷村">平谷村</option>
                  <option value="根羽村">根羽村</option>
                  <option value="下伊那郡">下伊那郡（その他）</option>
                  <option value="木曽郡">木曽郡</option>
                </select>
              </div>

              {/* カテゴリ（任意） */}
              <div>
                <label className="block text-sm font-medium text-washi-text mb-1">
                  カテゴリ（任意）
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-washi-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="飲食">飲食</option>
                  <option value="体験">体験</option>
                  <option value="自然">自然</option>
                  <option value="温泉">温泉</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              {/* リクエスト者情報 */}
              <div className="border-t-2 border-dashed border-washi-beige-300 pt-4 space-y-4">
                <p className="text-sm text-washi-text-light">
                  以下は任意です（追加完了時にご連絡を希望する場合のみ入力）
                </p>

                {/* 名前（任意） */}
                <div>
                  <label className="block text-sm font-medium text-washi-text mb-1">
                    お名前（任意）
                  </label>
                  <input
                    type="text"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder="例: 山田太郎"
                    className="w-full px-4 py-2 border-2 border-washi-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green-500 focus:border-transparent"
                  />
                </div>

                {/* メールアドレス（任意） */}
                <div>
                  <label className="block text-sm font-medium text-washi-text mb-1">
                    メールアドレス（任意）
                  </label>
                  <input
                    type="email"
                    value={requesterEmail}
                    onChange={(e) => setRequesterEmail(e.target.value)}
                    placeholder="例: example@example.com"
                    className="w-full px-4 py-2 border-2 border-washi-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* エラーメッセージ */}
              {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* 送信ボタン */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-white border-2 border-washi-beige-300 text-washi-text rounded-lg hover:bg-washi-beige-50 transition-colors font-medium"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-washi-green-600 text-white rounded-lg hover:bg-washi-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? '送信中...' : 'リクエスト送信'}
                </button>
              </div>
            </form>
          ) : (
            // 成功メッセージ
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl">✅</div>
              <h3 className="text-xl font-bold text-washi-text">
                リクエストを受け付けました
              </h3>
              <p className="text-washi-text-light">
                管理者が確認後、施設を追加いたします。
                <br />
                ご協力ありがとうございました！
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-3 bg-washi-green-600 text-white rounded-lg hover:bg-washi-green-700 transition-colors font-medium"
              >
                閉じる
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
