import React, { useState, useEffect } from 'react';
import { db, auth } from '../component/firebaseConfig'; // Import Firebase config
import { collection, addDoc, orderBy, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import '../component/CommunityScreen.css';

const CommunityScreen = () => {
  const [currentUser, setCurrentUser] = useState(null); // State for the logged-in user
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);

  // Set the currentUser from auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch posts from Firestore
  useEffect(() => {
    const postsRef = collection(db, 'community');
    const q = query(postsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // Handle new post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (newPost.trim() && currentUser) {
      setLoading(true);
      try {
        await addDoc(collection(db, 'community'), {
          text: newPost,
          userId: currentUser.uid,
          username: currentUser.displayName || 'Anonymous', // Default to 'Anonymous' if no displayName
          timestamp: serverTimestamp(),
        });
        setNewPost('');
      } catch (error) {
        console.error('Error posting:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="community-screen">
      <h2>Community Forum</h2>

      {/* Community Posts */}
      <div className="posts">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post">
              <p><strong>{post.username}</strong>:</p>
              <p>{post.text}</p>
              <p className="timestamp">
                {post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : 'Just now'}
              </p>
            </div>
          ))
        ) : (
          <p>No posts yet. Be the first to share your thoughts!</p>
        )}
      </div>

      {/* Post Form at Bottom */}
      <div className="post-form">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts..."
          rows="4"
          disabled={loading}
        />
        <button
          onClick={handlePostSubmit}
          disabled={loading || !currentUser} // Disable if loading or no currentUser
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default CommunityScreen;
