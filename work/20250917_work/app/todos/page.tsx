import { getTodos } from '@/lib/todos';
import type { Todo } from '@/lib/todos';
import { TodosSearch } from './TodosSearch';

type Props = {
    searchParams?: Record<string, string | string[]>;
};

function TodosList({ todos }: { todos: Todo[] }) {
    if (todos.length === 0) {
        return <p className="mt-6 text-gray-500">No todos match your search.</p>;
    }

    return (
        <ul className="mt-6 space-y-3">
            {todos.map((todo) => (
                <li key={todo.id} className="border border-gray-200 rounded p-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-medium">{todo.title}</h3>
                        <span className={todo.completed ? 'text-green-600' : 'text-yellow-600'}>
                            {todo.completed ? 'Done' : 'Pending'}
                        </span>
                    </div>
                    {todo.description && (
                        <p className="text-sm text-gray-500 mt-2">{todo.description}</p>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default async function TodosPage({ searchParams }: Props) {
    const rawQuery = searchParams?.q;
    const query = Array.isArray(rawQuery) ? rawQuery[0] ?? '' : rawQuery ?? '';
    const todos = await getTodos(query);

    return (
        <main className="max-w-2xl mx-auto py-10">
            <h1 className="text-2xl font-semibold mb-6">Todos</h1>
            <TodosSearch initialQuery={query} />
            <TodosList todos={todos} />
        </main>
    );
}
