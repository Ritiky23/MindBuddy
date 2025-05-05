import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../component/firebaseConfig';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import './CommunityScreen.css';
import BgImage from '../assets/bg.jpg';

const CommunityScreen = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const postsEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const postsRef = collection(db, 'community');
    const q = query(postsRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const fetchedPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(fetchedPosts);
      },
      error => {
        console.error('Error fetching community posts:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    postsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [newPost]);

  const handlePostSubmit = async e => {
    if (e) e.preventDefault();
    const trimmedPost = newPost.trim();
    if (trimmedPost && currentUser) {
      setLoading(true);
      try {
        await addDoc(collection(db, 'community'), {
          text: trimmedPost,
          userId: currentUser.uid,
          username:
            currentUser.displayName ||
            currentUser.email?.split('@')[0] ||
            'Anonymous',
          timestamp: serverTimestamp()
        });
        setNewPost('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error('Error posting message:', error);
      } finally {
        setLoading(false);
      }
    } else if (!currentUser) {
      console.error('User not logged in, cannot post.');
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePostSubmit();
    }
  };

  return (
    <div
      className="community-page"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${BgImage})`
      }}
    >
      <div className="chat-container">
      <header className="chat-header">
    <div className="header-content"> {/* New container for alignment */}
        {/* SVG Icon (Example: Users icon) */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="header-icon">
          <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
        </svg>
        <h2>MindBuddy Community</h2>
    </div>
    {/* Optional: Placeholder for other elements like user count */}
    {/* <div className="header-actions"></div> */}
</header>

        <div className="posts-list">
          {posts.length > 0 ? (
            posts.map(post => (
              <div
                key={post.id}
                className={`post ${
                  currentUser && post.userId === currentUser.uid
                    ? 'my-post'
                    : 'other-post'
                }`}
              >
                {(!currentUser || post.userId !== currentUser.uid) && (
                  <div className="post-username">
                    {post.username || 'Anonymous'}
                  </div>
                )}
                <div className="post-bubble">
                  <p className="post-text">{post.text}</p>
                  <p className="post-timestamp">
                    {post.timestamp?.toDate
                      ? new Date(post.timestamp.toDate()).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }
                        )
                      : 'Sending...'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts-message">
              <p>Welcome! Share something positive or ask a question.</p>
            </div>
          )}
          <div ref={postsEndRef} />
        </div>

        <form className="message-input-area" onSubmit={handlePostSubmit}>
          <textarea
            ref={textareaRef}
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              currentUser
                ? 'Share your thoughts (Shift+Enter for newline)...'
                : 'Please log in to join the conversation...'
            }
            rows="1"
            disabled={loading || !currentUser}
            aria-label="New message input"
          />
          <button
            type="submit"
            disabled={loading || !currentUser || newPost.trim() === ''}
            aria-label="Send message"
            className="send-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="24"
              height="24"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommunityScreen;
