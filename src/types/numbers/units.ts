import { isString } from '../utils'

const createUnitType = (unit: string) => ({
  test: (v: string | number) =>
    isString(v) && v.endsWith(unit) && v.split(' ').length === 1,
  parse: parseFloat,
  transform: (v: number | string) => `${v}${unit}`,
})
export const percent = createUnitType('%')
