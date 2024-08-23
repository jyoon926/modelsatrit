import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import ProfilePhoto from './ProfilePhoto';
import { supabase } from '../supabase';
import Compressor from 'compressorjs';
import { MdClose, MdOutlineFileDownload, MdOutlineImage } from 'react-icons/md';
import { Post } from '../utils/Types';
import AutoTextArea from './AutoTextArea';

interface Props {
  onCreate: (post: Post) => void;
}

export default function PostCreateCard({ onCreate }: Props) {
  const { user } = useAuth();
  const [caption, setCaption] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [dragging, setDragging] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);
  const imageUrls = useMemo(() => images.map((image) => URL.createObjectURL(image)), [images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Compress and upload images
    const uploadedImageUrls: string[] = await Promise.all(images.map(compressAndUploadImage));

    const { data, error } = await supabase
      .from('posts')
      .insert([{ user_id: user!.user_id, caption, photos: uploadedImageUrls }])
      .select('*, user:users(*), likes:likes(*)')
      .single();

    if (!error && data) {
      setCaption('');
      setImages([]);
      onCreate(data as Post);
    }
  };

  const compressAndUploadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.75,
        maxWidth: 1200,
        async success(result) {
          const fileName = `${Date.now()}_${file.name.replace("'", '')}`;
          const { error } = await supabase.storage.from('posts').upload(fileName, result);
          if (error) {
            reject(error);
          } else {
            const publicUrl = supabase.storage.from('posts').getPublicUrl(fileName).data.publicUrl;
            resolve(publicUrl);
          }
        },
        error(err) {
          reject(err);
        },
      });
    });
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
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
      e.dataTransfer.clearData();
    }
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
        <AutoTextArea value={caption} placeholder="Create a new post..." onChange={handleCaptionChange} maxRows={15} />

        {/* Attach images button */}
        <label className="p-2 cursor-pointer duration-300 hover:bg-foreground/10 rounded" htmlFor="images">
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
          className={`w-full flex flex-row gap-3 flex-wrap bg-foreground/10 p-3 rounded-xl border ${dragging ? 'border-dashed border-2 border-gray-400' : ''}`}
        >
          {imageUrls.map((image, index) => (
            <div className="relative flex justify-end" key={index}>
              <img className="h-32 w-auto rounded-lg" src={image} alt={`Image ${index + 1}`} draggable="false" />
              <button
                className="absolute top-0 right-0 m-1.5 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                onClick={() => handleDeleteImage(index)}
              >
                <MdClose />
              </button>
            </div>
          ))}
          <div className="w-full flex flex-row justify-center items-center py-2 gap-2">
            <MdOutlineFileDownload className="text-2xl opacity-60" />
            <p className="opacity-60">
              Select photos or drag them here. Only .jpg, .jpeg, .png, and .gif files are supported.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
