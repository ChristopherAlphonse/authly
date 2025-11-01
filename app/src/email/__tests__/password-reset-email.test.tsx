import { render } from "@react-email/render";
import { MIN_HTML_LENGTH } from "../../constant/app_constants";
import PasswordResetEmail from "../aws-ses/password-reset-email";

test("password reset email renders and matches snapshot", async () => {
	const html = await render(
		<PasswordResetEmail
			resetUrl="https://example.com/reset"
			userEmail="test@example.com"
		/>,
	);
	expect(typeof html).toBe("string");
	expect(html.length).toBeGreaterThan(MIN_HTML_LENGTH);
	expect(html).toMatchSnapshot();
});
