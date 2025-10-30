'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message,
        })
        // フォームをクリア
        setName('')
        setEmail('')
        setMessage('')
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'お問い合わせの送信に失敗しました',
        })
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus({
        type: 'error',
        message: 'ネットワークエラーが発生しました',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-washi-beige">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-washi-green hover:text-washi-green-light transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            トップページに戻る
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-10">
          <h1 className="text-3xl font-bold text-washi-green mb-6">
            お問い合わせ
          </h1>

          <p className="text-gray-700 mb-6">
            サービスに関するご質問、ご要望、不具合の報告など、お気軽にお問い合わせください。
          </p>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-washi-green focus:border-transparent outline-none transition-all"
                placeholder="山田 太郎"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-washi-green focus:border-transparent outline-none transition-all"
                placeholder="example@example.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                返信用のメールアドレスをご入力ください
              </p>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={2000}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-washi-green focus:border-transparent outline-none transition-all resize-none"
                placeholder="お問い合わせ内容を詳しくご記入ください"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>できるだけ具体的にご記入いただけると助かります</span>
                <span>{message.length}/2000</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-washi-green text-white py-3 px-6 rounded-lg font-medium hover:bg-washi-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '送信中...' : '送信する'}
            </button>

            {/* Status Message - Below Submit Button */}
            {submitStatus.type && (
              <div
                className={`p-4 rounded-lg ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {submitStatus.message}
              </div>
            )}
          </form>

          {/* Notice */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">
              ご返信について
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• お問い合わせ内容によっては、ご返信までに数日かかる場合があります</li>
              <li>• 営業時間: 平日 9:00-18:00</li>
              <li>• 土日祝日は休業日となります</li>
            </ul>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/terms" className="text-washi-green hover:underline">
            利用規約
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/privacy" className="text-washi-green hover:underline">
            プライバシーポリシー
          </Link>
        </div>
      </main>
    </div>
  )
}
