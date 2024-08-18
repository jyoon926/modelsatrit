import { MdOutlineImage, MdClose, MdOutlineFileDownload, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useState, useRef, useMemo } from 'react';
import { supabase } from '../supabase';
import Compressor from 'compressorjs';
import { useNotification } from './Notification';

interface Props {
  onUpload: (photos: string[]) => Promise<void>;
}

export default function PhotoUpload({ onUpload }: Props) {
  const { toastPromise } = useNotification();
  const [images, setImages] = useState<File[]>([]);
  const [dragging, setDragging] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);
  const imageUrls = useMemo(() => images.map((image) => URL.createObjectURL(image)), [images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Compress and upload images
    const upload = new Promise<void>(async (resolve, reject) => {
      try {
        const uploadedImageUrls: string[] = await Promise.all(images.map(compressAndUploadImage));
        await onUpload(uploadedImageUrls);
        setImages([]);
        resolve();
      } catch (e) {
        reject();
      }
    });
    toastPromise(upload, {
      pending: 'Uploading photos...',
      success: 'Photos were uploaded successfully!',
      error: 'Upload failed.',
    });
  };

  const compressAndUploadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.75,
        maxWidth: 1200,
        async success(result) {
          const fileName = `${Date.now()}_${file.name.replace("'", '')}`;
          const { error } = await supabase.storage.from('general').upload(fileName, result);
          if (error) {
            reject(error);
          } else {
            const publicUrl = supabase.storage.from('general').getPublicUrl(fileName).data.publicUrl;
            resolve(publicUrl);
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
        ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
      );
      setImages([...images, ...validFiles]);
      e.dataTransfer.clearData();
    }
  };

  const movePhotoRight = (index: number) => {
    let updatedImages = [...images];
    const img = images[index];
    updatedImages[index] = images[index + 1];
    updatedImages[index + 1] = img;
    setImages(updatedImages);
  };

  const movePhotoLeft = (index: number) => {
    let updatedImages = [...images];
    const img = images[index];
    updatedImages[index] = images[index - 1];
    updatedImages[index - 1] = img;
    setImages(updatedImages);
  };

  return (
    <div
      className="flex flex-col justify-start items-start gap-5"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
            </div>
          ))}
          <div className="w-full flex flex-row justify-center items-center py-2 gap-2">
            <MdOutlineFileDownload className="text-2xl opacity-60" />
            <p className="opacity-60">
              Select photos or drag them here. Only .jpg, .jpeg, and .png files are supported.
            </p>
          </div>
        </div>
      )}

      <form className="w-full flex flex-col justify-start items-start gap-3" onSubmit={handleSubmit}>
        <label className="button transparent border sm flex flex-row items-center gap-1" htmlFor="images">
          <MdOutlineImage className="text-2xl" />
          Select photos
          <input
            className="hidden"
            type="file"
            name="images"
            accept=".jpeg, .jpg, .png"
            onChange={handleImagesChange}
            id="images"
            multiple
          />
        </label>
        <button className="button" type="submit">
          Upload
        </button>
      </form>
    </div>
  );
}
