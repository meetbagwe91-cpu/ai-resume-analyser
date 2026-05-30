interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

const LoadingSkeleton = ({ width = "100%", height = "100%", borderRadius = "0.5rem", style }: LoadingSkeletonProps) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, rgba(196,181,160,0.15) 25%, rgba(196,181,160,0.3) 50%, rgba(196,181,160,0.15) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite linear",
        ...style,
      }}
    />
  );
};

export default LoadingSkeleton;
