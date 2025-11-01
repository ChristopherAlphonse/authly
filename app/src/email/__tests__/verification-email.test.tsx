import { render } from '@react-email/render'
import VerificationEmail from '../aws-ses/verification-email'

test('verification email renders and matches snapshot', async () => {
  const html = await render(<VerificationEmail verifyUrl="https://example.com/verify" userEmail="verify@example.com" />)
  expect(typeof html).toBe('string')
  expect(html.length).toBeGreaterThan(0)
  expect(html).toMatchSnapshot()
})
