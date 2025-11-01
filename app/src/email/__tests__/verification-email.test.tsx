import { render } from '@react-email/render'
import VerificationEmail from '../aws-ses/verification-email'
import { MIN_HTML_LENGTH } from '../../constant/app_constants'

test('verification email renders and matches snapshot', async () => {
  const html = await render(<VerificationEmail verifyUrl="https://example.com/verify" userEmail="verify@example.com" />)
  expect(typeof html).toBe('string')
  expect(html.length).toBeGreaterThan(MIN_HTML_LENGTH)
  expect(html).toMatchSnapshot()
})
