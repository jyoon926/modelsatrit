import { useEffect, useState } from "react";
import { useAuth } from "../helpers/AuthContext";
import { supabase } from "../supabase";
import { User } from "../helpers/types";
import { Navigate } from "react-router-dom";

export default function Profile() {
  const { session, loading } = useAuth();
  const [profile, setProfile] = useState<User>();

  useEffect(() => {
    const fetchUser = async () => {
      if (session) {
        const { data, error } = await supabase.from('users').select('*').eq('email', session.user.email).single();
        if (error) {
          console.error('Error fetching user:', error);
        } else {
          setProfile(data);
        }
      }
    };

    fetchUser();
  }, [session]);

  if (loading) return <div></div>;

  return (
    <>
      {session ? 
        (profile &&
          <div className="fade-in">
            <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
              <h1 className="text-[9vw] font-serif border-b w-full mb-10">{profile.display_name}</h1>
            </div>
          </div>
        ) :
        <Navigate to="/"></Navigate>
      }
    </>
  )
}
