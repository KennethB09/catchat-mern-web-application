import React from 'react';
import blankAvatar from '../assets/avatar/blank avatar.jpg';

interface imageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  alt?: string;
  onClick?: () => void;
  imageSource: string | null | undefined;
  imageOf: "personal" | "group";
}

function Image({ className, alt, imageSource, imageOf, onClick }: imageProps) {

  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

  function check_avatar(image: string, type: string) {

    if (image === undefined) {
      return blankAvatar;
    } else if (base64regex.test(image)) {
      return `data:image/jpeg;base64,${image}`;
    } else {
      if (type === "personal") {
        return `${import.meta.env.VITE_IMAGEKIT_PUBLIC_ENDPOINT}/Users_Avatar/${image}`;
      } else {
        return `${import.meta.env.VITE_IMAGEKIT_PUBLIC_ENDPOINT}/Groups_Avatar/${image}`;
      }
    }
  };

  return (
    <img className={className} src={check_avatar(imageSource!, imageOf)} alt={alt} onClick={onClick}/>
  )
}

export default Image