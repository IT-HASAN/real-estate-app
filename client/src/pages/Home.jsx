import { useState, useEffect } from 'react';
import { Link} from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);  
  const [rentListings, setRentListings] = useState([]);  
  const [saleListings, setSaleListings] = useState([]);  

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    }
    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    }
    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=4');
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchOfferListings();
  }, []);

  return (
    <div>
      <div className='flex flex-col gap-6 py-28 px-3 max-w-6xl mx-auto'>
        <h1 className='text-stone-600 font-bold text-3xl lg:text-6xl'>
          Find your next <span className='text-stone-400'>perfect</span>
        <br />
        place with ease
        </h1>
        <p className='font-normal text-slate-600 ml-2'>
          MERN Estate will help you to achieve you real estate goals, whether you are looking to buy, sell or rent a property.
        </p>
        <p className='font-normal text-slate-600 ml-2'>
          Create and manage listings for properties to put on sale or rent for others or make use of the search features available to help you find your new home with a wide range of properties to choose from to buy or rent.
        </p>
        <Link to={"/search"} className='w-fit'>
          <button className='bg-slate-700 hover:bg-slate-800 text-white rounded-lg py-1 px-3'>Get started here</button>
        </Link>
      </div>

      <Swiper navigation>
        {offerListings && offerListings.length > 0 &&
        offerListings.map((listing) => (
          <SwiperSlide key={listing._id}>
            <div 
              className='h-[500px] cursor-grab' 
              style={{
                background: `url(${listing.images[0].url}) center no-repeat`, 
                backgroundSize: "cover"
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
        {offerListings && offerListings.length > 0 && (
          <div className="">
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-stone-600'>Recent offers</h2>
              <Link className='text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline' to={'/search?offer=true'}>
                Show more offers
              </Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )} 
        {rentListings && rentListings.length > 0 && (
          <div className="">
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-stone-600'>Recent places for rent</h2>
              <Link className='text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline' to={'/search?type=rent'}>
                Show more places for rent
              </Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )} 
        {saleListings && saleListings.length > 0 && (
          <div className="">
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-stone-600'>Recent places for sale</h2>
              <Link className='text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline' to={'/search?type=sale'}>
                Show more places for sales
              </Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )} 
      </div>
    </div>
  );
}