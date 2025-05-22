import React, { useEffect, useState } from "react";
import { fetchCommentsByArticle, createComment, Comment } from "../api/comments";
import { User } from "../api/users";
import "./CommentsList.css";

interface Props {
    articleId: number;
    currentUser: User | null;
}

interface TreeComment extends Comment {
    children: TreeComment[];
}

export const CommentsList: React.FC<Props> = ({ articleId, currentUser }) => {
    const [flat, setFlat] = useState<Comment[]>([]);
    const [tree, setTree] = useState<TreeComment[]>([]);
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [text, setText] = useState("");

    useEffect(() => {
        loadComments();
    }, [articleId]);

    const loadComments = async () => {
        try {
            const response = await fetchCommentsByArticle(articleId);
            const comments = response.data;
            setFlat(comments);
            setTree(buildTree(comments));
        } catch (error) {
            console.error("Помилка завантаження коментарів:", error);
        }
    };

    const buildTree = (comments: Comment[]): TreeComment[] => {
        const map = new Map<number, TreeComment>();
        comments.forEach((comment) =>
            map.set(comment.id, { ...comment, children: [] })
        );
        const roots: TreeComment[] = [];
        map.forEach((comment) => {
            if (comment.parent_id) {
                map.get(comment.parent_id)?.children.push(comment);
            } else {
                roots.push(comment);
            }
        });
        return roots;
    };

    const handleReply = (commentId: number) => {
        setReplyTo(commentId);
    };

    const cancelReply = () => {
        setReplyTo(null);
    };

    const handleSubmit = async (content: string) => {
        if (!currentUser) return;

        try {
            await createComment({
                content,
                author_id: currentUser.id,
                article_id: articleId,
                parent_id: replyTo,
            });
            setText("");
            setReplyTo(null);
            loadComments();
        } catch (error) {
            console.error("Помилка відправки коментаря:", error);
        }
    };

    const renderTree = (nodes: TreeComment[], depth = 0) =>
        nodes.map((comment) => (
            <div key={comment.id} className={`comment-item depth-${depth}`}>
                <div className="comment-content">
                    <p className="comment-text">{comment.content}</p>
                    <span className="comment-author">— {comment.author_name}</span>
                </div>
                {currentUser && (
                    <button
                        className="reply-button"
                        onClick={() => handleReply(comment.id)}
                    >
                        Відповісти
                    </button>
                )}
                {comment.children.length > 0 && (
                    <div className="comment-children">
                        {renderTree(comment.children, depth + 1)}
                    </div>
                )}
            </div>
        ));

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(text);
    };

    return (
        <div className="comments">
            <h3 className="comments-title">Коментарі</h3>
            {tree.length === 0 ? (
                <p className="no-comments">Коментарів поки немає.</p>
            ) : (
                renderTree(tree)
            )}
            {currentUser && (
                <form onSubmit={handleFormSubmit} className="comment-form">
                    <textarea
                        rows={3}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={
                            replyTo
                                ? `Відповідь на коментар #${replyTo}`
                                : "Додати коментар"
                        }
                        required
                        className="comment-textarea"
                    />
                    <div className="comment-form-actions">
                        <button type="submit" className="submit-button">
                            Надіслати
                        </button>
                        {replyTo && (
                            <button
                                type="button"
                                className="cancel-reply-button"
                                onClick={cancelReply}
                            >
                                Скасувати
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
};
