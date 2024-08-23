import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Post } from '../utils/Types';
import PostCard from '../components/PostCard';
import PostCreateCard from '../components/PostCreateCard';
import { DiVim } from 'react-icons/di';
import Spinner from '../components/Spinner';

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*, user:users(*)')
      .order('created_at', { ascending: false })
      .range(page * 10, (page + 1) * 10 - 1);
    if (!error && data) {
      setPosts((prevPosts) => [...prevPosts, ...data]);
      setHasMore(data.length === 10);
    }
    setLoading(false);
  }, [page, loading, hasMore]);

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 10 &&
        !loading &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const handleDeletePost = (post_id: number) => {
    setPosts((prevPosts) => prevPosts!.filter((post) => post.post_id !== post_id));
  };

  const handleCreatePost = (post: Post) => {
    setPosts([post, ...posts!]);
  };

  return (
    <div className="fade-in flex flex-col items-center">
      <div className="w-full max-w-[800px] px-5 py-32 flex flex-col justify-start items-center gap-5">
        <h1 className="text-5xl sm:text-6xl font-serif w-full mb-5 border-b">Community Posts</h1>
        <PostCreateCard onCreate={handleCreatePost}></PostCreateCard>
        {posts && (
          <div className="w-full flex flex-col gap-5">
            {posts.map((post) => (
              <PostCard post={post} key={post.post_id} onDelete={handleDeletePost}></PostCard>
            ))}
          </div>
        )}
        {loading && <Spinner />}
        {!hasMore && <div className="m-4 opacity-60">You've reached the end!</div>}
      </div>
    </div>
  );
}
