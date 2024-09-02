export interface User {
  user_id: number;
  auth_id: string;
  created_at: string;
  email: string;
  name: string;
  profile_photo?: string;
  bio?: string;
  instagram?: string;
  graduation_year?: string;
  major?: string;
}

export interface Model {
  model_id: number;
  user_id: number;
  photos: string[];
  gender?: string;
  height?: number;
  race?: string[];
  created_at: string;

  user: User;
}

export interface Photographer {
  photographer_id: number;
  user_id: number;
  photos: string[];
  created_at: string;

  user: User;
}

export interface Post {
  post_id: number;
  user_id: number;
  caption: string;
  photos: string[];
  created_at: string;

  user: User;
  likes: Like[];
}

export interface Comment {
  comment_id: number;
  post_id?: number;
  user_id?: number;
  content: string;
  created_at: string;

  post: Post;
  user: User;
}

export interface Like {
  like_id: number;
  post_id?: number;
  comment_id?: number;
  user_id: number;
  created_at: string;

  user: User;
}

export interface Tag {
  tag_id: number;
  post_id: number;
  user_id: number;
  created_at: string;
}
