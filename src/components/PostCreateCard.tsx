import { useState } from 'react'
import { useAuth } from '../utils/AuthContext'
import ProfilePicture from './ProfilePicture'
import { supabase } from '../supabase'

interface Props {
  refreshPosts: () => void
}

export default function PostCreateCard({ refreshPosts }: Props) {
  const { user } = useAuth()
  const [caption, setCaption] = useState<string>('')

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaption(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return;
    const { error } = await supabase.from('posts').insert([{ user_id: user!.user_id, caption }])
    if (!error) {
      setCaption('')
      refreshPosts()
    }
  }

  if (!user) return null

  return (
    <div className='w-full flex flex-col justify-start items-start border rounded-xl p-5 gap-5'>
      {/* Top */}
      <form className='w-full flex flex-row justify-center items-center gap-3' onSubmit={handleSubmit}>
        <ProfilePicture user={user!} />
          <input
            className='w-full border-none'
            type='text'
            placeholder='Create a new post...'
            maxLength={500}
            value={caption}
            onChange={handleCaptionChange}
            required
          />
        <button className='button sm'>Post</button>
      </form>
    </div>
  )
}