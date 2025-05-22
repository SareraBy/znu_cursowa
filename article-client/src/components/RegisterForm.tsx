import React, { useState } from 'react';
import { register, login } from '../api/auth';
import { User } from '../api/users';

interface Props {
    onAuth: (user: User, token: string) => void;
}

export const RegisterForm: React.FC<Props> = ({ onAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            let res;
            if (isLogin) {
                res = await login({ email, password });
            } else {
                res = await register({ name, email, password });
            }
            localStorage.setItem('token', res.access_token);
            onAuth(res.user, res.access_token);
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Помилка');
            }
        }
    };


    return (
        <form onSubmit={submit}>
            {!isLogin && (
                <input
                    placeholder="Імя"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            )}
            <input
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <input
                placeholder="Пароль"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button type="submit">{isLogin ? 'Вхід' : 'Зарегструватись'}</button>
            <div>
                <small>
                    {isLogin ? 'Нема аккаунта?' : 'Уже є аккаунт?'}{' '}
                    <a onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer' }}>
                        {isLogin ? 'Регестрація' : 'Вхід'}
                    </a>
                </small>
            </div>
        </form>
    );
};
