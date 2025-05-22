
import axios from 'axios';

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
}

const api = axios.create({
    baseURL: 'http://localhost:3001',
});

export const registerUser = (dto: {
    name: string;
    email: string;
    password: string;
    role: string;
}) => api.post<User>('/users', dto);

export const fetchUsers = () => api.get<User[]>('/users');


export const fetchUserById = (id: number) =>
    api.get<User>(`/users/${id}`);
