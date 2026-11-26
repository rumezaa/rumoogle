import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// Renders post bodies written in Markdown.
// remark-breaks keeps single line breaks as <br>, so text reads the way it was typed.
const components = {
  h1: (props) => <h1 className="text-3xl md:text-4xl font-semibold mt-8 mb-3 text-[#1D1B28]" {...props} />,
  h2: (props) => <h2 className="text-2xl md:text-3xl font-semibold mt-7 mb-3 text-[#1D1B28]" {...props} />,
  h3: (props) => <h3 className="text-xl md:text-2xl font-semibold mt-6 mb-2 text-[#1D1B28]" {...props} />,
  h4: (props) => <h4 className="text-lg font-semibold mt-5 mb-2 text-[#1D1B28]" {...props} />,
  p: (props) => <p className="mb-4 leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-bold text-[#1D1B28]" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  a: ({ href, ...props }) => (
    <a
      href={href}
      target={href?.startsWith("/") ? undefined : "_blank"}
      rel="noreferrer"
      className="text-[#3B5BDB] underline underline-offset-2 hover:opacity-70"
      {...props}
    />
  ),
  ul: (props) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-4 border-[#ADA6CC] pl-4 italic text-[#4D456E] my-5" {...props} />
  ),
  hr: () => <hr className="my-8 border-[#1D1B28] border-opacity-15" />,
  code: (props) => <code className="bg-black bg-opacity-5 rounded px-1.5 py-0.5 text-[0.9em]" {...props} />,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  img: (props) => <img className="rounded-lg my-5 max-w-full" {...props} />,
};

// resolveSrc lets the editor preview swap in images that were just uploaded
// but aren't deployed yet.
export default function Markdown({ children, resolveSrc }) {
  const comps = resolveSrc
    ? { ...components, img: ({ src, ...props }) => components.img({ ...props, src: resolveSrc(src) }) }
    : components;
  return (
    <div className="text-[#2B273C] text-lg font-light">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={comps}>
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
