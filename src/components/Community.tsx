import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Link } from "react-router-dom"
import { Post } from "../helpers/types"

export default function Community() {
  const [posts, setPosts] = useState<Post[]>()

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('posts').select('*, user:users(*)')
      if (error) {
        console.error('Error fetching data:', error)
      } else {
        setPosts(data)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
        <h1 className="text-[9vw] font-serif border-b w-full mb-10">Community</h1>
        {
          posts &&
          <div className="w-full grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {posts.map(post => (
              <Link className="w-full" to={`/posts/${post.post_id}`} key={post.post_id}>
              </Link>
            ))}
          </div>
        }
      </div>
    </div>
  )
}
