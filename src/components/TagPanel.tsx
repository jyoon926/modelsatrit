import { useEffect, useState } from 'react';
import { Tag, User } from '../utils/Types';
import { supabase } from '../supabase';

interface Props {
  index: number;
  onClose: () => void;
}

export default function TagPanel({ index, onClose }: Props) {
  const [tags, setTags] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim() === '') {
        setUsers([]);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*') // Select the fields you need
        .ilike('name', `%${searchQuery}%`);

      if (!error) {
        setUsers(data || []);
      }
    };

    fetchUsers();
  }, [searchQuery]);

  const addUserToTags = (user: User) => {
    setTags((prevTags) => [...prevTags, user]);
  };

  return (
    <div className="absolute border rounded p-3 flex flex-col items-start z-10 shadow-lg bg-background mt-[176px] gap-3">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-3 p-2 border rounded"
      />
      {/* Render fetched users */}
      <div className="mb-3">
        {users.map((user) => (
          <div key={user.user_id} className="flex justify-between items-center mb-2">
            <span>{user.name}</span>
            <button className="button light sm" onClick={() => addUserToTags(user)}>
              Add
            </button>
          </div>
        ))}
      </div>
      {/* Render selected tags */}
      <div className="mb-3">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center gap-2">
            <span>{tag.name}</span>
          </div>
        ))}
      </div>
      <button className="button light sm" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
