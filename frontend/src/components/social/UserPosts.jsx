import React, { useState } from 'react'

// Assuming post object structure based on previous edits:
// post = { id, title, content, htmlContent, location, date, coverImage, coverPreview, coverImagePath, hashtags, isPublic, author: { name, photo } }
// Note: The API might not return author info directly with the entry. We might need to fetch it separately or rely on the backend including it.
// For now, I'll add placeholders/assumptions for author info based on your original component structure.

const UserPosts = ({ post }) => {
  // Helper function to format hashtags (copied from EntryEditor)
  const formatHashtags = (hashtagsString) => {
    if (!hashtagsString) return [];
    // Assuming hashtags come as a comma-separated string from the API
    return hashtagsString.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);
  };

  // Helper function to get hashtag color class (simplified, adjust if needed)
  const getHashtagColorClass = (tag) => {
    return 'text-gray-600 dark:text-gray-300'; // Using a consistent color for now
  };

  // Assuming post might have an author property with name and photo, or use placeholders
  const authorName = post?.author?.name || 'Имя пользователя';
  const authorPhoto = post?.author?.photo || '/default-avatar.png'; // Добавлен дефолтный аватар

  // State for full image view
  const [showFullCover, setShowFullCover] = useState(false);
  const [fullCoverUrl, setFullCoverUrl] = useState('');

  const handleCoverClick = (imageUrl) => {
    setFullCoverUrl(imageUrl);
    setShowFullCover(true);
  };

  const closeFullCover = () => {
    setShowFullCover(false);
    setFullCoverUrl('');
  };

  return (
    <section className='px-20 flex justify-center'>
      <div className='card px-10 py-10 w-1/2 h-[80vh] rounded-3xl space-y-10'>

        {/* Author Info - Reverting to original top position */}
        <div className='flex justify-between items-center'>
          {/* Using authorPhoto and authorName from assumed post structure */}
          <img
            src={authorPhoto}
            alt="user_photo"
            className='w-10 h-10 rounded-full object-cover'
            onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
          />
          <h2 className='zag tracking-widest'>{authorName}</h2>
        </div>

        {/* Title and Date - Placing above the cover photo as requested */}
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-bold'>{post.title || 'Без заголовка'}</h2>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {post.date ? new Date(post.date).toLocaleDateString() : 'Без даты'}
          </p>
        </div>

        {/* Cover Image - Now clickable */}
        {post.cover_image && (
          <div className="cursor-pointer" onClick={() => handleCoverClick(post.cover_image)}>
            <img src={post.cover_image} alt={post.title || 'Cover image'} className='w-full h-96 object-cover rounded-3xl' />
          </div>
        )}

        {/* Post Content */}
        <div className="overflow-x-auto">
          <div className="prose dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: post.content || 'Нет содержимого' }}
            />
          </div>
        </div>

        {/* Likes, Comments, Details Button - Keeping this section */}
        <div className='flex justify-between w-full rounded-2xl px-5 py-5 fon'>
          <div className='space-x-5 flex'>
            <div className='flex items-center'>
              <button className='text-2xl'>❤️</button>
              <p> - 0</p>{/* Placeholder for like count */}
            </div>
            <div className='flex items-center'>
              <button className='text-2xl'>💬</button>
              <p> - 0</p>{/* Placeholder for comment count */}
            </div>
          </div>
          {post.id && (
            // Link to full post details - assuming a route exists like /social/post/:id
            <button onClick={() => console.log('Navigate to post', post.id)}>Подробнее</button>
          )}
        </div>

        {/* Hashtags and Location - Reverting to original bottom position */}
        <div className='flex justify-between items-center'>
          {/* Display hashtags */}
          <div className='flex items-center overflow-hidden flex-1 mr-3'>
            {formatHashtags(post.hashtags).length > 0 && (
              <div className='flex items-center flex-nowrap overflow-hidden'>
                {formatHashtags(post.hashtags).map((tag, index) => (
                  <span
                    key={index}
                    className={`text-xs whitespace-nowrap mr-2 ${getHashtagColorClass(tag)}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Display location */}
          {post.location && (
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              📍 {post.location.name || `${post.location.latitude?.toFixed(2)}, ${post.location.longitude?.toFixed(2)}`}
            </p>
          )}
        </div>

      </div>

      {/* Full Screen Image Modal */}
      {showFullCover && fullCoverUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeFullCover} // Close on clicking outside the image
        >
          <div className="max-w-full max-h-full overflow-hidden">
            <img src={fullCoverUrl} alt="Full size cover image" className="max-w-full max-h-full object-contain" />
          </div>
           {/* Optional: Add a dedicated close button */}
          {/* <button
            className="absolute top-4 right-4 text-white text-2xl font-bold"
            onClick={closeFullCover}
          >
            &times;
          </button> */}
        </div>
      )}
    </section>
  )
}

export default UserPosts