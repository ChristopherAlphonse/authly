import { render } from "@react-email/render";
import { MIN_HTML_LENGTH } from "../../constants/app_constants";
import WelcomeEmail from "../aws-ses/welcome-email";

test("welcome email renders and matches snapshot", async () => {
	const html = await render(
		<WelcomeEmail
			verifyUrl="https://example.com/verify"
			userEmail="hi@example.com"
		/>,
	);
	expect(typeof html).toBe("string");
	expect(html.length).toBeGreaterThan(MIN_HTML_LENGTH);
	expect(html).toMatchSnapshot();
});
