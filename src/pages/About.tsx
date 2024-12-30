import { Link } from 'react-router-dom';
import useDocumentTitle from '../utils/useDocumentTitle';

export default function About() {
  useDocumentTitle('About — Models @ RIT');

  return (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start gap-10">
        <h1 className="text-5xl sm:text-[8vw] font-serif border-b w-full">About</h1>
        <p className="sm:w-1/2 text-2xl sm:text-3xl font-serif leading-tight">
          Models @ RIT is a platform created by{' '}
          <Link className="underline link" to="https://instagram.com/ritfabrick" target="_blank">
            RIT Fabrick
          </Link>{' '}
          that connects photographers and aspiring models at RIT. Photography students often struggle to find models for
          their assignments and projects, while many students aspire to become models but lack the connections to do so.
        </p>
        <p className="sm:w-1/2 sm:ml-[50%] text-2xl sm:text-3xl font-serif leading-tight">
          This website makes it easy for both photographers and models to connect. Anyone with an rit.edu email can
          create a profile as a model, providing an opportunity to be seen and allowing photographers to use the site as
          a resource for discovering new faces.
        </p>
        <div className="py-10 w-full flex flex-col md:flex-row md:items-end justify-center w-full max-w-3/4 gap-10">
          <img className="w-72 rounded-xl grayscale mix-blend-multiply border" src="images/headshot.jpg" alt="" />
          <div className="w-full max-w-[600px] flex flex-col gap-7">
            <p className="text-3xl sm:text-4xl font-serif">Jacob Yoon, BS/MS Computer Science '25</p>
            <p className="text-md sm:text-lg leading-snug">
              Jacob is a computer science student passionate about fashion, photography, and design. In 2021, he helped
              create <i>RIT Fabrick</i>, a fashion club that brings together students from different majors and
              backgrounds to share their love for fashion. Through his experiences leading the club, he saw a need for a
              platform to connect photographers and aspiring models, as there was no easy way for students to
              collaborate on these kinds of projects. By combining his skills in programming and design, he created{' '}
              <i>Models @ RIT</i>.
            </p>
            <div className="flex flex-row gap-3">
              <Link className="button light" to="mailto:jy9726@rit.edu">
                Email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
