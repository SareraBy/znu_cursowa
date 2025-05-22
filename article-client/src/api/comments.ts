import axios from 'axios';

export interface Comment {
    id: number;
    content: string;
    author_id: number;
    article_id: number;
    created_date: string;
    parent_id: number | null;
    author_name: string;   // ← добавляем
}

const api = axios.create({ baseURL: 'http://localhost:3001' });

export const fetchCommentsByArticle = (articleId: number) =>
    api.get<Comment[]>(`/comments/article/${articleId}`);

export const createComment = (data: Partial<Comment>) =>
    api.post<Comment>('/comments', data);
