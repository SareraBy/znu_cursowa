import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchArticleById, Article } from '../api/articles';
import ArticleForm from './ArticleForm';
import { User } from '../api/users';

interface Props {
    currentUser: User | null;
}

const EditPage: React.FC<Props> = ({ currentUser }) => {
    const { id } = useParams<{ id: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        fetchArticleById(Number(id))
            .then(res => setArticle(res.data))
            .catch(console.error);
    }, [id]);

    if (!article) return <p>Завантаження статті…</p>;

    return (
        <div style={{ padding: '1rem' }}>
            <ArticleForm
                article={article}
                currentUser={currentUser}
                onSaved={() => navigate('/')}
            />
        </div>
    );
};

export default EditPage;
