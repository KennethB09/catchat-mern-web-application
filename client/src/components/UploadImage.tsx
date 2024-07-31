import { useState, useCallback } from 'react';
import ImageUploading, { ImageListType } from "react-images-uploading";
import Cropper from "react-easy-crop";
import { useAuthContext } from "../context/AuthContext";
import { getCroppedImg } from '../utility/cropImage';

interface CroppedAreaPixels {
  x: number;
  y: number;
}

export default function UploadImage() {

  const { user, dispatch } = useAuthContext();
  const maxNumber = 69;
  const [image, setImage] = useState<ImageListType | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);

  const handleImageUpload = async (croppedImage: string) => {

    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/post-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.userId, purpose: 'change/upload avatar', image: croppedImage })
    });

    const json = await response.json();

    if (response.ok) {
      console.log(json)
    }
    else {
      console.log('Error uploading image')
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CroppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        image![0].dataURL!,
        croppedAreaPixels
      );
      // Here you can send croppedImage to your backend
      handleImageUpload(croppedImage);
      // Update the user avatar in local storage
      user.userAvatar = croppedImage.split(',')[1];
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'UPDATE_LOCAL', payload: user });
      // Reset the value of image to null
      setImage(null);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels]);

  const cancelCrop = () => {
    setImage(null)
  }

  const onChange = (imageList: ImageListType) => {
    setImage(imageList);
  };

  return (
    <>
      <div className="ml-12 bottom-0 absolute">
        <ImageUploading
          multiple={false}
          value={[]}
          acceptType={['jpg', 'png']}
          onChange={onChange}
          maxNumber={maxNumber}
        >
          {({ onImageUpload }) => (
            <button onClick={onImageUpload} className='ml-1 mb-2 p-1 bg-tertiary rounded-full'>
              <svg className='w-4 h-4' xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
              </svg>
            </button>
          )}
        </ImageUploading>

      </div>

      {image && (
        <div className='absolute w-screen h-screen top-0 flex flex-col space-y-4 justify-center bg-black'>
          <div className='relative h-4/5'>

            <Cropper
              image={image[0].dataURL}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
        
            <button onClick={showCroppedImage} className='text-primary bg-tertiary'>save</button>
            <button onClick={cancelCrop} className='text-primary bg-tertiary'>cancel</button>
        </div>
      )}
    </>
  );
}
