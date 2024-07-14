import { useParams } from "react-router-dom"
import { supabase } from "../supabase"
import { useEffect, useState } from "react"
import { Model } from "../helpers/types"

export default function ModelPage() {
  const { email } = useParams()
  const [model, setModel] = useState<Model>()
  const [displayedPhoto, setDisplayedPhoto] = useState<string>()

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.from('models').select('*, user:users(*)').eq('user.email', email).single()
      if (error) {
        console.error('Error fetching user:', error)
      } else {
        setModel(data)
        setDisplayedPhoto(data.photos[0])
      }
    }

    fetchUser()
  }, [email])

  return (
    <>
      {model &&
        <div className="fade-in">
          <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
            {/* <div className="h-20 w-20 bg-cover bg-center rounded-full" style={{backgroundImage: `url(${model.user.profile_photo})`}} /> */}
            <h1 className="text-[9vw] font-serif border-b w-full mb-10">{model.user.display_name}</h1>
            <div className="flex flex-row gap-10">
              <div className="h-[80vh] bg-cover" style={{backgroundImage: `url(${displayedPhoto})`, aspectRatio: "0.75"}} />
              <div className="flex flex-col justify-start items-start gap-10">
                <div className="flex flex-row flex-wrap gap-3">
                  {model.photos.map(photo => (
                    <div
                      className="h-48 bg-cover hover:opacity-50 duration-300 cursor-pointer"
                      style={{backgroundImage: `url(${photo})`, aspectRatio: "0.75"}}
                      onClick={() => setDisplayedPhoto(photo)}
                      key={photo}>
                    </div>
                  ))}
                </div>
                <div className="w-64 flex flex-col">
                  <div className="flex flex-row justify-between py-2 border-b">
                    <p className="font-bold">Gender</p>
                    <p>{model.gender}</p>
                  </div>
                  <div className="flex flex-row justify-between py-2 border-b">
                    <p className="font-bold">Race</p>
                    <p>{model.race?.join(", ")}</p>
                  </div>
                  <div className="flex flex-row justify-between py-2 border-b">
                    <p className="font-bold">Height</p>
                    <p>{model.height}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </>
  )
}
