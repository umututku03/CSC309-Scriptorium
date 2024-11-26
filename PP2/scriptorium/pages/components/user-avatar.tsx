import { useState } from 'react';

interface UserAvatarProps {
  user: {
    firstName: string;
    avatar?: string;
  };
}

export default function UserAvatar({ user }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  if (!imageError && user.avatar) {
    return (
      <div className="w-6 h-6 rounded-full overflow-hidden">
        <img
          src={user.avatar}
          alt={`${user.firstName}'s avatar`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs">
      {user.firstName[0]}
    </div>
  );
}
