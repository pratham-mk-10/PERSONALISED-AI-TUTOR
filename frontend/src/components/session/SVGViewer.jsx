const SVGViewer = ({ svg }) => {
  return (
    <div
      className="border p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default SVGViewer;