import { Alert, Button, TextInput } from 'flowbite-react'
import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  getStorage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'
import { app } from '../firebase'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import {
  updateStart,
  updateSuccess,
  updateFailure,
} from '../redux/user/userSlice'

const DashProfile = () => {
  const { currentUser } = useSelector((state) => state.user)
  const [imageFile, setImageFile] = useState(null)
  const [imageFileUrl, setImageFileUrl] = useState(null)
  const [imageFileUpoadProgress, setImageFileUploadProgress] = useState(null)
  const [imageFileUploadError, setImageUploadError] = useState(null)
  const [imageFileUploading, setImageFileUploading] = useState(false)
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null)
  const [updateUserError, setUpdateUserError] = useState(null)
  const [formData, setFormData] = useState({})
  // console.log(imageFileUpoadProgress, imageFileUploadError)
  const filePickedRef = useRef()
  const dispatch = useDispatch()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImageFileUrl(URL.createObjectURL(file))
    }
  }
  // console.log(imageFile, imageFileUrl)

  useEffect(() => {
    if (imageFile) {
      uploadImage()
    }
  }, [imageFile])

  const uploadImage = async () => {
    //    service firebase.storage {
    //   match /b/{bucket}/o {
    //     match /{allPaths=**} {
    //       allow read, write: if
    //       request.resource.size < 2 * 1024 * 1024 &&
    //       request.resource.contentType.matches('image/.*')
    //     }
    //   }
    // }
    setImageFileUploading(true)
    setImageUploadError(null)
    const storage = getStorage(app)
    const fileName = new Date().getTime() + imageFile.name
    const storageRef = ref(storage, fileName)
    const uploadTask = uploadBytesResumable(storageRef, imageFile)
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setImageFileUploadProgress(progress.toFixed(0))
      },
      (error) => {
        setImageUploadError(
          'Could not upload image (File must be less than 2MB)'
        )
        setImageFileUploadProgress(null)
        setImageFile(null)
        setImageFileUrl(null)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL)
          setFormData({ ...formData, profilePicture: downloadURL })
          setImageFileUploading(false)
        })
      }
    )
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }
  console.log(formData)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdateUserError(null)
    setUpdateUserSuccess(null)
    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes made')
      return
    }
    if (imageFileUploading) {
      setUpdateUserError('Please wait for image to upload')
      return
    }
    try {
      dispatch(updateStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        dispatch(updateFailure(data.message))
        setUpdateUserError(data.message)
      } else {
        dispatch(updateSuccess(data))
        setUpdateUserSuccess("User's profile updated successfully!")
      }
    } catch (error) {
      dispatch(updateFailure(error.message))
      setUpdateUserError(error.message)
    }
  }

  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <h1 className='my-7 text-center font-semibold text-3xl'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='file'
          accept='image/*'
          onChange={handleImageChange}
          ref={filePickedRef}
          hidden
        />
        <div
          className='relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full'
          onClick={() => filePickedRef.current.click()}
        >
          {imageFileUpoadProgress && (
            <CircularProgressbar
              value={imageFileUpoadProgress || 0}
              text={`${imageFileUpoadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${imageFileUpoadProgress / 100})`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt='user'
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
              imageFileUpoadProgress &&
              imageFileUpoadProgress < 100 &&
              'opacity-60'
            }`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color='failure'>{imageFileUploadError}</Alert>
        )}
        <TextInput
          type='text'
          id='username'
          placeholder='username'
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <TextInput
          type='email'
          id='email'
          placeholder='email'
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <TextInput
          type='password'
          id='password'
          placeholder='password'
          onChange={handleChange}
        />
        <Button type='submit' gradientDuoTone='purpleToBlue' outline>
          Update
        </Button>
      </form>
      <div className='text-red-500 flex justify-between mt-5'>
        <span className='cursor-pointer'>Delete Account</span>
        <span className='cursor-pointer'>Sign Out</span>
      </div>
      {updateUserSuccess && (
        <Alert className='mt-5' color='success'>
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color='failure' className='mt-5'>
          {updateUserError}
        </Alert>
      )}
    </div>
  )
}

export default DashProfile