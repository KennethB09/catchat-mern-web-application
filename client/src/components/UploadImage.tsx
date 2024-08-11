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
     

        <ImageUploading
          multiple={false}
          value={[]}
          acceptType={['jpg', 'png']}
          onChange={onChange}
          maxNumber={maxNumber}
        >
          {({ onImageUpload }) => (
            <button onClick={onImageUpload} className='bg-none text-xs'>
              Change Avatar
            </button>
          )}
        </ImageUploading>

 

      {image && (
        <div className='absolute w-screen h-screen top-0 right-0 left-0 z-50 flex flex-col space-y-4 p-2 justify-center bg-black'>

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
        
            <button onClick={showCroppedImage} className='text-slate-50 bg-orange-500 my-2 rounded-sm p-2'>Save</button>
            <button onClick={cancelCrop} className='text-orange-500 bg-none border-2 border-orange-500 my-2 rounded-sm p-2'>Cancel</button>

        </div>
      )}
    </>
  );
}
