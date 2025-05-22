import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArticleList } from './ArticleList';
import { User } from '../api/users';
import './ProfilePage.css';

interface Props {
    currentUser: User;
    onLogout: () => void;
}

const ProfilePage: React.FC<Props> = ({ currentUser, onLogout }) => {
    const navigate = useNavigate();

    return (
        <div className="profile">
            <div className="profile__header card">
                <div className="profile__info">
                    <h2 className="profile__name">{currentUser.name}</h2>
                    <p className="profile__email">{currentUser.email}</p>
                    <p className="profile__role">Роль: <span>{currentUser.role}</span></p>
                </div>
                <div className="profile__actions">
                    <button className="button button--primary" onClick={() => navigate('/new')}>
                        Створити статтю
                    </button>
                    <button className="button button--secondary" onClick={onLogout}>
                        Вийти
                    </button>
                </div>
            </div>
            <div className="profile__content">
                <h3 className="profile__section-title">Мої статті</h3>
                <ArticleList
                    currentUser={currentUser}
                    onEdit={article => navigate(`/edit/${article.id}`)}
                    initialMineOnly={true}
                    hideToggle={true}
                />
            </div>
        </div>
    );
};

export default ProfilePage;
