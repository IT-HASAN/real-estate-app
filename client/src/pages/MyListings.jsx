import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MyListings() {
  const { currentUser } = useSelector((state) => state.user);
  const [loadListings, setLoadListings] = useState(false);
  const [listingsError, setListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);

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

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.log(error.message);
    }
  }
  
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Your Listings</h1>
      <div className='flex flex-col gap-4 overflow-y-auto h-[450px] bg-white p-3 border rounded-lg'>
        {loadListings ? (
          <div className='text-slate-700 font-semibold p-3 flex justify-center'>
            Loading...
          </div>
        ) : listingsError ? (
          <div className='text-red-700 font-semibold p-3 flex justify-center'>
            Error fetching listings
          </div>
        ) : userListings && userListings.length < 1 ? (
          <div className='text-slate-700 font-semibold p-3 flex justify-center'>
            No listings made. Click button below to create one.
          </div>
        ) : (
          <>
          {userListings.map((listing) => (
            <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'>
              <Link to={`/listing/${listing._id}`}>
                <img 
                  src={listing.images[0]?.url}
                  alt="listing cover"
                  className='h-16 w-16 object-contain'
                />
              </Link>
              <Link className='text-slate-700 font-semibold hover:underline truncate flex-1' to={`/listing/${listing._id}`}>
                <p>{listing.name}</p>
              </Link>
              <div className='flex flex-col items-center gap-1'>
                <Link to={`/update-listing/${listing._id}`} className='w-full'>
                  <button className='bg-green-700 text-white rounded-lg p-1 uppercase hover:opacity-95 w-full'>Edit</button>
                </Link>
                <button onClick={() => handleListingDelete(listing._id)} className='bg-red-700 text-white rounded-lg p-1 uppercase hover:opacity-95 w-full'>Delete</button>
              </div>
            </div>
          ))}
          </>
        )}
      </div>
      <div className='flex justify-center'>
        <Link to={'/create-listing'} className='w-full pt-2'>
          <button className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 w-full'>Add New Listing</button>
        </Link>
      </div>
    </div>
  )
}