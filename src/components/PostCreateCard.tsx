import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../supabase';
import ProfilePhoto from './ProfilePhoto';
import { MdChevronLeft, MdChevronRight, MdClose, MdOutlineImage } from 'react-icons/md';
import { Post, User } from '../utils/Types';
import AutoTextArea from './AutoTextArea';
import TagPanel from './TagPanel';
import { useNotification } from './Notification';
import { uploadPhoto } from '../utils/PhotoUtils';

interface Props {
  onCreate: (post: Post) => void;
}

export default function PostCreateCard({ onCreate }: Props) {
  const { user } = useAuth();
  const [caption, setCaption] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [tags, setTags] = useState<User[][]>([]);
  const [dragging, setDragging] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);
  const { toastPromise } = useNotification();

  const imageUrls = useMemo(() => images.map((image) => URL.createObjectURL(image)), [images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const promise = new Promise<void>(async (resolve, reject) => {
      const uploadedPhotos = await Promise.all(images.map(uploadPhoto));
      const photos = uploadedPhotos.map((photo) => photo.id);

      const { data: post, error } = await supabase
        .from('post')
        .insert([{ user_id: user.id, caption, photos }])
        .select('id')
        .single();

      if (!error && post) {
        await supabase.from('post_photo').insert(
          photos.map((photo) => {
            return { post_id: post.id, photo_id: photo };
          })
        );
        if (tags.length > 0) {
          tags.map(
            async (photo, index) =>
              await supabase.from('tag').insert(
                photo.map((tag) => {
                  return { post_id: post.id, user_id: tag.id, photo_index: index };
                })
              )
          );
        }
        const { data, error } = await supabase
          .from('post')
          .select('*, user:user(*, profile_photo:photo(*)), likes:like(*), photos:post_photo(photo(*))')
          .eq('id', post.id)
          .single();
        const reshapedData = { ...data, photos: data.photos.map((item: any) => item.photo) };
        if (error) reject(error);
        setCaption('');
        setImages([]);
        setTags([]);
        onCreate(reshapedData as Post);
        resolve();
      } else {
        reject(error);
      }
    });

    toastPromise(promise, {
      pending: 'Creating post...',
      success: 'Post was created successfully!',
      error: 'Failed to create post.',
    });
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages]);
      setTags((prevTags) => [...prevTags, ...newImages.map(() => [])]);
    }
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);

    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((file) =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)
      );
      setImages([...images, ...validFiles]);
      setTags((prevTags) => [...prevTags, ...validFiles.map(() => [])]);
      e.dataTransfer.clearData();
    }
  };

  const movePhotoLeft = (index: number) => {
    if (index > 0) {
      const newImages = [...images];
      const newTags = [...tags];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      [newTags[index - 1], newTags[index]] = [newTags[index], newTags[index - 1]];
      setImages(newImages);
      setTags(newTags);
    }
  };

  const movePhotoRight = (index: number) => {
    if (index < images.length - 1) {
      const newImages = [...images];
      const newTags = [...tags];
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
      [newTags[index + 1], newTags[index]] = [newTags[index], newTags[index + 1]];
      setImages(newImages);
      setTags(newTags);
    }
  };

  const updateTags = (index: number, newTags: User[]) => {
    const updatedTags = [...tags];
    updatedTags[index] = newTags;
    setTags(updatedTags);
  };

  if (!user) return null;

  return (
    <div
      className="w-full flex flex-col justify-start items-start border rounded-lg p-3 sm:p-5 gap-5"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <form className="w-full flex flex-row justify-start items-start gap-3" onSubmit={handleSubmit}>
        <ProfilePhoto user={user!} />
        <AutoTextArea
          value={caption}
          placeholder="Create a new post..."
          onChange={(e) => setCaption(e.target.value)}
          maxRows={15}
        />

        {/* Attach images button */}
        <label className="p-[5px] cursor-pointer duration-300 hover:bg-foreground/10 rounded" htmlFor="images">
          <MdOutlineImage className="text-2xl" />
          <input
            className="hidden"
            type="file"
            name="images"
            accept=".jpeg, .jpg, .png, .gif"
            onChange={handleImagesChange}
            id="images"
            multiple
          />
        </label>

        {/* Post button */}
        <button className="button sm" type="submit">
          Post
        </button>
      </form>

      {/* Images preview and drag-and-drop area */}
      {(images.length > 0 || dragging) && (
        <div
          className={`w-full flex flex-row gap-3 flex-wrap bg-foreground/10 p-3 rounded-lg border ${dragging ? 'border-dashed border-2 border-gray-400' : ''}`}
        >
          {imageUrls.map((image, index) => (
            <div className="relative flex" key={index}>
              <img className="h-40 w-auto rounded" src={image} alt={`Image ${index + 1}`} draggable="false" />
              <button
                className="absolute top-0 right-0 m-1.5 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                onClick={() => handleDeleteImage(index)}
              >
                <MdClose />
              </button>
              {index !== 0 && imageUrls.length > 1 && (
                <button
                  className="absolute bottom-0 left-0 m-1.5 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                  onClick={() => movePhotoLeft(index)}
                >
                  <MdChevronLeft />
                </button>
              )}
              {index !== imageUrls.length - 1 && (
                <button
                  className="absolute bottom-0 right-0 m-1.5 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                  onClick={() => movePhotoRight(index)}
                >
                  <MdChevronRight />
                </button>
              )}
              <TagPanel tags={tags[index]} updateTags={(newTags) => updateTags(index, newTags)} />
            </div>
          ))}
          <div className="w-full text-center py-2 opacity-60">
            Select photos or drag them here. Only .jpg, .jpeg, .png, and .gif files are supported.
          </div>
        </div>
      )}
    </div>
  );
}
