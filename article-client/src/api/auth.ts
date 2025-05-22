import axios from 'axios';
import { User } from './users';

const API = 'http://localhost:3001';

export async function register(data: {
    name: string;
    email: string;
    password: string;
}): Promise<{ access_token: string; user: User }> {
    const res = await axios.post(`${API}/auth/register`, data);
    return res.data;
}

export async function login(data: {
    email: string;
    password: string;
}): Promise<{ access_token: string; user: User }> {
    const res = await axios.post(`${API}/auth/login`, data);
    return res.data;
}
