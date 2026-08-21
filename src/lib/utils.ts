import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(price: number, currency = 'USD') {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function getPlatformLabel(platform: string) {
  const labels: Record<string, string> = {
    android: 'Android',
    ios: 'iOS',
    mobile: 'Android / iOS',
    konami: 'Konami ID',
    all: 'Android & iOS',
  }
  return labels[platform] || 'Android / iOS'
}

export function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    paid: "To'langan",
    awaiting_delivery: 'Yetkazib berilishini kutmoqda',
    delivered: 'Yetkazib berildi',
    confirmed: 'Tasdiqlandi',
    completed: 'Yakunlandi',
    disputed: 'Bahsli',
    refunded: "Qaytarildi",
  }
  return labels[status] || status
}

export function getApplicationStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Ko'rib chiqilmoqda",
    approved: 'Tasdiqlandi',
    rejected: "Rad etildi",
  }
  return labels[status] || status
}

export function formatCoinAmount(amount: number) {
  if (amount >= 1_000_000) return `${amount / 1_000_000}M Coin`
  if (amount >= 1_000) return `${amount / 1_000}K Coin`
  return `${amount} Coin`
}

export function generateStars(rating: number) {
  return Math.round(rating * 2) / 2
}
