import axios from 'axios';

export interface Article {
    id: number;
    title: string;
    content: string;
    author_id: number;
    category_id: number;
    status: string;
    created_date: string;
    updated_date: string;
    category_name?: string;
    tags?: { id: number; tag: string }[];
}


export interface ArticleInput {
    title: string;
    content: string;
    author_id: number;
    category_id: number;
    status: string;
    tags?: number[];
}

export interface Category { id: number; name: string; description?: string; }
export interface Tag { id: number; tag: string; }

const api = axios.create({ baseURL: 'http://localhost:3001' });

export const fetchArticles = () => api.get<Article[]>('/articles');
export const fetchArticleById = (id: number) => api.get<Article>(`/articles/${id}`);
export const createArticle = (data: ArticleInput) => api.post<Article>('/articles', data);
export const updateArticle = (id: number, data: ArticleInput) => api.put(`/articles/${id}`, data);
export const deleteArticle = (id: number) => api.delete(`/articles/${id}`);

export const fetchCategories = () => api.get<Category[]>('/categories');
export const fetchTags       = () => api.get<Tag[]>('/tags');
export const createTag       = (dto: { tag: string }) => api.post<Tag>('/tags', dto);
