export type RGBA = {
  red: number
  green: number
  blue: number
  alpha: number
}

export type HSLA = {
  hue: number
  saturation: number
  lightness: number
  alpha: number
}

export type Color = HSLA | RGBA
