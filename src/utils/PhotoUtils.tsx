/* eslint-disable @typescript-eslint/no-explicit-any */
import Compressor from 'compressorjs';
import { supabase } from './Supabase';
import { Photo } from './Types';

export const uploadPhoto = async (file: File): Promise<Photo> => {
  const sizes = [
    { label: 'small', quality: 0.7, maxSize: 500 },
    { label: 'medium', quality: 0.75, maxSize: 1000 },
    { label: 'large', quality: 0.8, maxSize: 2000 },
  ];

  const fileName = `${Date.now()}_${file.name.replace("'", '')}`;
  const photo: any = {
    name: fileName,
  };

  const uploadPromises = sizes.map(async (size) => {
    const compressedFile = await new Promise<File | Blob>((resolve, reject) => {
      new Compressor(file, {
        quality: size.quality,
        maxHeight: size.maxSize,
        success(result) {
          resolve(result);
        },
        error(err) {
          reject(err);
        },
      });
    });

    const { error } = await supabase.storage.from('general').upload(`${size.label}/${fileName}`, compressedFile);
    if (error) {
      throw error;
    }

    const publicUrl = supabase.storage.from('general').getPublicUrl(`${size.label}/${fileName}`).data.publicUrl;
    return { label: size.label, url: publicUrl };
  });

  const results = await Promise.all(uploadPromises);

  results.forEach(({ label, url }) => {
    photo[label] = url;
  });

  photo.aspect_ratio = await getImageAspectRatio(file);

  console.log(photo);

  const { data, error } = await supabase.from('photo').insert(photo).select('*').single();
  if (error) {
    throw error;
  }

  return data;
};

export const deletePhoto = async (photo: Photo): Promise<void> => {
  const sizes = ['small', 'medium', 'large'];
  const deletePromises = sizes.map((size) => supabase.storage.from('general').remove([`${size}/${photo.name}`]));
  await Promise.all(deletePromises);
  await supabase.from('photo').delete().eq('id', photo.id);
};

export const getImageAspectRatio = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    // Create a URL for the file
    const url = URL.createObjectURL(file);

    // Create an image element
    const img = new Image();

    img.onload = () => {
      // Calculate aspect ratio
      const aspectRatio = img.width / img.height;

      // Clean up by revoking the URL
      URL.revokeObjectURL(url);

      resolve(aspectRatio);
    };

    img.onerror = () => {
      // Clean up on error
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    // Set the source to start loading
    img.src = url;
  });
};

export const getImageAspectRatioFromUrl = (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const aspectRatio = img.width / img.height;
      resolve(aspectRatio);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image from URL: ${url}`));
    };

    // Handle CORS issues
    img.crossOrigin = "anonymous";
    img.src = url;
  });
};
