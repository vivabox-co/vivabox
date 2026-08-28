export {}

type WompiWidgetResult = {
  transaction?: {
    id: string
    status: string
    reference: string
  }
}

declare global {
  interface Window {
    WidgetCheckout?: new (config: {
      currency: string
      amountInCents: number
      reference: string
      publicKey: string
      redirectUrl: string
      signature: { integrity: string }
    }) => {
      open: (callback: (result: WompiWidgetResult) => void) => void
    }
  }
}
