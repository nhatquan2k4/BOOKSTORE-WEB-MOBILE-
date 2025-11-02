import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xác Minh Email | BookStore",
  description: "Xác minh địa chỉ email để kích hoạt tài khoản BookStore của bạn",
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
