import React, { useState, useEffect } from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    useNavigate,
} from 'react-router-dom';
import { User } from './api/users';
import { ArticleList } from './components/ArticleList';
import ArticlePage from './components/ArticlePage';
import ProfilePage from './components/ProfilePage';
import ArticleForm from './components/ArticleForm';
import EditPage from './components/EditPage';
import { RegisterForm } from './components/RegisterForm';
import './App.css';

const NavBar: React.FC<{ currentUser: User | null; onLogout: () => void }> = ({ currentUser, onLogout }) => {
    const navigate = useNavigate();
    return (
        <nav className="app-nav">
            <div className="app-nav__left">
                <Link to="/" className="app-nav__link">Головна</Link>
                {currentUser && (
                    <Link to="/profile" className="app-nav__link">Мій профіль</Link>
                )}
            </div>
            <div className="app-nav__right">
                {currentUser && (
                    <Link to="/create" className="button button--primary">Створити статтю</Link>
                )}
                {currentUser ? (
                    <button onClick={onLogout} className="button button--secondary">Вийти</button>
                ) : (
                    <Link to="/auth" className="button button--secondary">Увійти / Зареєструватися</Link>
                )}
            </div>
        </nav>
    );
};

const AppInner: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem('user');
        if (saved) setCurrentUser(JSON.parse(saved));
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setCurrentUser(null);
        navigate('/');
    };

    return (
        <>
            <NavBar currentUser={currentUser} onLogout={logout} />

            <main className="app-main">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ArticleList
                                currentUser={currentUser}
                                onEdit={a => navigate(`/edit/${a.id}`)}
                                initialMineOnly={false}
                                hideToggle={false}
                            />
                        }
                    />

                    <Route
                        path="/create"
                        element={
                            <ArticleForm
                                article={null}
                                currentUser={currentUser}
                                onSaved={() => navigate('/')}
                            />
                        }
                    />

                    <Route path="/edit/:id" element={<EditPage currentUser={currentUser} />} />

                    <Route path="/article/:id" element={<ArticlePage currentUser={currentUser} />} />

                    {currentUser && (
                        <Route
                            path="/profile"
                            element={<ProfilePage currentUser={currentUser} onLogout={logout} />}
                        />
                    )}

                    <Route
                        path="/auth"
                        element={
                            <RegisterForm
                                onAuth={(user, token) => {
                                    localStorage.setItem('user', JSON.stringify(user));
                                    localStorage.setItem('token', token);
                                    setCurrentUser(user);
                                    navigate('/');
                                }}
                            />
                        }
                    />
                </Routes>
            </main>
        </>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <AppInner />
        </BrowserRouter>
    );
}