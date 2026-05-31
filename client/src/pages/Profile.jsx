import { useSelector, useDispatch } from 'react-redux';
import { useRef, useState, useEffect, useCallback } from 'react';
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess } from '../redux/user/userSlice';
import { Link } from 'react-router-dom';

export default function Profile() {
  const imgFileRef = useRef(null);
  const dispatch = useDispatch();
  
  const { currentUser, loading, error } = useSelector((state) => state.user);
  
  const [imgFile, setImgFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email
  });

  const [fileUploading, setFileUploading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState('');
  const [fileUploadSuccess, setFileUploadSuccess] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  const uploadImage = async (imgFile) => {
    const data = new FormData();
    data.append('file', imgFile);
    data.append('type', 'user');

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: data,
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Upload failed');
    }

    return await res.json();
  };

  const handleFileUpload = useCallback(async (imgFile) => {
    const result = await uploadImage(imgFile);
    return result;
  }, []);

  useEffect(() => {
    if (!imgFile)  return;

    let latestUpload = true;

    const runUpload = async () => {
      if (imgFile.size > 2 * 1024 * 1024) {
        setFileUploadError('Image must be less than 2MB');
        setFileUploading(false);
        return;
      } 

      try {
        setFileUploadError('');
        setFileUploadSuccess('');

        const result = await handleFileUpload(imgFile);
        if (!latestUpload) return;
      
        const res = await fetch(`/api/user/update/${currentUser._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            avatar: result.secure_url,
            avatarPublicId: result.public_id
          })
        });

        const data = await res.json();
        if (!latestUpload) return;

        if (!res.ok || data.success === false) {
          throw new Error(data.message || 'Failed to save profile image');
        }

        dispatch(updateUserSuccess(data));

        setFileUploadSuccess('Image uploaded successfully');
        setPreviewUrl(null);
        setImgFile(null);

        if (imgFileRef.current) {
          imgFileRef.current.value = null;
        }
      } catch {
        if (latestUpload) {
          setFileUploading(false);
          setFileUploadError('Error uploading image');
        }
      } finally {
        if (latestUpload) {
          setFileUploading(false);
        }
      }
    };

    runUpload();

    return () => {
      latestUpload = false;
    };
  }, [imgFile, handleFileUpload, currentUser._id, dispatch]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!fileUploadSuccess) return;

    const timer = setTimeout(() => {
      setFileUploadSuccess('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [fileUploadSuccess]);
  
  useEffect(() => {
    if (!updateSuccess) return;

    const timer = setTimeout(() => {
      setUpdateSuccess('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [updateSuccess]);

  const handleChange = (e) => {
    setFormData((prev) => ({ 
      ...prev, 
      [e.target.id]: e.target.value 
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = formData.username.trim();
    const email = formData.email.trim();

    if (!username || !email) {
      return;
    }

    try {
      dispatch(updateUserStart());

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          username,
          email
        })
      });

      const data = await res.json();
      
      if (!res.ok || data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));

      setUpdateSuccess('Profile updated successfully');
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      
      const res = await fetch(`/api/user/delete/${currentUser._id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>User Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input 
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              setFileUploading(true);
              setFileUploadError('');
              setFileUploadSuccess('');
              setPreviewUrl(URL.createObjectURL(file));
              setImgFile(file);
            }} 
            type="file" ref={imgFileRef} hidden accept="image/*" 
          />
          <img onClick={() => {
              if (!fileUploading && imgFileRef.current) {
                imgFileRef.current.value = null;
                imgFileRef.current.click();
              }
            }}  
            src={previewUrl || currentUser.avatar || '/default-avatar.png'} 
            alt="user profile picture"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/default-avatar.png';
            }}
            className={`rounded-full h-28 w-28 object-cover self-center mt-0 ${fileUploading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
          />
          <p className='text-sm self-center font-semibold'>
            {fileUploading ? (
              <span className='text-slate-700'>Uploading...</span>
            ) : fileUploadError !== '' ? (
              <span className='text-red-700'>{fileUploadError}</span>
            ) : fileUploadSuccess !== '' ? (
              <span className='text-green-700'>{fileUploadSuccess}</span>
            ) : (
              <span>Click image to change</span>
            )}
          </p>
          <input 
            type="text"
            placeholder="username"
            value={formData.username}
            id="username"
            className='border p-3 rounded-lg focus:outline-none'
            onChange={handleChange}
          />
          <input
            type="email"
            placeholder="email"
            value={formData.email}
            id="email"
            className='border p-3 rounded-lg focus:outline-none'
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="password"
            id="password"
            className='border p-3 rounded-lg focus:outline-none'
            onChange={handleChange}
          />
          <button
          disabled={loading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
      </form>
      <button onClick={handleDeleteUser} className='bg-red-700 text-white rounded-lg mt-5 p-3 uppercase hover:opacity-95 disabled:opacity-80 w-full'>
        Delete account
      </button>
      {error &&
        <div className='text-sm text-center font-semibold p-3 w-full text-red-700'>
          {error}
        </div>
      }
      {updateSuccess !== '' && 
        <div className='text-sm text-center font-semibold p-3 w-full text-green-700'>
          {updateSuccess}
        </div>
      }
    </div>
  );
}