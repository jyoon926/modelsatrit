import { useParams } from "react-router-dom"
import { supabase } from "../supabase"
import { useEffect, useState } from "react"
import { Photographer } from "../helpers/types"

export default function PhotographerPage() {
  const { email } = useParams()
  const [photographer, setPhotographer] = useState<Photographer>()
  const [displayedPhoto, setDisplayedPhoto] = useState<string>()

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.from('photographers').select('*, user:users(*)').eq('user.email', email).single()
      if (error) {
        console.error('Error fetching user:', error)
      } else {
        setPhotographer(data)
        setDisplayedPhoto(data.photos[0])
      }
    }

    fetchUser()
  }, [email])

  return (
    <>
      {photographer &&
        <div className="fade-in">
          <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
            <h1 className="text-[9vw] font-serif border-b w-full mb-10">{photographer.user.display_name}</h1>
            <div className="flex flex-row gap-10">
              <div className="h-[80vh] bg-cover" style={{backgroundImage: `url(${displayedPhoto})`, aspectRatio: "0.75"}} />
              <div className="flex flex-col justify-start items-start gap-10">
                <div className="flex flex-row flex-wrap gap-3">
                  {photographer.photos.map(photo => (
                    <div
                      className="h-48 bg-cover hover:opacity-50 duration-300 cursor-pointer"
                      style={{backgroundImage: `url(${photo})`, aspectRatio: "0.75"}}
                      onClick={() => setDisplayedPhoto(photo)}
                      key={photo}>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </>
  )
}
