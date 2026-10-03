import webpush from 'web-push'

const subject = 'mailto:hello@gigtic.in'
const publicKey = process.env.NEXT_PUBLIC_VAPID_KEY || ''
const privateKey = process.env.VAPID_PRIVATE_KEY || ''

if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey)
  } catch (error) {
    console.error('Failed to configure web-push:', error)
  }
} else {
  console.warn('Web push VAPID keys missing. Notifications will not be sent.')
}

export { webpush }
