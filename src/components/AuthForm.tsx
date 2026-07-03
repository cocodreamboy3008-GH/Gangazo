"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [f, setF] = useState({ email: "", password: "", name: "", username: "", referral: sp.get("ref") || "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch(`/api/auth/${mode}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(j.error);
    router.push(sp.get("next") || "/");
    router.refresh();
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="mx-auto mt-6 max-w-md">
      <div className="card p-6 md:p-8">
        <h1 className="text-2xl font-extrabold">
          {mode === "login" ? "¡Hola de nuevo! 👋" : "Crea tu cuenta 🎉"}
        </h1>
        <p className="mb-5 text-sm text-gray-500">
          {mode === "login" ? "Tus gangazos te extrañan." : "Te regalamos 50 pujas para empezar. Juega, Puja, Gana."}
        </p>
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <div><label className="label">Nombre</label><input required className="input" value={f.name} onChange={set("name")} placeholder="Juan Pérez" /></div>
              <div><label className="label">Usuario</label><input required className="input" value={f.username} onChange={set("username")} placeholder="juan_mx" /></div>
            </>
          )}
          <div><label className="label">Correo</label><input required type="email" className="input" value={f.email} onChange={set("email")} placeholder="tu@correo.com" /></div>
          <div><label className="label">Contraseña</label><input required type="password" minLength={8} className="input" value={f.password} onChange={set("password")} placeholder="Mínimo 8 caracteres" /></div>
          {mode === "signup" && (
            <div><label className="label">Código de referido <span className="font-normal text-gray-400">(opcional)</span></label>
              <input className="input" value={f.referral} onChange={set("referral")} placeholder="AMIGO123" /></div>
          )}
          {err && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm font-bold text-danger">{err}</p>}
          <button disabled={busy} className="btn-primary w-full !py-3.5">
            {busy ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta y recibir 50 pujas"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          {mode === "login" ? (
            <>¿Nuevo en Gangazo? <Link className="font-bold text-brand hover:underline" href="/registro">Regístrate gratis</Link></>
          ) : (
            <>¿Ya tienes cuenta? <Link className="font-bold text-brand hover:underline" href="/login">Inicia sesión</Link></>
          )}
        </p>
        {mode === "signup" && (
          <p className="mt-3 text-center text-xs text-gray-400">Al registrarte confirmas que eres mayor de 18 años y aceptas jugar responsablemente.</p>
        )}
      </div>
    </div>
  );
}
