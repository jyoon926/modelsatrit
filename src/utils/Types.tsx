export interface User {
  id: number;
  created_at: string;
  auth_id: string;
  email: string;
  name: string;
  profile_photo?: Photo;
  bio?: string;
  instagram?: string;
  graduation_year?: string;
  major?: string;
}

export interface Model {
  id: number;
  created_at: string;
  user_id: number;
  photos: Photo[];
  gender?: string;
  height?: number;
  race?: string[];

  user: User;
}

export interface Photographer {
  id: number;
  created_at: string;
  user_id: number;
  photos: Photo[];

  user: User;
}

export interface Post {
  id: number;
  created_at: string;
  user_id: number;
  caption: string;
  photos: Photo[];
  edited: boolean;

  user: User;
  likes: Like[];
}

export interface Tag {
  id: number;
  created_at: string;
  post_id: number;
  user_id: number;
  photo_index: number;

  user: User;
}

export interface Comment {
  id: number;
  created_at: string;
  post_id: number;
  user_id: number;
  content: string;

  post: Post;
  user: User;
}

export interface Like {
  id: number;
  created_at: string;
  post_id: number;
  comment_id: number;
  user_id: number;

  user: User;
}

export interface Photo {
  id: number;
  created_at: string;
  name: string;
  small: string;
  medium: string;
  large: string;
  aspect_ratio: number;
}

export interface PhotoCreateData {
  name: string;
  small: string;
  medium: string;
  large: string;
}
