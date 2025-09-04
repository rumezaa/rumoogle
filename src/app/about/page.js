import Link from "next/link";
export default function About() {
  return (
    <div className=" flex flex-col w-full md:flex-row-reverse h-full items-center gap-x-10 gap-y-10 justify-center pb-10 md:pb-0">
      <div className="flex flex-col font-ropaSans w-4/5 md:w-2/5 lg:w-1/3 font-bold text-md text-white gap-y-4">
        <h2 className="text-accent-text opacity-70">RUMEZA FATIMA</h2>
        <h2>
          I'm a computer science and data science student who loves building
          things for humans.
        </h2>

        <h2>
          I'm advanced in{" "}
          <span className="text-[#DED7FC] italic ">
            Python and JS/TS with a lot of experience in full-stack mobile and
            web development
          </span>{" "}
          as well as a mastery of turning designs into code. My most epic skillset lies in the fact that I consistently push the boundaries of coventional thinking to turn my ambitious visions into reality.
        </h2>

        <h2>
          This past year, I worked as a Health Interfaces Development Intern at{" "}
          <span className="text-[#DED7FC] hover:opacity-70  transform transition-all duration-300">
            <Link href={"https://www.symbioticai.ca/"} target={"_blank"}>
              Symbiotic AI
            </Link>
          </span>{" "}
          , a health tech startup using AI-driven medical insights to help
          doctors approach revascularization decision for patients suffering from cronery artery disease, and as a Production Engineer at{" "}
          <span className="text-[#DED7FC] hover:opacity-70  transform transition-all duration-300">
            <Link href={"https://mlh.io/"} target={"_blank"}>
             Meta x MLH.
            </Link>
          </span>{" "}
          I won over $300K in scholarships. I have a tradition of building at
          least one large-scale project every year, this year I’m founding{" "}
          <span>
            <Link
              className="inline-flex items-center hover:underline hover:opacity-70 text-[#DED7FC] transform transition-all duration-300 gap-x-1"
              href="https://www.jointhearchive.com/"
            >
              The Archive
              <div
                className="bg-no-repeat bg-cover w-4 h-4"
                style={{ backgroundImage: `url("icons/link.svg")` }}
              />
            </Link>
          </span>, a project that is so  <span className="italic">me</span>
          
        </h2>

        <h2>
          I love chasing after unique experiences and jumping off (imaginary)
          cliffs to test my skills.
        </h2>

        <Link
          href="/search?q=rumezas-projects"
          className="border border-[#DED7FC] flex flex-row w-full items-center justify-center rounded-md p-4 hover:bg-[#DED7FC] hover:text-dark-purple-100 transform transition-all duration-300"
        >
          discover my projects
        </Link>
      </div>
      <div className="flex md:flex-col-reverse items-center justify-start">
        <div
          className="bg-no-repeat bg-cover w-48 h-12 md:w-72 md:h-24 bg-left"
          style={{ backgroundImage: `url("signature.png")` }}
        />
        <div
          className="bg-no-repeat bg-cover w-32 h-32 md:w-48 md:h-48"
          style={{ backgroundImage: `url("head-shot.png")` }}
        />
      </div>
    </div>
  );
}
