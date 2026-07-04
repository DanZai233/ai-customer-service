"use client";

import { useState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@luma.local");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/inbox",
    });

    if (result.error) {
      setError(result.error.message ?? "邮箱或密码不正确");
      setPending(false);
      return;
    }

    router.push("/inbox");
    router.refresh();
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={submit}>
      <label className="block space-y-2 text-sm font-medium">
        邮箱
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="block space-y-2 text-sm font-medium">
        密码
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        {pending ? "正在登录" : "登录"}
      </Button>
    </form>
  );
}
