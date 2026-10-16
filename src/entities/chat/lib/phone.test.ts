import { createPhoneSchema, formatPhone, normalizePhone } from './phone'

describe('normalizePhone', () => {
  it.each([
    ['+7 (999) 123-45-67', '79991234567'],
    ['8 999 123 45 67', '79991234567'],
    ['+375 29 123-45-67', '375291234567'],
  ])('%s → %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })
})

describe('createPhoneSchema', () => {
  it('accepts only Russian and Belarusian numbers for MAX', () => {
    const schema = createPhoneSchema('max')
    expect(schema.parse('8 (999) 123-45-67')).toBe('79991234567')
    expect(schema.parse('+375291234567')).toBe('375291234567')
    expect(schema.safeParse('+44 7700 900123').error?.issues[0]?.message).toBe(
      'validation.phoneInvalidMax',
    )
  })

  it.each(['whatsapp', 'telegram'] as const)(
    'accepts international numbers for %s',
    (messenger) => {
      const schema = createPhoneSchema(messenger)
      expect(schema.parse('+44 7700 900123')).toBe('447700900123')
      expect(schema.parse('+7 999 123-45-67')).toBe('79991234567')
      expect(schema.safeParse('12345').error?.issues[0]?.message).toBe('validation.phoneInvalid')
    },
  )

  it('requires a number', () => {
    expect(createPhoneSchema('max').safeParse('').error?.issues[0]?.message).toBe(
      'validation.phoneRequired',
    )
  })
})

describe('formatPhone', () => {
  it('formats known country codes', () => {
    expect(formatPhone('79991234567')).toBe('+7 999 123-45-67')
    expect(formatPhone('375291234567')).toBe('+375 29 123-45-67')
    expect(formatPhone('447700900123')).toBe('+447700900123')
  })
})
