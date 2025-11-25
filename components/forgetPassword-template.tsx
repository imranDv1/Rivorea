import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Tailwind,
} from "@react-email/components";

interface Props {
  username: string;
  to: string;
  resetUrl: string;
}

const ForgotPasswordEmail = (props: Props) => {
  const { to, resetUrl, username } = props;

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Reset your Rivorea password - Action required</Preview>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white rounded-lg shadow-sm max-w-[600px] mx-auto my-[40px] p-[40px]">
            {/* Header */}
            <Section className="text-center mb-[40px]">
              <Text className="text-[28px] font-bold text-gray-900 m-0 mb-[12px]">
                Reset Your Password
              </Text>
              <Text className="text-[16px] text-gray-600 m-0">
                We received a request to reset your password
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-800 leading-[24px] mb-[16px]">
                Hello {username},
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] mb-[16px]">
                We received a request to reset the password for your Rivorea
                account associated with{" "}
                <strong className="text-gray-900">{to}</strong>.
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] mb-[24px]">
                Click the button below to create a new password. This link will
                expire in 24 hours for security reasons.
              </Text>
            </Section>

            {/* Reset Button */}
            <Section className="text-center mb-[32px]">
              <Button
                href={resetUrl}
                className="bg-[#2563eb] text-white px-[40px] py-[14px] rounded-lg text-[16px] font-semibold no-underline inline-block"
              >
                Reset My Password
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-[32px] bg-gray-50 rounded-lg p-[20px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[8px] m-0">
                If the button doesn&apos;t work, copy and paste this link into
                your browser:
              </Text>
              <Text className="text-[13px] text-[#2563eb] break-all font-mono m-0">
                {resetUrl}
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[32px]" />

            {/* Security Notice */}
            <Section className="mb-[24px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[12px] font-semibold m-0">
                Security Notice
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[8px] m-0">
                • If you didn&apos;t request this password reset, please ignore
                this email. Your password will remain unchanged.
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0">
                • This reset link will expire in 24 hours for your security.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center pt-[24px] border-t border-gray-200">
              <Text className="text-[12px] text-gray-500 leading-[18px] mb-[8px] m-0">
                Need help? Contact us at{" "}
                <a
                  href="mailto:support@rivorea.com"
                  className="text-[#2563eb] no-underline"
                >
                  support@rivorea.com
                </a>
              </Text>
              <Text className="text-[12px] text-gray-400 leading-[18px] m-0">
                © {new Date().getFullYear()} Rivorea. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ForgotPasswordEmail;
