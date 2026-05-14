import * as echarts from 'echarts'

export const darkTheme = {
  backgroundColor: 'transparent',
  textStyle: { color: 'rgba(255,255,255,0.58)' },
  grid: {
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
  },
  tooltip: {
    backgroundColor: 'rgba(11,21,33,0.95)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 10,
    textStyle: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  },
} as const

export function registerDarkTheme() {
  echarts.registerTheme('pixel-dark', darkTheme)
}
