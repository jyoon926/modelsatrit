import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Post } from "../utils/Types"
import PostCard from "../components/PostCard"
import PostCreateCard from "../components/PostCreateCard"

export default function Community() {
  const [posts, setPosts] = useState<Post[]>()

  const fetchData = async () => {
    const { data, error } = await supabase.from('posts').select('*, user:users(*), likes:likes(*)').order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching data:', error)
    } else {
      setPosts(data)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="fade-in flex flex-col items-center">
      <div className="w-full max-w-[800px] px-5 py-32 flex flex-col justify-start items-start gap-5">
        <h1 className="text-6xl font-serif w-full mb-5 border-b">Community Posts</h1>
        <PostCreateCard refreshPosts={fetchData}></PostCreateCard>
        {
          posts &&
          <div className="w-full flex flex-col gap-5">
            {posts.map(post => (<PostCard post={post} key={post.post_id}></PostCard>))}
          </div>
        }
      </div>
    </div>
  )
}
