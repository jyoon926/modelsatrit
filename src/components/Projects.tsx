import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Link } from "react-router-dom"
import { Project } from "../helpers/types"

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>()

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('projects').select('*, photographer:photographers(*)')
      if (error) {
        console.error('Error fetching data:', error)
      } else {
        setProjects(data)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
        <h1 className="text-[9vw] font-serif border-b w-full mb-10">Projects</h1>
        {
          projects &&
          <div className="w-full grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {projects.map(project => (
              <Link className="w-full" to={`/projects/${project.project_id}`} key={project.project_id}>
                <div className="w-full bg-cover rounded" style={{backgroundImage: `url(${project.photos[0]})`, aspectRatio: "0.75"}}></div>
              </Link>
            ))}
          </div>
        }
      </div>
    </div>
  )
}
