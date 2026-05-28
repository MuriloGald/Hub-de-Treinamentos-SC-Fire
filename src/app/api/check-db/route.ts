import { NextResponse } from "next/server";

/**
 * Rota de diagnóstico temporária para descobrir qual banco de dados
 * a Vercel está acessando em produção.
 */
export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "Não configurada",
    hasAnonKey: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    anonKeyPrefix: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)?.substring(0, 15) ?? "Nenhuma",
  });
}
