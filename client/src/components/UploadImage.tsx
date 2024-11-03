import { useState, useCallback } from 'react';
import ImageUploading, { ImageListType } from "react-images-uploading";
import Cropper from "react-easy-crop";
import { useAuthContext } from "../context/AuthContext";
import { getCroppedImg } from '../utility/cropImage';
import { useToastContext } from '@/hooks/useToast';
import { useConversationContext } from '@/context/ConversationContext';
import Image from './Image';
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog"

interface CroppedAreaPixels {
  x: number;
  y: number;
}

type UploadImageProps = {
  userIdOrConversationId: string | undefined;
  uploadPurpose: 'change_user_avatar' | 'change_group_image';
  imageOf: 'personal' | 'group';
  imageSrc: string | undefined;
}

export default function UploadImage({ uploadPurpose, userIdOrConversationId, imageOf, imageSrc }: UploadImageProps) {

  const { user, dispatch } = useAuthContext();
  const { toast } = useToastContext();
  const { conversationDispatch } = useConversationContext();
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
        title: '',
        description: json.message,
        variant: 'default'
      });

      if (uploadPurpose === 'change_user_avatar') {
        // Update the user avatar in local storage
        user.userAvatar = json.image;
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'UPDATE_LOCAL', payload: user });
      } else {
        conversationDispatch({ type: 'CHANGE_GROUP_AVATAR', payload: { conversationId: userIdOrConversationId!, newGroupAvatar: json.image } });
      };
    } else {
      toast({
        title: "Something went wrong",
        description: json.error,
        variant: 'destructive'
      })
    };
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
    <div>
      <div className="relative h-min">
        <Image className="w-24 rounded-full" imageSource={imageSrc} imageOf={imageOf} />
        <ImageUploading
          multiple={false}
          value={[]}
          acceptType={['jpg', 'png', 'jpeg']}
          onChange={onChange}
          maxNumber={maxNumber}
        >
          {({ onImageUpload }) => (
            <button onClick={onImageUpload} className='bg-gray-600 p-2 rounded-full hover:bg-gray-500 absolute bottom-0 right-0' disabled={userIdOrConversationId === undefined}>
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
              </svg>
            </button>
          )}
        </ImageUploading>
      </div>

      {image && (
        <Dialog open={true}>
          <DialogContent className="max-sm:h-dvh h-5/6">
            <div className="flex flex-col justify-between h-full gap-2">
              <div className='relative h-[80%] mt-6'>

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
              <div className='h-min flex flex-row-reverse gap-2 ml-auto'>
                <button onClick={showCroppedImage} className='text-slate-50 bg-orange-500 rounded-sm py-2 px-5 hover:opacity-80'>Save</button>
                <button onClick={cancelCrop} className='text-orange-500 bg-none border-2 border-orange-500 rounded-sm py-2 px-3 hover:opacity-80'>Cancel</button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
