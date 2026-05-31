import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { signOutUserStart, signOutUserFailure, signOutUserSuccess } from '../redux/user/userSlice';

export default function Header() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const [menuClicked, setMenuClicked] = useState(false);
  const handleMenuClicked = () => setMenuClicked(!menuClicked);
  const closeMenu = () => setMenuClicked(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);
  
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      
      const res = await fetch(`/api/auth/signout`, {
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  }

  return (
    <header className='bg-slate-200 shadow-md'>
      <div className='flex justify-between items-center max-w-6xl mx-auto p-3 relative'>
        <Link to="/">
        <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
          <span className='text-slate-500'>Real</span>
          <span className='text-slate-700'>Estate</span>
        </h1>
        </Link>
        <form onSubmit={handleSubmit} className='bg-slate-100 p-3 rounded-lg flex items-center'>
          <input 
            type="text"
            placeholder="Search..."
            className='bg-transparent focus:outline-none w-24 sm:w-64'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className='text-slate-600' />
          </button>
        </form>
        <div className='w-fit h-fit'>
          {currentUser ? (
            <img className='rounded-full h-7 w-7 object-cover cursor-pointer' src={currentUser.avatar} alt="profile" onClick={handleMenuClicked} />
          ) : (
            <Link to="/sign-in">
              <button className='bg-slate-700 text-white rounded-lg py-1 px-2 hover:opacity-95'>Sign in</button>
            </Link>
          )}
        </div>
        <div className={menuClicked ? 'absolute top-[100%] right-0 z-[5] rounded-lg bg-slate-200 shadow-md' : 'hidden'} onMouseLeave={closeMenu}>
          {currentUser ? (
          <div className='flex flex-col p-2'>
            <img className='rounded-full h-8 w-8 object-cover self-center' src={currentUser.avatar} alt="user profile picture" />
            <span className='text-sm text-slate-700 text-center font-semibold'>{currentUser.username}</span>
            <span className='text-xs text-slate-700 text-center'>{currentUser.email}</span>
          </div>) : (
            <></>
          )}
          <ul>
            <Link to="/profile">
              <li className='text-slate-700 text-sm hover:bg-slate-300 p-2 border-t-slate-300 border-t-[1px]' onClick={closeMenu}>User Profile</li>
            </Link>
            <Link to="/view-listings">
              <li className='text-slate-700 text-sm hover:bg-slate-300 p-2 border-b-slate-300 border-b-[1px]' onClick={closeMenu}>Property Listings</li>
            </Link>
              <li className='text-slate-700 text-sm hover:bg-slate-300 p-2 cursor-pointer' onClick={handleSignOut}>Sign out</li>
          </ul>
        </div>
      </div>
    </header>
  );
}