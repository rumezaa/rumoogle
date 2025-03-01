"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import projects from "../../data/projects.json";
import experiences from "../../data/experience.json";
import life from "../../data/life.json";
import whyHire from "../../data/why.json";
import Image from "next/image";

export default function Search() {
  const [isHover, setIsHover] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");
  const project = searchParams.get("p");
  const [selectedSearch, setSelectedSearch] = useState(
    project === "meetmidway"
      ? projects.find((proj) => proj.alias === "meetmidway")
      : ""
  );
  const displayQuery = query ? query : "";
  const displayData =
    (displayQuery == "rumezas-projects" && [...projects]?.reverse()) ||
    (displayQuery == "experience" && experiences) ||
    (displayQuery == "life" && [...life]?.reverse()) ||
    (displayQuery == "why-hire-a-rumeza" && whyHire);

  const [showMore, setShowMore] = useState(false);
  const [isOpen, setIsOpen] = useState(project === "meetmidway" ? true : false);
  const languages = [
    "Python",
    "Java",
    "C++",
    "JavaScript",
    "Typescript",
    "HTML",
    "CSS",
    "SQL",
    "Sqlite",
    "Solidity",
    "Ruby",
    "XML",
    "GraphQL",
  ];
  const technologies = [
    "React JS",
    "React Native",
    "Nodejs",
    "Next JS",
    "Flask",
    "Django",
    "Tailwind CSS",
    "Postgres",
    "Ruby on Rails",
    "Docker",
    "AWS",
    "Nginx",
    "Svelte",
    "pandas",
    "NumPy",
    "Matplotlib",
    "NLTK",
    "Kivy",
  ];

  useEffect(() => {
    if (project) {
      const params = new URLSearchParams(searchParams); // Clone the existing searchParams
      params.delete("p"); // Remove 'p' parameter

      // Update the URL without refreshing the page
      router.replace(`?${params.toString()}`, { shallow: true });
    }
  }, [project, searchParams, router]);

  const handleSelect = (data) => {
    setIsOpen(true);
    setSelectedSearch(data);
  };

  const SearchItem = ({ data }) => {
    return (
      <div
        className="font-ropaSans flex flex-row gap-x-2"
        style={{ zIndex: 10 }}
      >
        <div className="w-4/5">
          <div className="flex flex-row items-center gap-x-4">
            <div className="bg-dark-purple-300 rounded-full w-8 h-8 flex items-center justify-center">
              <div
                className="bg-no-repeat bg-cover w-5 h-5"
                style={{ backgroundImage: `url(icons/key.svg)` }}
              />
            </div>
            <div className="font-light leading-tight">
              <h2>{data.title}</h2>
              <h2 className="opacity-75 text-sm">{data.timeline}</h2>
            </div>
          </div>
          <h2
            className="text-search-blue text-xl hover:underline cursor-pointer"
            onClick={() => handleSelect(data)}
          >
            {data.headline}
          </h2>
          <h2 className="text-white opacity-50">{data.searchDescription}</h2>
        </div>

        <Image
          src={`/search-img/${data.alias}-icon.png`}
          alt={`${data.alias} icon`}
          width={96}
          height={90}
          className="rounded-md w-24 h-24"
        />
      </div>
    );
  };

  const SearchItemOpen = ({ data }) => {
    return (
      <div>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-40 flex items-center justify-center">
          <div
            className={`p-2 flex flex-col items-center h-4/5 w-11/12 md:w-4/5 lg:w-3/5 bg-accent-color rounded-lg shadow-lg z-50 transform transition-transform duration-300 ease-in-out`}
          >
            <div className="flex row w-full justify-end mb-2">
              <div
                className="bg-no-repeat bg-cover w-6 h-6"
                style={{ backgroundImage: "url(icons/exit.svg)" }}
                onClick={() => setIsOpen(false)}
              />
            </div>

            <div className="relative w-full h-2/5 md:h-3/5 rounded-lg overflow-hidden">
              <Image
                src={`/search-img/${data.alias}-banner.png`}
                alt={`${data.alias} banner`}
                layout="fill" // Ensures it takes up the full parent size
                objectFit="contain"
                priority
              />
            </div>

            <div className="flex flex-col w-full items-center justify-start h-3/5 p-4 gap-y-2 relative">
              <h2 className="w-full text-2xl">{data.title}</h2>
              <div className={`flex flex-row w-full gap-x-2`}>
                {displayQuery === "rumezas-projects" &&
                  data.links.map((link, idx) => (
                    <Link
                      className={`flex flex-row py-1.5 px-3 text-sm font-medium text-center items-center gap-x-2 rounded  border border-stone-700 transform transition-all duration-300 ${
                        link.name == "github"
                          ? "bg-dark-purple-300 hover:bg-[#4D456E] border-dark-purple-300 flex-row-reverse"
                          : "bg-white text-dark-purple-100 hover:bg-stone-200 hover:text-dark-purple-300"
                      }`}
                      key={idx}
                      href={link.link}
                      target={"_blank"}
                      onMouseEnter={() => setIsHover(true)}
                      onMouseLeave={() => setIsHover(false)}
                    >
                      <h2>{link.name}</h2>
                      <div
                        className={`bg-no-repeat bg-cover ${
                          link.name == "video" ? "w-6 h-6" : "w-4 h-4"
                        }`}
                        style={{
                          backgroundImage: `url(icons/${
                            isHover ? link.urlHover : link.url
                          })`,
                        }}
                      />
                    </Link>
                  ))}
              </div>

              <div
                className="relative w-full h-full overflow-y-scroll overflow-x-hidden text-wrap scroll-smooth"
                style={{ scrollbarWidth: "1" }}
              >
                <div className="font-thin">{data.longDescription}</div>
              </div>

              <div className="flex flex-row w-full gap-x-2">
                {data.type == "project" &&
                  data.tech.map((stack, idx) => (
                    <div
                      key={idx}
                      className="bg-white bg-opacity-10 text-accent-text text-sm p-1 rounded"
                    >
                      {stack}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full text-white font-ropaSans">
      <div className="flex flex-col w-full relative ">
        <div className="border borber-b border-[0.05rem] border-white border-opacity-10" />
        <div className="w-full flex flex-row gap-x-20 py-10">
          <div className="flex flex-col gap-y-4 px-4 md:w-1/2  lg:pl-48">
            {(displayQuery !== "why-hire-a-rumeza" &&
              displayData?.map((data, idx) => (
                <div key={idx}>
                  <SearchItem data={data} />
                </div>
              ))) || (
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-row gap-x-2 items-center">
                  <div
                    className="bg-no-repeat bg-cover w-4 h-5"
                    style={{ backgroundImage: "url(icons/star.svg)" }}
                  />
                  <h2>AI Overview</h2>
                </div>

                <div
                  className={`flex flex-col gap-y-3 relative ${
                    showMore ? "h-auto" : "h-40 overflow-y-hidden"
                  }`}
                >
                  {!showMore && (
                    <>
                      <h2>
                        <span className="bg-[#735B95] py-1">
                          I transform environments.
                        </span>
                      </h2>
                      <h2 className="">
                        <span className="bg-[#735B95]  py-1">
                          seeking global opportunities to specialize in emerging
                          technologies and apply my skills in software, project
                          management, and design thinking
                        </span>
                      </h2>
                    </>
                  )}

                  <h2>
                    Ever since I learned how to program, my life’s purpose has
                    been to use my technical expertise to transform the
                    environments around me. My technical and project management
                    skills, combined with my design-thinking approach, have
                    enabled me to consistently exceed expectations and deliver
                    impactful results.
                  </h2>

                  <h2>
                    In every role, I’ve sought unique opportunities to rise
                    above challenges and push the boundaries of what’s possible.
                    At Arcurve, I pitched and developed a recruitment feature
                    with the potential to become a critical data-collection
                    asset. Currently, as the youngest developer at Symbiotic AI,
                    I’ve been deeply involved in achieving major product
                    milestones, including deploying our platform via AWS,
                    integrating EPIC API services, and designing interfaces for
                    cardiologists to enhance revascularization decisions.
                  </h2>

                  <h2>
                    My consulting efforts with companies like CIBC and Amazon
                    Alexa have led to product ideas being considered for
                    implementation, showcasing my skill in identifying
                    opportunities and delivering value.
                  </h2>

                  <h2>
                    While my technical experiences are vast, I deeply value
                    opportunities to broaden my exposure to the challenges and
                    perspectives of diverse communities worldwide. I am seeking
                    global opportunities to specialize in emerging technologies
                    and apply my skills in software, project management, and
                    design thinking to improve lives while broadening my
                    understanding of how people around the world navigate and
                    overcome challenges.
                  </h2>

                  {!showMore && (
                    <div className="bg-gradient-to-t from-dark-purple-300 via-dark-purple-200 via-dark-purple-100 to-transparent absolute -bottom-6 h-10 w-full" />
                  )}
                </div>

                {!showMore && (
                  <div className="flex flex-col justify-end bg-gradient-to-t from-dark-purple-300 to-transparent md:px-48  absolute left-0 w-full h-28 -bottom-8">
                    <div
                      onClick={() => setShowMore(!showMore)}
                      className="mt-3 py-3 border border-accent-color w-full rounded-full md:w-2/3 lg:w-2/5 bg-dark-purple-200 flex items-center justify-center hover:bg-[#322C48] gap-x-2 cursor-pointer"
                    >
                      <h2>Show More</h2>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M18 9L12 15L6 9" stroke="#C48DF6" />
                      </svg>
                    </div>

                    <div className="border borber-b border-[0.05rem] border-accent-text border-opacity-50 w-full mt-3" />
                  </div>
                )}
              </div>
            )}
          </div>

          {displayQuery !== "why-hire-a-rumeza" && (
            <div className="hidden w-1/3 p-2 h-[40rem] border-[0.05rem] border-white border-opacity-30 shadow-xl rounded-lg md:flex flex-col gap-y-3 ">
              
              
              <img
                src={
                  displayQuery == "life"
                    ? "search-img/life.jpeg"
                    : "https://github-readme-stats.vercel.app/api/top-langs/?username=rumezaa&layout=compact&theme=nightowl&hide_border=true&exclude_repo=the-www-blog,clean-water-foundation&langs_count=6"
                }
                alt="rumezaa"
                className="w-full h-[17rem] rounded-t-lg"
              />

              {(displayQuery == "rumezas-projects" && (
                <div className="flex flex-col gap-y-3">
                  <h2 className="opacity-70 text-lg">
                    I love building impact-driven, full-stack projects.{" "}
                  </h2>
                  <h2 className="opacity-70 text-lg">
                    Currently, I'm working on specializing my technical skills
                    in ML
                  </h2>

                  <div className="flex flex-col">
                    <h2 className="uppercase tracking-wider text-sm">
                      languages
                    </h2>
                    <div className="flex flex-row flex-wrap gap-2">
                      {languages.map((stack, idx) => (
                        <div
                          key={idx}
                          className="inline-flex bg-white bg-opacity-10 text-accent-text text-sm p-1 rounded"
                        >
                          {stack}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <h2 className="uppercase tracking-wider text-sm">
                      Frameworks & Libraries
                    </h2>
                    <div className="flex flex-row flex-wrap gap-2">
                      {technologies.map((stack, idx) => (
                        <div
                          key={idx}
                          className="inline-flex bg-white bg-opacity-10 text-accent-text text-sm p-1 rounded"
                        >
                          {stack}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="flex flex-col gap-y-3 p-2">
                  <h2 className="text-xl">"Lead a life worth telling"</h2>
                  <h2 className="opacity-70 text-lg">
                    This is one of my favourite quotes of all times as it
                    continually motivates me to seek out unqiue, spontaneous
                    experiences to increase my wordly exposure.
                  </h2>
                  <h2 className="opacity-70 text-lg">
                    The following is an archive of memorable experiences where I
                    leave my comfort zone to experience something new.
                  </h2>

                  <h2 className="opacity-70 text-lg">
                    Warning: I over-romantacize my life a lot.
                  </h2>

                  <h2 className="opacity-70 text-sm">
                    (but its more fun that way)
                  </h2>
                </div>
              )}
            </div>
          )}
        </div>

        {isOpen && <SearchItemOpen data={selectedSearch} />}
      </div>

      {displayQuery == "why-hire-a-rumeza" && !showMore && (
        <div className="pl-10 md:pl-48 pt-16 flex flex-col gap-y-2">
          <h2 className="text-sm">
            Your search - <span className="font-bold">why hire a rumeza</span> -
            did not match any documents
          </h2>
          <h2 className="text-sm">Suggestions:</h2>
          <ul className="list-disc pl-5 text-sm">
            <li>
              Don't search something preposterous (everyone needs a rumeza!)
            </li>
            <li>Contact Rumeza to learn more</li>
          </ul>
        </div>
      )}
    </div>
  );
}
