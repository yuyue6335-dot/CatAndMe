"use client";

import type React from "react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type Mode = "login" | "signup";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/memories";
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) router.replace(next);
      setLoading(false);
    })();
  }, [next, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = getSupabaseBrowserClient();
    const credentials = {
      email: email.trim(),
      password
    };

    const { data, error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp({
            ...credentials,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=/memories`
            }
          });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (mode === "signup" && !data.session) {
      setMessage("注册成功，请先到邮箱确认账号，然后回来登录。");
      setLoading(false);
      setMode("login");
      return;
    }

    router.replace(next);
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-8">
      <section className="grid w-full gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-medium text-muted">访问前请先登录</p>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-text md:text-5xl">进入你的回忆</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">
            使用邮箱和密码登录后，可以查看、收藏和整理自己创建的全部回忆。
          </p>
        </div>

        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e4f4e6] text-[#3e7d50]">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text">{mode === "login" ? "账号登录" : "创建账号"}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                {mode === "login" ? "登录后进入我的回忆。" : "注册后会为这个邮箱创建独立的回忆空间。"}
              </p>
            </div>
          </div>

          <form className="grid gap-3.5" onSubmit={submit}>
            <Input
              autoComplete="email"
              inputMode="email"
              placeholder="邮箱"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={6}
              placeholder="密码"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {message ? <p className="rounded-xl bg-[#f7faf8] px-3.5 py-3 text-sm leading-6 text-muted">{message}</p> : null}

            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" disabled={loading}>
                {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {loading ? "处理中" : mode === "login" ? "登录" : "注册"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "注册新账号" : "已有账号登录"}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-8">
          <Card className="w-full p-6 text-sm text-muted">正在打开登录页...</Card>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
