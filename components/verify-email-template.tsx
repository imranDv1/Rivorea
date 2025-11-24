import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Tailwind,
} from "@react-email/components";

interface VerifyProps {
  username: string;
  verifyUrl: string;
}

const EmailVerification = (props: VerifyProps) => {
  const { username, verifyUrl } = props;
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-lg max-w-[600px] mx-auto p-[40px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Text className="text-[32px] font-bold text-gray-900 m-0 mb-[8px]">
                Verify Your Email Address
              </Text>
              <Text className="text-[16px] text-gray-600 m-0">
                Welcome to rivorea! We&apos;re excited to have you on board.
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-700 leading-[24px] mb-[16px]">
                Hi {username},
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] mb-[16px]">
                Thank you for signing up! To complete your registration and
                secure your account, please verify your email address by
                clicking the button below.
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] mb-[24px]">
                This verification link will expire in 24 hours for your
                security.
              </Text>
            </Section>

            {/* Verify Button */}
            <Section className="text-center mb-[32px]">
              <Button
                href={verifyUrl}
                className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border hover:bg-blue-700 transition-colors"
              >
                Verify Email Address
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[8px]">
                If the button above doesn&apos;t work, you can also copy and
                paste this link into your browser:
              </Text>
              <Text className="text-[14px] text-blue-600 break-all">
                {verifyUrl}
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[24px]" />

            {/* Security Notice */}
            <Section className="mb-[24px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[8px]">
                <strong>Security Notice:</strong>
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px]">
                If you didn&apos;t create an account with us, please ignore this
                email. Your email address will not be added to our system.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-[12px] text-gray-500 leading-[16px] mb-[8px]">
                Need help? Contact our support team at support@example.com
              </Text>
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                © 2024 Your Company Name. All rights reserved.
              </Text>
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                123 Business Street, City, State 12345
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailVerification;
