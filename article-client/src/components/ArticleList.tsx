import React, { useEffect, useState } from 'react';
import { fetchArticles, deleteArticle, Article } from '../api/articles';
import { User } from '../api/users';
import { useNavigate } from 'react-router-dom';
import './ArticleList.css';

interface Props {
    currentUser: User | null;
    onEdit: (article: Article) => void;
    initialMineOnly?: boolean;
    hideToggle?: boolean;
}

export const ArticleList: React.FC<Props> = ({
                                                 currentUser,
                                                 onEdit,
                                                 initialMineOnly = false,
                                                 hideToggle = false,
                                             }) => {
    const [list, setList] = useState<Article[]>([]);
    const [search, setSearch] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [tag, setTag] = useState<string>('');
    const [mineOnly, setMineOnly] = useState<boolean>(initialMineOnly);
    const navigate = useNavigate();

    const loadArticles = () => {
        fetchArticles()
            .then(res => setList(res.data))
            .catch(err => console.error('Error fetching articles', err));
    };

    useEffect(() => {
        loadArticles();
    }, []);

    const categories: string[] = Array.from(new Set<string>(
        list.map(a => (a as any).category_name).filter((c): c is string => !!c)
    ));

    const tags: string[] = Array.from(new Set<string>(
        (list.flatMap(a => (a as any).tags || []) as string[])
    ));

    const filtered = list.filter(a => {
        if (mineOnly && a.author_id !== currentUser?.id) return false;
        if (!a.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (category && (a as any).category_name !== category) return false;
        if (tag && !((a as any).tags || []).includes(tag)) return false;
        return true;
    });

    const resetFilters = () => {
        setSearch('');
        setCategory('');
        setTag('');
        setMineOnly(initialMineOnly);
    };

    return (
        <section className="article-list">
            <header className="article-list__header">
                <h2 className="article-list__title">Список статей</h2>
                <p className="article-list__count">Всього статей: {filtered.length}</p>
                <div className="article-list__controls">
                    <input
                        className="input input--search"
                        type="text"
                        placeholder="Пошук за заголовком"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className="select"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="">Усі категорії</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        className="select"
                        value={tag}
                        onChange={e => setTag(e.target.value)}
                    >
                        <option value="">Усі теги</option>
                        {tags.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {!hideToggle && currentUser && (
                        <button className="button button--toggle" onClick={() => setMineOnly(prev => !prev)}>
                            {mineOnly ? 'Показати всі статті' : 'Показати лише мої'}
                        </button>
                    )}
                    {(search || category || tag || mineOnly) && (
                        <button className="button button--clear" onClick={resetFilters}>
                            Скинути фільтри
                        </button>
                    )}
                </div>
            </header>

            {!filtered.length ? (
                <p className="article-list__empty">Статей немає.</p>
            ) : (
                <ul className="article-list__grid">
                    {filtered.map(a => (
                        <li key={a.id} className="card">
                            <h3 className="card__title">{a.title}</h3>
                            <p className="card__meta">
                                <span className="badge badge--category">{(a as any).category_name || 'Без категорії'}</span>
                                {((a as any).tags || [])
                                    .map((t: string) => (
                                        <span key={t} className="badge badge--tag">{t}</span>
                                    ))}
                            </p>
                            <p className="card__excerpt">{a.content.slice(0, 120)}...</p>
                            <div className="card__actions">
                                <button
                                    onClick={() => navigate(`/article/${a.id}`)}
                                    className="button button--read-more"
                                >
                                    Читати повністю <span className="read-more-icon">➔</span>
                                </button>
                                {(currentUser?.role === 'admin' || currentUser?.id === a.author_id) && (
                                    <>
                                        <button onClick={() => onEdit(a)} className="button button--edit">
                                            Редагувати
                                        </button>
                                        <button onClick={() => { if (window.confirm('Видалити статтю?')) deleteArticle(a.id).then(loadArticles); }}
                                                className="button button--delete">
                                            Видалити
                                        </button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};
