export interface User {
  user_id: number
  auth_id: string
  created_at: string
  email: string
  display_name: string
  profile_photo: string | null
  bio: string | null
  instagram: string | null
}

export interface Model {
  model_id: number
  user_id: number
  created_at: string
  photos: string[]
  gender: string | null
  height: number | null
  race: string[] | null

  user: User
}

export interface Photographer {
  photographer_id: number
  user_id: number
  created_at: string
  photos: string[]

  user: User
}

export interface Project {
  project_id: number
  photographer_id: number | null
  created_at: string
  title: string
  description: string
  photos: string[]
  tags: number[] | null
  
  photographer: Photographer
}

export interface Post {
  post_id: number
  user_id: number | null
  created_at: string
  title: string
  content: string

  user: User
}

export interface Comment {
  comment_id: number
  post_id: number | null
  user_id: number | null
  created_at: string
  content: string

  post: Post
  user: User
}
