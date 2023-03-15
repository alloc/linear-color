// If this number is a decimal, make it just five decimal places
// to avoid exponents
export const sanitize = (v: number) => Math.round(v * 100000) / 100000

export const floatRegex = /(-)?([\d]*\.?[\d])+/g
export const singleColorRegex =
  /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2}(-?[\d\.]+%?)\s*[\,\/]?\s*[\d\.]*%?\))$/i

export function isString(v: any): v is string {
  return typeof v === 'string'
}
