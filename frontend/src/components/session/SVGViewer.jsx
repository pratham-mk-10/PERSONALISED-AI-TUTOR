const SVGViewer = ({ svg, feedbackSVG, showFeedback }) => {
  return (
    <div className="relative border p-4">

      <div dangerouslySetInnerHTML={{ __html: svg }} />

      {showFeedback && (
        <div
          className="absolute top-0 left-0 w-full h-full"
          dangerouslySetInnerHTML={{ __html: feedbackSVG }}
        />
      )}
    </div>
  );
};

export default SVGViewer;