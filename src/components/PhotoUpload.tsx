import { MdOutlineImage, MdClose, MdChevronLeft, MdChevronRight, MdOutlineFileUpload } from 'react-icons/md';
import { useState, useRef, useMemo } from 'react';
import { useNotification } from './Notification';
import { Photo } from '../utils/Types';
import { uploadPhoto } from '../utils/PhotoUtils';

interface Props {
  bucket: string;
  onUpload: (photos: Photo[]) => Promise<void>;
}

export default function PhotoUpload({ bucket, onUpload }: Props) {
  const { toastPromise } = useNotification();
  const [images, setImages] = useState<File[]>([]);
  const [dragging, setDragging] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);
  const imageUrls = useMemo(() => images.map((image) => URL.createObjectURL(image)), [images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const upload = new Promise<void>(async (resolve, reject) => {
      try {
        const photos = await Promise.all(images.map((file) => uploadPhoto(file)));
        await onUpload(photos);
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
          className={`w-full flex flex-row gap-3 flex-wrap bg-foreground/10 p-3 rounded-lg border ${dragging ? 'border-dashed border-2 border-gray-400' : ''}`}
        >
          {imageUrls.map((image, index) => (
            <div className="relative flex justify-end" key={index}>
              <img className="h-32 w-auto rounded" src={image} alt={`Image ${index + 1}`} draggable="false" />
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
          <div className="w-full py-2 opacity-60 text-center">
            Select photos or drag them here. Only .jpg, .jpeg, and .png files are supported.
          </div>
        </div>
      )}

      <form className="w-full flex flex-row justify-start items-start gap-3" onSubmit={handleSubmit}>
        <label className="button transparent border flex flex-row items-center gap-1" htmlFor="images">
          <MdOutlineImage className="text-xl" />
          Add photos
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
        {images.length > 0 && (
          <button className="button flex flex-row items-center gap-1" type="submit">
            <MdOutlineFileUpload className="text-xl" />
            Upload
          </button>
        )}
      </form>
    </div>
  );
}
