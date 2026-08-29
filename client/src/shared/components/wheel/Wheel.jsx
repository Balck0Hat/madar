import WheelBody from "./WheelBody";

export default function Wheel({ size = 330, rotate = 0, style = {}, ...props }) {
  return (
    <svg
      viewBox="-26 -26 412 412"
      width={size}
      height={typeof size === "number" ? size : undefined}
      style={{ display: "block", overflow: "visible", transform: `rotate(${rotate}deg)`, transition: "transform .9s cubic-bezier(.4,0,.2,1)", ...style }}
    >
      <WheelBody {...props} />
    </svg>
  );
}
