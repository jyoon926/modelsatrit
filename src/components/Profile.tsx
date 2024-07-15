import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { supabase } from "../supabase";
import { User } from "../utils/types";
import { Navigate } from "react-router-dom";

export default function Profile() {
  const { session, user, loading } = useAuth();

  if (loading) return <div></div>;

  return (
    <>
      {session ? 
        (user &&
          <div className="fade-in">
            <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
              <h1 className="text-[9vw] font-serif border-b w-full mb-10">{user.display_name}</h1>
            </div>
          </div>
        ) :
        <Navigate to="/"></Navigate>
      }
    </>
  )
}
