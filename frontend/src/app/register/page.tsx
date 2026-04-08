import { redirect } from "next/navigation";

/** Единая страница входа/регистрации — `/login` с вкладкой «Регистрация». */
export default function RegisterRedirectPage() {
  redirect("/login?tab=register");
}
