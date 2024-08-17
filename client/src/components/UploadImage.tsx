import { useState, useCallback } from 'react';
import ImageUploading, { ImageListType } from "react-images-uploading";
import Cropper from "react-easy-crop";
import { useAuthContext } from "../context/AuthContext";
import { getCroppedImg } from '../utility/cropImage';
import { useToastContext } from '@/hooks/useToast';  

interface CroppedAreaPixels {
  x: number;
  y: number;
}

type UploadImageProps = {
  userIdOrConversationId: string | undefined;
  uploadPurpose: 'change_user_avatar' | 'change_group_image';
}

export default function UploadImage({ uploadPurpose, userIdOrConversationId }: UploadImageProps) {

  const { user, dispatch } = useAuthContext();
  const { toast } = useToastContext();
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
      body: JSON.stringify({ userIdOrConversationId, purpose: uploadPurpose, image: croppedImage })
    });

    const json = await response.json();

    if (response.ok) {
      toast({
        title: 'Image Uploaded',
        description: json.message,
        variant:'default'
      })
    }
    else {
      toast({
        title: "Ops, something when't wrong",
        description: json.message,
        variant: 'destructive'
      })
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CroppedAreaPixels) => {
    console.log(croppedArea);
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
      if (uploadPurpose === 'change_user_avatar') {
        // Update the user avatar in local storage
        user.userAvatar = croppedImage.split(',')[1];
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'UPDATE_LOCAL', payload: user });
      }
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
          acceptType={['jpg', 'png', 'jpeg']}
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
