import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Link } from "react-router-dom"
import { Photographer } from "../helpers/types"

export default function Photographers() {
  const [photographers, setPhotographers] = useState<Photographer[]>()

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('photographers').select('*, user:users(*)')
      if (error) {
        console.error('Error fetching data:', error)
      } else {
        setPhotographers(data)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
        <h1 className="text-[9vw] font-serif border-b w-full mb-10">Photographers</h1>
        {
          photographers &&
          <div className="w-full grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {photographers.map(photographer => (
              <Link className="w-full" to={`/photographers/${photographer.user.email}`} key={photographer.photographer_id}>
                <div className="w-full bg-cover rounded" style={{backgroundImage: `url(${photographer.photos[0]})`, aspectRatio: "0.75"}}></div>
              </Link>
            ))}
          </div>
        }
      </div>
    </div>
  )
}
