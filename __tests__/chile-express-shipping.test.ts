import {
  CHILE_EXPRESS_RATES,
  getChileExpressRateByZone,
  getChileExpressRateForRegion,
} from '@/lib/chile-express-shipping'

describe('chile-express-shipping', () => {
  it('returns fixed rate for RM regions', () => {
    expect(getChileExpressRateForRegion('rm')).toMatchObject({
      zone: 'rm',
      clp: 7000,
    })
  })

  it('returns extreme zone for Magallanes', () => {
    expect(getChileExpressRateForRegion('magallanes')).toMatchObject({
      zone: 'extremo',
      clp: 16000,
    })
  })

  it('resolves direct zone lookups', () => {
    expect(getChileExpressRateByZone('prioritario')).toMatchObject({
      zone: 'prioritario',
      clp: 20000,
    })
    expect(CHILE_EXPRESS_RATES).toHaveLength(5)
  })
})
