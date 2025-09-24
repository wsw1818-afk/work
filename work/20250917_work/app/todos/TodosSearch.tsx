"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useTransition } from 'react';

type Props = {
    initialQuery: string;
};

export function TodosSearch({ initialQuery }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(initialQuery);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const params = new URLSearchParams(searchParams.toString());

        if (value.trim().length > 0) {
            params.set('q', value.trim());
        } else {
            params.delete('q');
        }

        startTransition(() => {
            router.replace(params.size ? `?${params.toString()}` : '?', { scroll: false });
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Search todos"
                className="border border-gray-300 rounded px-3 py-2 flex-1"
                aria-label="Search todos"
                disabled={isPending}
            />
            <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                disabled={isPending}
            >
                {isPending ? 'Searching…' : 'Search'}
            </button>
        </form>
    );
}
