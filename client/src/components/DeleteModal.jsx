import { useEffect } from 'react';

export default function DeleteModal({
  title, 
  message,
  closeDeleteModal,
  handleDelete
}) {
  
  // Lock background scrolling when modal is open, unlock when modal closes
  useEffect(() => {
    document.body.classList.add('overflow-y-hidden');
    return () => {
      document.body.classList.remove('overflow-y-hidden');
    };
  }, [])

  return (
    <div className='bg-black/20 fixed inset-0 z-50 w-screen h-screen flex justify-center items-center' >
      <div className='z-10 w-[30%] max-[1024px]:w-[50%] max-[800px]:w-[80%] h-fit flex flex-col items-center justify-start bg-slate-300 shadow-lg rounded-lg'>
        <div className='bg-red-600 p-3 rounded-t-lg w-full'>
          <h1 className='text-xl font-bold text-center text-white'>{title}</h1>
        </div>
        <div className='px-10 pb-3 mt-5'>
          <p className='text-sm'>{message}</p>
          <div className='flex justify-around mt-5 w-full'>
            <button className='bg-slate-700 hover:bg-slate-800 text-white rounded-lg px-2 py-1 uppercase ' onClick={closeDeleteModal}>Cancel</button>
            <button className='bg-red-700 hover:bg-red-800 text-white rounded-lg px-2 py-1 uppercase' onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}