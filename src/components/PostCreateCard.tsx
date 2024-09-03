import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../supabase';
import ProfilePhoto from './ProfilePhoto';
import Compressor from 'compressorjs';
import { MdChevronLeft, MdChevronRight, MdClose, MdOutlineImage } from 'react-icons/md';
import { Post, User } from '../utils/Types';
import AutoTextArea from './AutoTextArea';
import TagPanel from './TagPanel';
import { useNotification } from './Notification';

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
      // Compress and upload images
      const uploadedImages = await Promise.all(images.map(compressAndUploadImage));
      const photos = uploadedImages.map((image) => image.name);
      const photo_urls = uploadedImages.map((image) => image.url);

      const { data, error } = await supabase
        .from('posts')
        .insert([{ user_id: user.user_id, caption, photos, photo_urls }])
        .select('*, user:users(*), likes:likes(*)')
        .single();

      if (!error && data) {
        tags.map((photo, index) =>
          photo.map(
            async (tag) =>
              await supabase.from('tags').insert([{ post_id: data.post_id, user_id: tag.user_id, photo_index: index }])
          )
        );
        setCaption('');
        setImages([]);
        setTags([]);
        onCreate(data as Post);
        resolve();
      } else {
        reject();
      }
    });

    toastPromise(promise, {
      pending: 'Creating post...',
      success: 'Post was created successfully!',
      error: 'Failed to create post.',
    });
  };

  const compressAndUploadImage = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 1200,
        async success(result) {
          const fileName = `${Date.now()}_${file.name.replace("'", '')}`;
          const { error } = await supabase.storage.from('posts').upload(fileName, result);
          if (error) {
            reject(error);
          } else {
            const { data } = supabase.storage.from('posts').getPublicUrl(fileName);
            resolve({ name: fileName, url: data.publicUrl });
          }
        },
        error(err) {
          reject(err);
        },
      });
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
