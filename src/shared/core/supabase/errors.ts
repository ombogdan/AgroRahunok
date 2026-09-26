// Maps common Supabase setup failures to the step of docs/SUPABASE_SETUP.md that fixes them.
export function supabaseErrorHint(error: unknown): string | null {
  const {code, message} = (error ?? {}) as {code?: string; message?: string};
  const text = `${code ?? ''} ${message ?? ''}`;
  if (code === '42P01' || code === 'PGRST205' || /does not exist|schema cache/i.test(text)) {
    return 'таблиці немає: виконайте SQL із supabase/migrations (крок 3)';
  }
  if (code === '42501' || /permission denied|row-level security/i.test(text)) {
    return 'немає доступу до таблиці: перевірте, що міграцію з кроку 3 виконано';
  }
  if (code === 'PGRST301' || code === 'PGRST303' || /jwt|jws/i.test(text)) {
    return 'сесія недійсна: вийдіть з акаунта й увійдіть знову';
  }
  if (/network request failed|failed to fetch/i.test(text)) {
    return 'немає зв’язку із Supabase: перевірте інтернет і SUPABASE_URL';
  }
  return null;
}

// Logs a failed Supabase call with a setup hint and the code/message, never the request data.
export function logSupabaseError(action: string, error: unknown): void {
  const hint = supabaseErrorHint(error);
  const {code, message} = (error ?? {}) as {code?: string; message?: string};
  const details = [code, message].filter(Boolean).join(': ');
  console.warn(`${action}${hint ? `: ${hint}` : ''}${details ? ` [${details}]` : ''}`);
}
