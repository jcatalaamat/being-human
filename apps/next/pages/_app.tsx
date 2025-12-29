import '../public/web.css'
import '@tamagui/core/reset.css'
import '@tamagui/font-inter/css/400.css'
import '@tamagui/font-inter/css/700.css'
import { ColorScheme, NextThemeProvider, useRootTheme } from '@tamagui/next-theme'
import { Provider } from 'app/provider'
import { AuthProviderProps } from 'app/provider/auth'
import { api } from 'app/utils/api'
import { NextPage } from 'next'
import Head from 'next/head'
import 'raf/polyfill'
import { ReactElement, ReactNode } from 'react'
import type { SolitoAppProps } from 'solito'

if (process.env.NODE_ENV === 'production') {
  require('../public/tamagui.css')
}

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

function MyApp({
  Component,
  pageProps,
}: SolitoAppProps<{ initialSession: AuthProviderProps['initialSession'] }>) {
  // reference: https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts
  const getLayout = Component.getLayout || ((page) => page)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_theme, setTheme] = useRootTheme()

  return (
    <>
      <Head>
        <title>Inner Ascend</title>
        <meta
          name="description"
          content="Awaken to your true nature — A 12-month journey of self-discovery, embodied awareness, and inner transformation."
        />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="stylesheet" href="/tamagui.css" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Inner Ascend" />
        <meta
          property="og:description"
          content="Awaken to your true nature — A 12-month journey of self-discovery, embodied awareness, and inner transformation."
        />
        <meta property="og:image" content="/images/og-image.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Inner Ascend" />
        <meta
          name="twitter:description"
          content="Awaken to your true nature — A 12-month journey of self-discovery and inner transformation."
        />
        <meta name="twitter:image" content="/images/og-image.jpg" />
      </Head>
      <NextThemeProvider
        onChangeTheme={(next) => {
          setTheme(next as ColorScheme)
        }}
      >
        <Provider initialSession={pageProps.initialSession}>
          {getLayout(<Component {...pageProps} />)}
        </Provider>
      </NextThemeProvider>
    </>
  )
}

export default api.withTRPC(MyApp)
