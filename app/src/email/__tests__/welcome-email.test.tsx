import { render } from '@react-email/render'
import WelcomeEmail from '../aws-ses/welcome-email'
import { MIN_HTML_LENGTH } from '../../constant/app_constants'

test('welcome email renders and matches snapshot', async () => {
  const html = await render(<WelcomeEmail verifyUrl="https://example.com/verify" userEmail="hi@example.com" />)
  expect(typeof html).toBe('string')
  expect(html.length).toBeGreaterThan(MIN_HTML_LENGTH)
  expect(html).toMatchSnapshot()
})
