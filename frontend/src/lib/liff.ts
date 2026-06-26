import liff from '@line/liff'

const LIFF_ID = import.meta.env.VITE_LIFF_ID

export async function initLiff() {
  await liff.init({ liffId: LIFF_ID })
  if (!liff.isLoggedIn()) {
    liff.login()
  }
}

export function getLineProfile() {
  return liff.getProfile()
}

export function getLineUid(): string {
  const context = liff.getContext()
  return context?.userId || ''
}

export function closeMiniApp() {
  liff.closeWindow()
}

export function shareMessage(text: string) {
  if (liff.isApiAvailable('shareTargetPicker')) {
    liff.shareTargetPicker([{
      type: 'text',
      text,
    }])
  }
}
