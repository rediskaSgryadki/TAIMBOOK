import React from 'react';

const UserPosts = ({ posts }) => {
  return (
    <div className='flex flex-col gap-y-10 px-20'>
      <style>{`
        .user-post-content table, .user-post-content td, .user-post-content th {
          border: 2px solid #444;
          border-collapse: collapse;
        }
        .user-post-content td, .user-post-content th {
          min-width: 40px;
          min-height: 24px;
          padding: 4px;
        }
      `}</style>
      {posts.map((entry, index) => (
        <div key={index} className='bg-white shadow-md dark:bg-neutral-800 h-[55vh] rounded-3xl flex flex-col p-10 relative overflow-hidden'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <img 
                src="/img/Account/design _ idea, thought, mind, innovation, innovative, head.webp" 
                alt="Фото автора" 
                className='w-12 h-12 rounded-full border-2'
              />
              <div>
                <h3 className='text-xl font-semibold'>Имя пользователя</h3>
                <p className='text-sm text-gray-500'>{new Date(entry.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <button className='text-gray-500 hover:text-gray-700'>Лайк</button>
              <button className='text-gray-500 hover:text-gray-700'>Комментарий</button>
            </div>
          </div>
          <p className='text-gray-600 dark:text-gray-300 mb-4' dangerouslySetInnerHTML={{ __html: entry.content }} />
        </div>
      ))}
    </div>
  );
};

export default UserPosts;
