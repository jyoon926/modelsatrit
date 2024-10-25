/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { Model } from '../utils/Types';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

export default function Home() {
  const [models, setModels] = useState<Model[]>();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('model').select('*, photos:model_photo(photo(*))');
      if (!error) {
        const reshapedData = data.map((model) => ({ ...model, photos: model.photos.map((item: any) => item.photo) }));
        setModels(reshapedData);
      }
    };

    fetchData();
  }, []);

  const imagesRef = useRef<HTMLDivElement[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const activate = (image: HTMLDivElement, x: number, y: number) => {
      if (image) {
        image.style.left = `${x}px`;
        image.style.top = `${y}px`;
        image.style.zIndex = '' + imageIndex;
        image.classList.remove('opacity-0');
        image.classList.remove('scale-0');
        setLastPosition({ x, y });
      }
    };

    const deactivate = (image: HTMLDivElement) => {
      if (image) image.classList.add('opacity-0');
      if (image) image.classList.add('scale-0');
    };

    const distanceFromLast = (x: number, y: number) => {
      return Math.hypot(x - lastPosition.x, y - lastPosition.y);
    };

    const handleCursorMove = (clientX: number, clientY: number) => {
      if (distanceFromLast(clientX, clientY) > Math.max(window.innerWidth / 30, 20)) {
        const lead = imagesRef.current[imageIndex % imagesRef.current.length];
        const tail =
          imagesRef.current[(imageIndex - Math.min(15, imagesRef.current.length - 1)) % imagesRef.current.length];
        if (lead) activate(lead, clientX, clientY);
        if (tail) deactivate(tail);
        setImageIndex((prevIndex) => prevIndex + 1);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleCursorMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) handleCursorMove(touch.clientX, touch.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [imageIndex, lastPosition]);

  return (
    <div className="fade-in">
      <div className="fixed inset-0 px-5 py-5 pt-16 flex flex-col justify-end items-start gap-10 overscroll-none">
        <h1 className="text-6xl sm:text-[10vw] font-serif">Models @ RIT</h1>
        <p className="max-w-[600px] text-2xl leading-tight mb-5">
          A platform for connecting photography students and aspiring models within the RIT community.
        </p>
        <div className="w-full text-xl flex flex-col sm:flex-row gap-3">
          <Link className="button backdrop-blur" to="/models">
            Find a model
          </Link>
          <Link className="button light backdrop-blur" to="/community">
            Explore the community
          </Link>
        </div>
      </div>
      <div className="fixed top-0 left-0 w-full h-full z-[-1] opacity-70 sepia-[0.1] brightness-[0.9] mix-blend-multiply overflow-hidden">
        {models &&
          models.length > 0 &&
          models?.map(
            (model, index) =>
              model.photos &&
              model.photos.length > 0 && (
                <div
                  className="absolute h-[25vh] sm:h-[35vh] bg-cover bg-no-repeat bg-center rounded-lg opacity-0 scale-0 translate-x-[-50%] translate-y-[-50%] bg-foreground/5"
                  style={{
                    backgroundImage: `url(${model.photos[0].small})`,
                    aspectRatio: '0.75',
                    transition: 'transform 0.5s, opacity 0.5s',
                  }}
                  ref={(el) => {
                    if (el) imagesRef.current[index] = el;
                  }}
                  key={index}
                />
              )
          )}
      </div>
    </div>
  );
}
