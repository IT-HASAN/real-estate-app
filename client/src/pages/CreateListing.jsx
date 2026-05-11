import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [confirmedFiles, setConfirmedFiles] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    regularPrice: 50,
    discountedPrice: 0,
    bathrooms: 1,
    bedrooms: 1,
    furnished: false,
    parking: false,
    type: 'rent',
    offer: false,
    images: []
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');

  useEffect(() => {
    return () => {
      confirmedFiles.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);
  
  const storeImage = async (imgFile) => {
    const data = new FormData();
    data.append('file', imgFile);
    data.append('type', 'listing');

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: data,
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Image upload failed');
    }

    const result = await res.json();

    return {
      url: result.secure_url,
      path: result.public_id
    };
  };

  const handleChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData((prev) => ({
        ...prev,
        type: e.target.id
      }));
    }

    if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
      setFormData((prev) => ({
        ...prev,
        [e.target.id]: e.target.checked
      }));
    }

    if (e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea') {
      setFormData((prev) => ({
        ...prev,
        [e.target.id]: e.target.value
      }));
    }
  };

  const handleImageChange = (e) => {
    setImageUploadError('');
    
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length === 0) {
      setImageUploadError('You must upload at least one image');
      return;
    }

    if (confirmedFiles.length + selectedFiles.length > 6) {
      setImageUploadError('You can only upload 6 images per listing');
      return;
    }
    
    for (let file of selectedFiles) {
      if (file.size > 2 * 1024 * 1024) {
        setImageUploadError('Image upload failed (2MB max per image)');
        return;
      }
    }

    const filesWithPreview = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setConfirmedFiles((prev) => {
      const newFiles = filesWithPreview.filter(
        (newFile) =>
          !prev.some(
            (f) =>
              f.file.name === newFile.file.name &&
              f.file.size === newFile.file.size
          )
      );

      return [...prev, ...newFiles];
    });

    if (fileRef.current) {
      fileRef.current.value = null;
    }
  };

  const handleRemoveImage = (index) => {
  setConfirmedFiles((prev) => {
    const fileToRemove = prev[index];

    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    return prev.filter((_, i) => i !== index);
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setImageUploadError('');

    if (confirmedFiles.length < 1) {
      return setError('You must upload at least one image');
    }

    if (+formData.regularPrice < +formData.discountedPrice) return setError('Discount price must be lower than regular price');

    let uploadedImages = [];

    try {
      setSubmitting(true);

      for (const { file } of confirmedFiles) {
        const result = await storeImage(file);
        uploadedImages.push(result);
      }

      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          images: uploadedImages,
          userRef: currentUser._id
        })
      });

      const data = await res.json();
    
      if (!res.ok || data.success === false) {
        return setError(data.message || 'Form submission failed');
      }
      
      navigate(`/listing/${data._id}`);
    } catch (error) {
      if (uploadedImages.length > 0) {
        await Promise.allSettled(
          uploadedImages.map(img =>
            fetch('/api/upload/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ public_id: img.path }),
            })
          )
        );
      }

      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type="text"
            placeholder="Name"
            className='border p-3 rounded-lg'
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description"
            className='border p-3 rounded-lg'
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className='border p-3 rounded-lg'
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className='flex gap-6 flex-wrap'>
            <div className='flex gap-2'>
              <input
                type="checkbox"
                id="sale"
                className='w-5'
                onChange={handleChange}
                checked={formData.type === 'sale'}
              />
              <span>Sale</span>
            </div>
            <div className='flex gap-2'>
              <input
                type="checkbox"
                id="rent"
                className='w-5'
                onChange={handleChange}
                checked={formData.type === 'rent'}
              />
              <span>Rent</span>
            </div>
            <div className='flex gap-2'>
              <input
                type="checkbox"
                id="parking"
                className='w-5'
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking</span>
            </div>
            <div className='flex gap-2'>
              <input
                type="checkbox"
                id="furnished"
                className='w-5'
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className='flex gap-2'>
              <input
                type="checkbox"
                id="offer"
                className='w-5'
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center gap-2'>
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className='p-3 border border-gray-300 rounded-lg'
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Bedrooms</p>
            </div>
            <div className='flex items-center gap-2'>
              <input 
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className='p-3 border border-gray-300 rounded-lg'
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Bathrooms</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="10000000"
                required
                className='p-3 border border-gray-300 rounded-lg'
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className='flex flex-col items-center'>
                <p>Regular price</p>
                {formData.type === 'rent' && (
                  <span className='text-xs'>($ / Month)</span>
                )}
              </div>
            </div>
            {formData.offer && (
              <div className='flex items-center gap-2'>
                <input 
                  type="number"
                  id="discountedPrice"
                  min="0"
                  max="5000000"
                  required
                  className='p-3 border border-gray-300 rounded-lg' 
                  onChange={handleChange}
                  value={formData.discountedPrice}
                />
                <div className='flex flex-col items-center'>
                  <p>Discounted price</p>
                  {formData.type === 'rent' && (
                    <span className='text-xs'>($ / Month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>Images:
            <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span>
          </p>
          <div className='flex gap-4'>
            <input 
              onChange={handleImageChange}
              className='p-3 border border-gray-300 rounded w-full'
              type="file"
              id="images"
              accept="image/*"
              multiple
              ref={fileRef}
            />
          </div>
          <p className='text-red-700 text-sm'>{imageUploadError}</p>
          {
            confirmedFiles.length > 0 && 
            confirmedFiles.map((item, index) => (
              <div key={index} className='flex justify-between p-3 border items-center'>
                <img src={item.preview} alt="listing image" className='w-20 h-20 object-contain rounded-lg' />
                <button type="button" onClick={() => handleRemoveImage(index)} className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'>Delete</button>
              </div>
            ))}
          <button disabled={submitting || confirmedFiles.length === 0} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
            {submitting ? 'Creating...' : 'Create listing'}
          </button>
          {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
      </form>
    </main>
  )
}