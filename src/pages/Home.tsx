import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="fade-in">
      <div className="w-full h-screen px-5 py-5 pt-16 flex flex-col justify-end items-start gap-10">
        <h1 className="text-[10vw] font-serif">Models @ RIT</h1>
        <p className="max-w-[600px] text-2xl leading-tight mb-5">
          A platform for connecting photography students and aspiring models within the RIT community.
        </p>
        <div className="text-xl flex flex-row gap-3">
          <Link className="button" to="/community">Explore the community</Link>
          <Link className="button alt" to="/models">Find a model</Link>
        </div>
      </div>
    </div>
  )
}
