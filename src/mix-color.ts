import { mix } from './utils/mix'
import { hslaToRgba } from './utils/hsla-to-rgba'
import { hex } from './types/color/hex'
import { rgba } from './types/color/rgba'
import { hsla } from './types/color/hsla'
import { Color, HSLA, RGBA } from './types/types'
import { isString } from './types/utils'

// Linear color space blending
// Explained https://www.youtube.com/watch?v=LKnqECcg6Gw
// Demonstrated http://codepen.io/osublake/pen/xGVVaN
export const mixLinearColor = (from: number, to: number, v: number) => {
  const fromExpo = from * from
  return Math.sqrt(Math.max(0, v * (to * to - fromExpo) + fromExpo))
}

const colorTypes = [hex, rgba, hsla]
const getColorType = (v: Color | string) =>
  colorTypes.find(type => type.test(v))

export function parseColor(color: Color | string) {
  const type = getColorType(color)

  if (!type) {
    throw Error(
      `'${color}' is not an animatable color. Use the equivalent color code instead.`
    )
  }

  let model = isString(color) ? type!.parse(color) : color

  if (type === hsla) {
    model = hslaToRgba(model as HSLA)
  }

  return model as RGBA
}

export const mixColor = (
  from: Color | string,
  to: Color | string,
  v: number
) => {
  from = parseColor(from)
  to = parseColor(to)
  return rgba.transform({
    red: mixLinearColor(from.red, to.red, v),
    green: mixLinearColor(from.green, to.green, v),
    blue: mixLinearColor(from.blue, to.blue, v),
    alpha: mix(from.alpha, to.alpha, v),
  })
}

export { singleColorRegex } from './types/utils'

export type { Color, HSLA, RGBA }
