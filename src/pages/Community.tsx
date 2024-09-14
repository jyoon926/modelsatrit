import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Post } from '../utils/Types';
import PostCard from '../components/PostCard';
import PostCreateCard from '../components/PostCreateCard';
import Spinner from '../components/Spinner';

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('post')
      .select('*, user:user(*, profile_photo:photo(*)), photos:post_photo(photo(*))')
      .order('created_at', { ascending: false })
      .range(page * 10, (page + 1) * 10 - 1);
    if (!error && data) {
      const reshapedData = data.map((post) => ({ ...post, photos: post.photos.map((item: any) => item.photo) }));
      setPosts((prevPosts) => [...prevPosts, ...reshapedData]);
      setHasMore(data.length === 10);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const onDeletePost = (post_id: number) => {
    setPosts((prevPosts) => prevPosts!.filter((post) => post.id !== post_id));
  };

  const onCreatePost = (post: Post) => {
    setPosts([post, ...posts]);
  };

  // Infinite scroll
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

  return (
    <div className="fade-in flex flex-col items-center">
      <div className="w-full max-w-[800px] px-5 py-32 flex flex-col justify-start items-center gap-5">
        <h1 className="text-6xl font-serif w-full mb-5 border-b">Community</h1>
        <PostCreateCard onCreate={onCreatePost}></PostCreateCard>
        {posts && (
          <div className="w-full flex flex-col gap-5">
            {posts.map((post) => (
              <PostCard post={post} key={post.id} onDelete={onDeletePost}></PostCard>
            ))}
          </div>
        )}
        {loading && <Spinner />}
        {!hasMore && <div className="py-4 opacity-60">You've reached the end!</div>}
      </div>
    </div>
  );
}
