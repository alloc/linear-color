# linear-color

Use linear colorspace blending to achieve a more natural color transition. Watch [this video](https://www.youtube.com/watch?v=LKnqECcg6Gw) to learn more. This implementation was extracted from [framer-motion](https://github.com/framer/motion/blob/21902c57f3e47d2621c5c3d7471e700dc3570319/packages/framer-motion/src/utils/mix-color.ts), which means it's battle-tested.

Only HEX, RGB, and HSL colors are supported.

## Usage

```ts
import { mixColor, parseColor } from 'linear-color'

// Mix two colors together. The colors can be strings or Color objects.
const mixedColor = mixColor('#ff0000', '#0000ff', 0.5)
mixedColor // => 'rgba(180, 0, 180, 1)'

// This function is useful for animation libraries, because it
// lets you pre-parse values to reuse every animation frame.
const rgbaColor = parseColor('hsla(0, 100%, 50%, 0.5)')
rgbaColor.red //   => 255
rgbaColor.green // => 0
rgbaColor.blue //  => 0
rgbaColor.alpha // => 0.5
```

Also exported are the `Color`, `RGBA`, and `HSLA` object types.

## Code

When compiled, this library contains ~120 eLOC.

```js
// src/utils/mix.ts
var mix = (from, to, progress) => -progress * from + progress * to + from

// src/utils/hsla-to-rgba.ts
function hueToRgb(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}
function hslaToRgba({ hue, saturation, lightness, alpha: alpha2 }) {
  hue /= 360
  saturation /= 100
  lightness /= 100
  let red = 0
  let green = 0
  let blue = 0
  if (!saturation) {
    red = green = blue = lightness
  } else {
    const q =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation
    const p = 2 * lightness - q
    red = hueToRgb(p, q, hue + 1 / 3)
    green = hueToRgb(p, q, hue)
    blue = hueToRgb(p, q, hue - 1 / 3)
  }
  return {
    red: Math.round(red * 255),
    green: Math.round(green * 255),
    blue: Math.round(blue * 255),
    alpha: alpha2,
  }
}

// src/utils/clamp.ts
var clamp = (min, max, v) => Math.min(Math.max(v, min), max)

// src/types/numbers/index.ts
var number = {
  test: v => typeof v === 'number',
  parse: parseFloat,
  transform: v => v,
}
var alpha = {
  ...number,
  transform: v => clamp(0, 1, v),
}

// src/types/utils.ts
var sanitize = v => Math.round(v * 1e5) / 1e5
var floatRegex = /(-)?([\d]*\.?[\d])+/g
var singleColorRegex =
  /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2}(-?[\d\.]+%?)\s*[\,\/]?\s*[\d\.]*%?\))$/i
function isString(v) {
  return typeof v === 'string'
}

// src/types/color/utils.ts
var isColorString = (type, testProp) => v => {
  return Boolean(
    (isString(v) && singleColorRegex.test(v) && v.startsWith(type)) ||
      (testProp && Object.prototype.hasOwnProperty.call(v, testProp))
  )
}
var splitColor = (aName, bName, cName) => v => {
  if (!isString(v)) return v
  const [a, b, c, alpha2] = v.match(floatRegex)
  return {
    [aName]: parseFloat(a),
    [bName]: parseFloat(b),
    [cName]: parseFloat(c),
    alpha: alpha2 !== void 0 ? parseFloat(alpha2) : 1,
  }
}

// src/types/color/rgba.ts
var clampRgbUnit = v => clamp(0, 255, v)
var rgbUnit = {
  ...number,
  transform: v => Math.round(clampRgbUnit(v)),
}
var rgba = {
  test: isColorString('rgb', 'red'),
  parse: splitColor('red', 'green', 'blue'),
  transform: ({ red, green, blue, alpha: alpha2 = 1 }) =>
    'rgba(' +
    rgbUnit.transform(red) +
    ', ' +
    rgbUnit.transform(green) +
    ', ' +
    rgbUnit.transform(blue) +
    ', ' +
    sanitize(alpha.transform(alpha2)) +
    ')',
}

// src/types/color/hex.ts
function parseHex(v) {
  let r = ''
  let g = ''
  let b = ''
  let a = ''
  if (v.length > 5) {
    r = v.substring(1, 3)
    g = v.substring(3, 5)
    b = v.substring(5, 7)
    a = v.substring(7, 9)
  } else {
    r = v.substring(1, 2)
    g = v.substring(2, 3)
    b = v.substring(3, 4)
    a = v.substring(4, 5)
    r += r
    g += g
    b += b
    a += a
  }
  return {
    red: parseInt(r, 16),
    green: parseInt(g, 16),
    blue: parseInt(b, 16),
    alpha: a ? parseInt(a, 16) / 255 : 1,
  }
}
var hex = {
  test: isColorString('#'),
  parse: parseHex,
  transform: rgba.transform,
}

// src/types/numbers/units.ts
var createUnitType = unit => ({
  test: v => isString(v) && v.endsWith(unit) && v.split(' ').length === 1,
  parse: parseFloat,
  transform: v => `${v}${unit}`,
})
var percent = createUnitType('%')

// src/types/color/hsla.ts
var hsla = {
  test: isColorString('hsl', 'hue'),
  parse: splitColor('hue', 'saturation', 'lightness'),
  transform: ({ hue, saturation, lightness, alpha: alpha2 = 1 }) => {
    return (
      'hsla(' +
      Math.round(hue) +
      ', ' +
      percent.transform(sanitize(saturation)) +
      ', ' +
      percent.transform(sanitize(lightness)) +
      ', ' +
      sanitize(alpha.transform(alpha2)) +
      ')'
    )
  },
}

// src/mix-color.ts
var mixLinearColor = (from, to, v) => {
  const fromExpo = from * from
  return Math.sqrt(Math.max(0, v * (to * to - fromExpo) + fromExpo))
}
var colorTypes = [hex, rgba, hsla]
var getColorType = v => colorTypes.find(type => type.test(v))
function parseColor(color) {
  const type = getColorType(color)
  if (!type) {
    throw Error(
      `'${color}' is not an animatable color. Use the equivalent color code instead.`
    )
  }
  let model = isString(color) ? type.parse(color) : color
  if (type === hsla) {
    model = hslaToRgba(model)
  }
  return model
}
var mixColor = (from, to, v) => {
  from = parseColor(from)
  to = parseColor(to)
  return rgba.transform({
    red: mixLinearColor(from.red, to.red, v),
    green: mixLinearColor(from.green, to.green, v),
    blue: mixLinearColor(from.blue, to.blue, v),
    alpha: mix(from.alpha, to.alpha, v),
  })
}
export { mixColor, mixLinearColor, parseColor }
```
