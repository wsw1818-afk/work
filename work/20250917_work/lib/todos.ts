export type Todo = {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
};

const TODOS: Todo[] = [
    {
        id: '1',
        title: 'Read book for design inspiration',
        description: 'Check typography chapter before next sprint',
        completed: false,
    },
    {
        id: '2',
        title: 'Confirm booking for team offsite',
        description: 'Email venue once requirements are final',
        completed: false,
    },
    {
        id: '3',
        title: 'Buy new notebook and pens',
        description: 'Restock for the next round of user interviews',
        completed: true,
    },
    {
        id: '4',
        title: '회의록 정리',
        description: '지난주 UX 검토 미팅 기록 공유',
        completed: true,
    },
    {
        id: '5',
        title: '언어별 번역 검토',
        description: '한글/영문 문구 비교 확인',
        completed: false,
    },
];

function normalize(text: string) {
    return text.trim().toLocaleLowerCase('ko-KR');
}

export async function getTodos(search?: string): Promise<Todo[]> {
    const query = search ? normalize(search) : '';

    if (!query) {
        return [...TODOS];
    }

    return TODOS.filter((todo) => {
        const title = normalize(todo.title);
        const description = todo.description ? normalize(todo.description) : '';
        return title.includes(query) || description.includes(query);
    });
}
