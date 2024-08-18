import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start gap-6">
        <h1 className="text-5xl sm:text-[10vw] font-serif">404</h1>
        <p className="text-2xl mb-6">Oops! Something went wrong.</p>
        <Link className="button" to="/">
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
