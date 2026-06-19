import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/')({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context, search }) => {
    const isAuthenticated =
      context.auth.isAuthenticated ||
      useAuthStore.getState().isAuthenticated();

    if (!isAuthenticated) return;

    if (search.redirect) {
      throw redirect({ href: search.redirect });
    }

    throw redirect({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
  },
  component: LoginForm,
});
