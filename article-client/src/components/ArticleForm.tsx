import React, { useEffect, useState, useRef } from 'react';
import {
    fetchCategories,
    fetchTags,
    createTag,
    createArticle,
    updateArticle,
    Article,
    Category,
    Tag,
    ArticleInput,
} from '../api/articles';
import { User } from '../api/users';
import './ArticleForm.css';

interface Props {
    article: Article | null;
    currentUser: User | null;
    onSaved: (newArticle?: Article) => void;
}

const ArticleForm: React.FC<Props> = ({ article, currentUser, onSaved }) => {
    const [title, setTitle] = useState<string>(article?.title || '');
    const [content, setContent] = useState<string>(article?.content || '');
    const [categoryId, setCategoryId] = useState<number>(article?.category_id || 1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tagsList, setTagsList] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>(article?.tags || []);
    const [tagQuery, setTagQuery] = useState<string>('');
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCategories().then(r => setCategories(r.data));
        fetchTags().then(r => setTagsList(r.data));
    }, []);

    useEffect(() => {
        setTitle(article?.title || '');
        setContent(article?.content || '');
        setCategoryId(article?.category_id || categories[0]?.id || 1);
        setSelectedTags(article?.tags || []);
    }, [article, categories]);

    if (!currentUser) {
        return <p className="article-form__login">Увійдіть, щоб створювати та редагувати статті.</p>;
    }

    const addTag = (tag: Tag) => {
        setSelectedTags(prev => [...prev, tag]);
        setTagQuery('');
        setShowSuggestions(false);
    };

    const handleTagInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagQuery.trim()) {
            e.preventDefault();
            const text = tagQuery.trim().toLowerCase();
            const existing = tagsList.find(t => t.tag.toLowerCase() === text);
            if (existing) {
                addTag(existing);
            } else {
                const res = await createTag({ tag: text });
                setTagsList(prev => [...prev, res.data]);
                addTag(res.data);
            }
        } else if (e.key === 'Backspace' && !tagQuery && selectedTags.length) {
            setSelectedTags(prev => prev.slice(0, -1));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dto: ArticleInput = {
            title,
            content,
            author_id: currentUser.id,
            category_id: categoryId,
            status: 'draft',
            tags: selectedTags.map(t => t.id),
        };

        let saved: Article;
        if (article) {
            const res = await updateArticle(article.id, dto);
            saved = res.data;
        } else {
            const res = await createArticle(dto);
            saved = res.data;
        }
        // передать назад обновленный объект с тэгами из БД
        onSaved(saved);
    };

    const filteredSuggestions = tagQuery
        ? tagsList
            .filter(t => t.tag.toLowerCase().includes(tagQuery.toLowerCase()))
            .filter(t => !selectedTags.some(st => st.id === t.id))
        : [];

    return (
        <form onSubmit={handleSubmit} className="article-form card">
            <h3 className="article-form__title">
                {article ? 'Редагувати статтю' : 'Нова стаття'}
            </h3>

            <div className="form-group">
                <label className="form-label">Заголовок</label>
                <input
                    className="form-control"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Введіть заголовок"
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Зміст</label>
                <textarea
                    className="form-control"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Введіть текст статті"
                    rows={6}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Категорія</label>
                <select
                    className="form-control"
                    value={categoryId}
                    onChange={e => setCategoryId(+e.target.value)}
                >
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-group tag-group">
                <label className="form-label">Теги</label>
                <div className="tag-input" onClick={() => inputRef.current?.focus()}>
                    {selectedTags.map(t => (
                        <span key={t.id} className="tag">
                            {t.tag}
                            <button
                                type="button"
                                className="tag__remove"
                                onClick={() => setSelectedTags(prev => prev.filter(st => st.id !== t.id))}
                            >×</button>
                        </span>
                    ))}
                    <input
                        ref={inputRef}
                        className="tag-input__input"
                        value={tagQuery}
                        onChange={e => { setTagQuery(e.target.value); setShowSuggestions(true); }}
                        onKeyDown={handleTagInputKeyDown}
                        placeholder="Почніть вводити тег і натисніть Enter"
                    />
                </div>
                {showSuggestions && (
                    <ul className="suggestions">
                        {filteredSuggestions.length > 0
                            ? filteredSuggestions.map(s => (
                                <li key={s.id} className="suggestion-item" onClick={() => addTag(s)}>
                                    {s.tag}
                                </li>
                            ))
                            : <li className="suggestion-item disabled">Тегів не знайдено</li>
                        }
                    </ul>
                )}
            </div>

            <div className="form-actions">
                <button type="submit" className="button button--primary">
                    {article ? 'Зберегти' : 'Створити'}
                </button>
            </div>
        </form>
    );
};

export default ArticleForm;