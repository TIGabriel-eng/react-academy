import { useState, useCallback, useRef, useEffect } from 'react';
import { AuthService } from '../../services/auth';
import type { Comentario } from '../../types';

interface CommentsSectionProps {
  comentarios: Comentario[];
  onPostComment: (texto: string, replyTo?: number) => void;
  onDeleteComment?: (id: number) => void;
  onLikeComment?: (id: number) => void;
  isPosting?: boolean;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return Math.floor(diff / 60) + ' min atrás';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
  if (diff < 2592000) return Math.floor(diff / 86400) + 'd atrás';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function corDoNome(nome: string): string {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  return colors[Math.abs(hash) % colors.length];
}

function CommentCard({
  comentario,
  currentUserName,
  onReply,
  onDelete,
  onLike,
  depth = 0,
}: {
  comentario: Comentario;
  currentUserName: string;
  onReply: (texto: string, replyTo: number) => void;
  onDelete?: (id: number) => void;
  onLike?: (id: number) => void;
  depth?: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isAuthor = comentario.usuario_nome === currentUserName;

  useEffect(() => {
    if (showReply && inputRef.current) inputRef.current.focus();
  }, [showReply]);

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText.trim(), comentario.id);
    setReplyText('');
    setShowReply(false);
  };

  return (
    <div className={'va-comment-card' + (depth > 0 ? ' nested' : '')}>
      <div className="va-comment-card__header">
        {comentario.usuario_avatar ? (
          <img src={comentario.usuario_avatar} alt={comentario.usuario_nome} className="va-comment-card__avatar" />
        ) : (
          <div
            className="va-comment-card__avatar va-comment-card__avatar--initial"
            style={{ background: corDoNome(comentario.usuario_nome) }}
          >
            {comentario.usuario_nome.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="va-comment-card__info">
          <span className="va-comment-card__name">{comentario.usuario_nome}</span>
          <span className="va-comment-card__date">{timeAgo(comentario.created_at)}</span>
        </div>
      </div>
      <p className="va-comment-card__text">{comentario.texto}</p>
      <div className="va-comment-card__actions">
        {onLike && (
          <button
            className={'va-comment-action' + (comentario.curtido_por_mim ? ' active' : '')}
            onClick={() => onLike(comentario.id)}
            aria-label="Curtir"
          >
            <i className={comentario.curtido_por_mim ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
            {comentario.curtidas ? <span>{comentario.curtidas}</span> : null}
          </button>
        )}
        {depth < 2 && (
          <button className="va-comment-action" onClick={() => setShowReply(!showReply)} aria-label="Responder">
            <i className="fa-regular fa-comment" /> Responder
          </button>
        )}
        {isAuthor && onDelete && (
          <button className="va-comment-action danger" onClick={() => onDelete(comentario.id)} aria-label="Excluir">
            <i className="fa-regular fa-trash-can" /> Excluir
          </button>
        )}
      </div>
      {showReply && (
        <div className="va-comment-reply-box">
          <textarea
            ref={inputRef}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escreva sua resposta..."
            rows={2}
            maxLength={1000}
          />
          <div className="va-comment-reply-box__actions">
            <button className="va-btn-ghost" onClick={() => { setShowReply(false); setReplyText(''); }}>Cancelar</button>
            <button className="va-btn-accent sm" onClick={handleReply} disabled={!replyText.trim()}>Responder</button>
          </div>
        </div>
      )}
      {comentario.respostas && comentario.respostas.length > 0 && (
        <div className="va-comment-replies">
          {comentario.respostas.map((r) => (
            <CommentCard
              key={r.id}
              comentario={r}
              currentUserName={currentUserName}
              onReply={onReply}
              onDelete={onDelete}
              onLike={onLike}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsSection({ comentarios, onPostComment, onDeleteComment, onLikeComment, isPosting }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'likes'>('recent');
  const userName = AuthService.getName() || 'Usuário';
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePost = useCallback(() => {
    if (!newComment.trim()) return;
    onPostComment(newComment.trim());
    setNewComment('');
  }, [newComment, onPostComment]);

  const sorted = [...comentarios].sort((a, b) => {
    if (sortBy === 'likes') return (b.curtidas || 0) - (a.curtidas || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="va-comments">
      <h3 className="va-comments__title">Comentários da aula</h3>

      <div className="va-comment-input">
        <textarea
          ref={textareaRef}
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
          }}
          placeholder="Compartilhe sua dúvida ou observação..."
          rows={2}
          maxLength={2000}
          aria-label="Novo comentário"
        />
        <button
          className="va-btn-accent sm"
          onClick={handlePost}
          disabled={!newComment.trim() || isPosting}
        >
          {isPosting ? 'Enviando...' : 'Comentar'}
        </button>
      </div>

      <div className="va-comments__sort">
        <button
          className={'va-comments__sort-btn' + (sortBy === 'recent' ? ' active' : '')}
          onClick={() => setSortBy('recent')}
        >
          Mais recentes
        </button>
        <button
          className={'va-comments__sort-btn' + (sortBy === 'likes' ? ' active' : '')}
          onClick={() => setSortBy('likes')}
        >
          Mais curtidos
        </button>
      </div>

      <div className="va-comments__list">
        {sorted.length === 0 ? (
          <div className="va-comments-empty">
            <i className="fa-regular fa-comment-dots" style={{ fontSize: '2rem', opacity: 0.3 }} />
            <p>Nenhum comentário ainda.</p>
          </div>
        ) : (
          sorted.map((c) => (
            <CommentCard
              key={c.id}
              comentario={c}
              currentUserName={userName}
              onReply={(texto, replyTo) => onPostComment(texto, replyTo)}
              onDelete={onDeleteComment}
              onLike={onLikeComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
