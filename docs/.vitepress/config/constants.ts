const isProd = process.env.NODE_ENV === 'production'

const site = isProd ? 'https://preset.dev' : 'http://localhost:3333'

export const metaData = {
  title: 'Preset',
  description: 'Elegant, ecosystem-agnostic preset mechanism.',
  site,
  image: `${site}/og.png`,
}
