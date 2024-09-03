import { useEffect, useRef, useState } from 'react';
import { User } from '../utils/Types';
import { supabase } from '../supabase';
import ProfilePhoto from './ProfilePhoto';
import { Sizes } from '../utils/Enums';
import { MdAddCircleOutline, MdPerson, MdRemoveCircleOutline } from 'react-icons/md';

interface Props {
  tags: User[];
  updateTags: (tags: User[]) => void;
}

export default function TagPanel({ tags, updateTags }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const addUserToTags = (user: User) => {
    updateTags([...tags, user]);
  };

  const removeUserFromTags = (userToRemove: User) => {
    updateTags(tags.filter((user) => user.user_id !== userToRemove.user_id));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim() === '') {
        setUsers([]);
        return;
      }
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .not('user_id', 'in', `(${tags.map((tag) => tag.user_id).join(',')})`)
        .limit(5);
      if (!error) {
        setUsers(data || []);
      }
    };
    fetchUsers();
  }, [searchQuery, tags]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="absolute" ref={ref}>
      <button
        className="absolute top-0 left-0 m-1.5 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
        onClick={handleToggle}
      >
        <MdPerson />
      </button>
      {isOpen && (
        <div className="absolute border rounded p-3 flex flex-col items-start z-10 shadow-lg bg-background mt-[146px] gap-3">
          <div className="flex items-center gap-2">
            <p className="opacity-60">Tag:</p>
            <input
              className="border rounded"
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Render fetched users */}
          {users && users.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              {users.map((user, index) => (
                <div className={`w-full flex flex-row justify-between items-center`} key={index}>
                  <div className="flex gap-2 items-center">
                    <ProfilePhoto user={user} size={Sizes.sm} />
                    <span>{user.name}</span>
                  </div>
                  <button className="p-1 rounded hover:bg-foreground/10" onClick={() => addUserToTags(user)}>
                    <MdAddCircleOutline className="text-xl" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Render selected tags */}
          {tags && tags.length > 0 && (
            <>
              <hr className="w-full" />
              <p className="opacity-60">Tagged</p>
              <div className="w-full flex flex-col gap-2">
                {tags.map((tag, index) => (
                  <div className="w-full flex flex-row justify-between items-center" key={index}>
                    <div className="flex gap-2 items-center">
                      <ProfilePhoto user={tag} size={Sizes.sm} />
                      <span>{tag.name}</span>
                    </div>
                    <button className="p-1 rounded hover:bg-foreground/10" onClick={() => removeUserFromTags(tag)}>
                      <MdRemoveCircleOutline className="text-xl" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* <button className="button light sm" onClick={() => setIsOpen(false)}>
            Close
          </button> */}
        </div>
      )}
    </div>
  );
}
