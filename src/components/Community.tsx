import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Post } from "../utils/types"
import PostCard from "./PostCard"

export default function Community() {
  const [posts, setPosts] = useState<Post[]>()

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('posts').select('*, user:users(*), likes:likes(*)').order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching data:', error)
      } else {
        setPosts(data)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="fade-in flex flex-col items-center">
      <div className="w-full max-w-[800px] px-5 py-32 flex flex-col justify-start items-start">
        <h1 className="text-6xl font-serif w-full mb-10 border-b">Community Posts</h1>
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
