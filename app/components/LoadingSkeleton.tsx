interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

const LoadingSkeleton = ({
  width = "100%",
  height = "100%",
  borderRadius = "0.75rem",
  style,
}: LoadingSkeletonProps) => {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, ...style }}
    />
  );
};

export default LoadingSkeleton;
