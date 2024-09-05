import Compressor from 'compressorjs';
import { supabase } from '../supabase';
import { Photo } from './Types';

export const uploadPhoto = async (file: File): Promise<Photo> => {
  const sizes = [
    { label: 'small', quality: 0.8, maxSize: 500 },
    { label: 'medium', quality: 0.8, maxSize: 1000 },
    { label: 'large', quality: 0.8, maxSize: 2000 },
  ];

  const fileName = `${Date.now()}_${file.name.replace("'", '')}`;
  const photo: any = {
    name: fileName,
  };

  try {
    const uploadPromises = sizes.map(async (size) => {
      const compressedFile = await new Promise<File | Blob>((resolve, reject) => {
        new Compressor(file, {
          quality: size.quality,
          maxWidth: size.maxSize,
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

    const { data, error } = await supabase.from('photo').insert(photo).select('*').single();
    if (error) {
      throw error;
    }

    return data;
  } catch (e) {
    throw e;
  }
};

export const deletePhoto = async (photo: Photo): Promise<void> => {
  const sizes = ['small', 'medium', 'large'];
  try {
    const deletePromises = sizes.map((size) => supabase.storage.from('general').remove([`${size}/${photo.name}`]));
    await Promise.all(deletePromises);
    await supabase.from('photo').delete().eq('id', photo.id);
  } catch (error) {
    throw error;
  }
};
