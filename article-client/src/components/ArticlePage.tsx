import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchArticleById, Article, Tag } from '../api/articles';
import { CommentsList } from './CommentsList';
import { User, fetchUserById } from '../api/users';
import './ArticlePage.css';

interface Props {
    currentUser: User | null;
}

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('uk-UA', options);
};

const ArticlePage: React.FC<Props> = ({ currentUser }) => {
    const { id } = useParams<{ id: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [authorName, setAuthorName] = useState<string>('Невідомий');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();




    useEffect(() => {
        if (!id) return;

        const loadArticle = async () => {
            try {
                const articleRes = await fetchArticleById(+id);
                setArticle(articleRes.data);

                const authorId = articleRes.data.author_id;
                const userRes = await fetchUserById(authorId);
                setAuthorName(userRes.data.name);
            } catch (error) {
                console.error('Ошибка загрузки данных статьи:', error);
            } finally {
                setLoading(false);
            }
        };

        loadArticle();
    }, [id]);

    if (loading) return <p>Завантаження...</p>;
    if (!article) return <p>Статтю не знайдено.</p>;

    return (
        <div className="article-page">
            <button onClick={() => navigate(-1)} className="back-button">
                ← Назад
            </button>
            <div className="article-header">
                <h2 className="article-title">{article.title}</h2>
                <p className="article-meta">
                    <strong>Автор:</strong> {authorName}
                </p>
                <p className="article-meta">
                    <strong>Категорія:</strong> {article.category_name || 'Без категорії'}
                </p>
                <p className="article-meta">
                    <strong>Теги:</strong>{' '}
                    {article.tags?.length
                        ? article.tags.join(', ')
                        : 'немає'}
                </p>
            </div>
            <hr />
            <p className="article-content">{article.content}</p>
            <div className="article-dates">
                <p>
                    <strong>Створено:</strong> {formatDate(article.created_date)}
                </p>
                <p>
                    <strong>Оновлено:</strong> {formatDate(article.updated_date)}
                </p>
            </div>
            <CommentsList articleId={article.id} currentUser={currentUser} />
        </div>
    );
};

export default ArticlePage;
