import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DeleteModal from '../components/DeleteModal';

export default function ViewListings() {
  const { currentUser } = useSelector((state) => state.user);
  const [loadListings, setLoadListings] = useState(false);
  const [listingsError, setListingsError] = useState(false);

  const [userListings, setUserListings] = useState([]);
  const [sortType, setSortType] = useState(
    localStorage.getItem(`userListingsSort_${currentUser?._id}`) || 'newest'
  );

  const [deleteModal, setDeleteModal] = useState(false);
  const [listingForDeletion, setListingForDeletion] = useState(null);

  const sortedListings = [...userListings].sort((a,b) => {
    switch (sortType) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'oldest':
        return a._id.localeCompare(b._id);
      case 'newest':
        return b._id.localeCompare(a._id);
      default:
        return 0;
    }
  });

  const handleSortChange = (e) => {
    const selectedValue = e.target.value;
    setSortType(selectedValue);
    localStorage.setItem(`userListingsSort_${currentUser?._id}`, selectedValue);
  };

  const handleDeleteModal = (listing) => {
    setListingForDeletion(listing);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setListingForDeletion(null);
    setDeleteModal(false);
  };

  useEffect(() => {
    const handleShowListings = async () => {
      try {
        setLoadListings(true);
        
        const res = await fetch(`/api/user/listings/${currentUser._id}`, {
          credentials: 'include'
        });
        const data = await res.json();

        if (!res.ok || data.success === false) {
          setListingsError(true);
          setLoadListings(false);
          return;
        }

        setUserListings(data);
        setLoadListings(false);
        setListingsError(false);
      } catch {
        setListingsError(true);
        setLoadListings(false);
      }
    }
    handleShowListings();
  }, [currentUser._id]);

  const handleDeleteListing = async () => {
    try {
      const res = await fetch(`/api/listing/delete/${listingForDeletion._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) => prev.filter((listing) => listing._id !== listingForDeletion._id));

      closeDeleteModal();
    } catch (error) {
      console.log(error.message);
    }
  }
  
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-stone-600 text-3xl font-semibold text-center mt-7'>Property Listings</h1>
      <div className='flex items-end gap-2 mb-2 py-3 max-[425px]:flex-col'>
        <Link to={'/create-listing'} className='w-full'>
          <button className='bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-3 uppercase w-full'>Add New Listing</button>
        </Link>
        <div className='flex flex-col max-[425px]:w-full'>
          <label htmlFor="sortListing" className='font-semibold'>Sort by:</label>
          <select 
            id="sortListing"
            name="sortListing"
            className='border border-gray-300 rounded-lg p-2 cursor-pointer outline-none'
            onChange={handleSortChange}
            value={sortType}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name Ascending</option>
            <option value="name-desc">Name Descending</option>
          </select>  
        </div>
      </div>
      <div className='flex flex-col gap-4 overflow-y-auto h-[450px] bg-white p-3 border border-gray-300 rounded-lg'>
        {loadListings ? (
          <div className='text-slate-600 font-semibold p-3 flex justify-center'>
            Loading...
          </div>
        ) : listingsError ? (
          <div className='text-red-600 font-semibold p-3 flex justify-center'>
            Error fetching listings
          </div>
        ) : userListings.length === 0 ? (
          <div className='text-slate-900 font-semibold p-3 flex justify-center'>
            No listings made. Click 'ADD NEW LISTING' button above to create one.
          </div>
        ) : (
          sortedListings.map((listing) => (
            <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4 max-[425px]:gap-0 max-[425px]:flex-col'>
              <Link to={`/listing/${listing._id}`}>
                <img 
                  src={listing.images[0]?.url}
                  alt="listing cover"
                  className='h-16 w-16 object-contain'
                />
              </Link>
              <Link className='text-slate-900 font-semibold hover:underline truncate flex-1' to={`/listing/${listing._id}`}>
                <p>{listing.name}</p>
              </Link>
              <div className='flex flex-col max-[425px]:flex-row items-center gap-1 max-[425px]:mt-4'>
                <Link to={`/update-listing/${listing._id}`} className='w-full'>
                  <button className='bg-green-700 hover:bg-green-800 text-white rounded-lg py-1 px-2 w-full'>Edit</button>
                </Link>
                <button onClick={() => handleDeleteModal(listing)} className='bg-red-700 hover:bg-red-800 text-white rounded-lg py-1 px-2 w-full'>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
      {deleteModal &&
        <DeleteModal
          title={`Delete listing ${listingForDeletion?.name}`}
          message="Are you sure you want to delete this listing?"
          closeDeleteModal={closeDeleteModal}
          handleDelete={handleDeleteListing}
        />
      }
    </div>
  )
}