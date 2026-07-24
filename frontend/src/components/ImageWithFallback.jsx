import { useEffect, useState } from 'react';

export default function ImageWithFallback({
  src,
  alt,
  fallback,
  className = '',
  imgClassName = '',
  fallbackClassName = '',
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const showImage = Boolean(src) && !hasError;

  return (
    <div className={`overflow-hidden ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-linear-to-br from-cyan-500 to-blue-600 text-slate-950 font-bold uppercase ${fallbackClassName}`}
        >
          {fallback}
        </div>
      )}
    </div>
  );
}