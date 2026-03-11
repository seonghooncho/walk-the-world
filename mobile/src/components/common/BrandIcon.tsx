import Svg, { Defs, Ellipse, LinearGradient, Path, Rect, Stop, Circle } from "react-native-svg";

export function BrandIcon({ size = 56 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill="none">
      <Defs>
        <LinearGradient id="bg" x1="36" y1="24" x2="220" y2="232" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#F59E0B" />
          <Stop offset="1" stopColor="#0F172A" />
        </LinearGradient>
        <LinearGradient id="trail" x1="82" y1="170" x2="198" y2="92" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FDE68A" />
          <Stop offset="1" stopColor="#FFFFFF" />
        </LinearGradient>
      </Defs>
      <Rect x="12" y="12" width="232" height="232" rx="64" fill="url(#bg)" />
      <Circle cx="128" cy="114" r="54" stroke="white" strokeWidth="10" />
      <Path d="M74 114H182" stroke="white" strokeWidth="8" strokeLinecap="round" opacity={0.9} />
      <Path d="M128 60C144 75 152 94 152 114C152 134 144 153 128 168C112 153 104 134 104 114C104 94 112 75 128 60Z" stroke="white" strokeWidth="8" strokeLinejoin="round" opacity={0.9} />
      <Path d="M95 84C108 93 148 93 161 84" stroke="white" strokeWidth="8" strokeLinecap="round" opacity={0.7} />
      <Path d="M95 144C108 135 148 135 161 144" stroke="white" strokeWidth="8" strokeLinecap="round" opacity={0.7} />
      <Path d="M82 181C106 183 112 163 128 154C145 145 157 150 172 139C182 132 188 120 194 107" stroke="url(#trail)" strokeWidth="10" strokeLinecap="round" />
      <Ellipse cx="89" cy="197" rx="12" ry="17" rotation={-20} origin="89,197" fill="#FFF7ED" />
      <Ellipse cx="106" cy="183" rx="9" ry="12" rotation={-20} origin="106,183" fill="#FFF7ED" opacity={0.92} />
      <Ellipse cx="164" cy="180" rx="12" ry="17" rotation={18} origin="164,180" fill="#FDE68A" />
      <Ellipse cx="149" cy="166" rx="9" ry="12" rotation={18} origin="149,166" fill="#FDE68A" opacity={0.92} />
    </Svg>
  );
}
