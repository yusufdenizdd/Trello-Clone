import type { ReactNode } from "react";

interface navbarProps {
  children: ReactNode;
}

export default function MyNavbar({ children }: navbarProps) {
  return <div className="mynavbar">{children}</div>;
}
